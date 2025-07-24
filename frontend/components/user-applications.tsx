"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Calendar, 
  Clock, 
  Users, 
  Edit3, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  ExternalLink
} from "lucide-react"
import { useUserApplications } from "@/hooks/use-campaigns"
import { useAuthStore } from "@/stores/auth-store"
import { CampaignApplication } from "@/services/campaign.service"
import { ApplicationForm } from "./application-form"
import { useToast } from "@/hooks/use-toast"

interface ApplicationCardProps {
  application: CampaignApplication
  onEdit: (application: CampaignApplication) => void
  onWithdraw: (application: CampaignApplication) => void
  onViewDetails: (application: CampaignApplication) => void
}

function ApplicationCard({ application, onEdit, onWithdraw, onViewDetails }: ApplicationCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Đang chờ</Badge>
      case "approved":
        return <Badge variant="default" className="bg-green-600">Đã duyệt</Badge>
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="h-4 w-4 text-yellow-600" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const canEdit = application.status === "pending"
  const canWithdraw = application.status === "pending"

  return (
    <Card className="border-l-4 border-l-blue-600">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(application.status)}
              <span className="truncate">{application.campaign_title}</span>
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{application.club_name}</span>
            </div>
          </div>
          {getStatusBadge(application.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Application Message Preview */}
          {application.application_message && (
            <div>
              <p className="text-sm text-gray-600 line-clamp-3">
                {application.application_message}
              </p>
            </div>
          )}

          {/* Feedback */}
          {application.feedback && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">Phản hồi:</p>
              <p className="text-sm text-blue-800">{application.feedback}</p>
            </div>
          )}

          {application.review_notes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">Ghi chú đánh giá:</p>
              <p className="text-sm text-gray-700">{application.review_notes}</p>
            </div>
          )}

          {/* Dates */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Nộp: {formatDate(application.submitted_at)}</span>
            </div>
            {application.updated_at !== application.submitted_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Cập nhật: {formatDate(application.updated_at)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(application)}
              className="flex-1 sm:flex-none"
            >
              <Eye className="h-4 w-4 mr-2" />
              Xem chi tiết
            </Button>
            
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(application)}
                className="flex-1 sm:flex-none"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
            
            {canWithdraw && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Thu hồi
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Thu hồi đơn ứng tuyển</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn thu hồi đơn ứng tuyển này? Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onWithdraw(application)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Thu hồi
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function UserApplications() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const { 
    applications, 
    pagination, 
    loading, 
    error, 
    loadApplications, 
    withdrawApplication 
  } = useUserApplications(user?.id || '')

  const [selectedTab, setSelectedTab] = useState("all")
  const [editingApplication, setEditingApplication] = useState<CampaignApplication | null>(null)
  const [viewingApplication, setViewingApplication] = useState<CampaignApplication | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadApplications()
    }
  }, [user?.id, loadApplications])

  const handleEditApplication = (application: CampaignApplication) => {
    setEditingApplication(application)
  }

  const handleWithdrawApplication = async (application: CampaignApplication) => {
    try {
      await withdrawApplication(application.campaign_id, application.id)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleViewDetails = (application: CampaignApplication) => {
    setViewingApplication(application)
  }

  const filteredApplications = applications.filter(app => {
    switch (selectedTab) {
      case "pending":
        return app.status === "pending"
      case "approved":
        return app.status === "approved"
      case "rejected":
        return app.status === "rejected"
      default:
        return true
    }
  })

  const getTabCount = (status: string) => {
    if (status === "all") return applications.length
    return applications.filter(app => app.status === status).length
  }

  if (loading && !applications.length) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error && !applications.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Có lỗi xảy ra khi tải đơn ứng tuyển: {error}</p>
          <Button 
            onClick={() => loadApplications()} 
            className="mt-4"
            variant="outline"
          >
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Đơn ứng tuyển của bạn</h2>
        <Badge variant="secondary">
          {applications.length} đơn ứng tuyển
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="relative">
            Tất cả
            {getTabCount("all") > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getTabCount("all")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Đang chờ
            {getTabCount("pending") > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getTabCount("pending")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Đã duyệt
            {getTabCount("approved") > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getTabCount("approved")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Từ chối
            {getTabCount("rejected") > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getTabCount("rejected")}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4 mt-6">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có đơn ứng tuyển nào
                </h3>
                <p className="text-gray-600">
                  {selectedTab === "all" 
                    ? "Bạn chưa nộp đơn ứng tuyển nào. Hãy tìm các câu lạc bộ thú vị để tham gia!"
                    : `Chưa có đơn ứng tuyển nào ở trạng thái ${
                        selectedTab === "pending" ? "đang chờ" :
                        selectedTab === "approved" ? "đã duyệt" : "từ chối"
                      }.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onEdit={handleEditApplication}
                  onWithdraw={handleWithdrawApplication}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Application Dialog */}
      {editingApplication && (
        <Dialog open={!!editingApplication} onOpenChange={() => setEditingApplication(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa đơn ứng tuyển</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin đơn ứng tuyển của bạn cho chiến dịch "{editingApplication.campaign_title}"
              </DialogDescription>
            </DialogHeader>
            {/* Note: The ApplicationForm would need to be modified to handle editing */}
            {/* This is a placeholder - you would need to pass campaign data here */}
            <div className="p-4 text-center text-gray-500">
              Chức năng chỉnh sửa sẽ được triển khai với component ApplicationForm đã cập nhật
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* View Application Details Dialog */}
      {viewingApplication && (
        <Dialog open={!!viewingApplication} onOpenChange={() => setViewingApplication(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn ứng tuyển</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về đơn ứng tuyển cho "{viewingApplication.campaign_title}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Trạng thái</h4>
                  <Badge
                    variant={
                      viewingApplication.status === "approved" ? "default" :
                      viewingApplication.status === "rejected" ? "destructive" : "secondary"
                    }
                    className={
                      viewingApplication.status === "approved" ? "bg-green-600" :
                      viewingApplication.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""
                    }
                  >
                    {viewingApplication.status === "pending" ? "Đang chờ" :
                     viewingApplication.status === "approved" ? "Đã duyệt" : "Từ chối"}
                  </Badge>
                </div>
              </div>

              {viewingApplication.application_message && (
                <div>
                  <h4 className="font-semibold mb-2">Thông điệp ứng tuyển</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {viewingApplication.application_message}
                  </p>
                </div>
              )}

              {viewingApplication.application_answers && 
               Object.keys(viewingApplication.application_answers).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Câu trả lời</h4>
                  <div className="space-y-3">
                    {Object.entries(viewingApplication.application_answers).map(([questionId, answer]) => (
                      <div key={questionId} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Câu hỏi {questionId}
                        </p>
                        <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(viewingApplication.feedback || viewingApplication.review_notes) && (
                <div>
                  <h4 className="font-semibold mb-2">Phản hồi từ câu lạc bộ</h4>
                  <div className="space-y-2">
                    {viewingApplication.feedback && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-800">{viewingApplication.feedback}</p>
                      </div>
                    )}
                    {viewingApplication.review_notes && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{viewingApplication.review_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-600 pt-4 border-t">
                <span>Nộp đơn: {new Date(viewingApplication.submitted_at).toLocaleString("vi-VN")}</span>
                {viewingApplication.reviewed_at && (
                  <span>Đánh giá: {new Date(viewingApplication.reviewed_at).toLocaleString("vi-VN")}</span>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
