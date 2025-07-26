"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { 
  clubService, 
  type UserApplication, 
  type UserApplicationsResponse 
} from "@/services/club.service"

export default function UserApplicationsPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()
  const { toast } = useToast()

  const [applications, setApplications] = useState<UserApplication[]>([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    // Wait for auth state to be initialized before checking user
    if (!isInitialized) {
      return; // Still loading auth state, don't redirect yet
    }

    if (!user) {
      router.push("/login")
      return
    }
    fetchApplications()
  }, [user, isInitialized, statusFilter, currentPage])

  const fetchApplications = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter !== "all" && { status: statusFilter }),
      }

      const response = await clubService.getUserApplications(user.id, params)
      
      if (response.success && response.data) {
        setApplications(response.data.applications)
        setPagination(response.data.pagination)
      }
    } catch (error: any) {
      console.error("Error fetching applications:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách đơn ứng tuyển.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "default" as const,
      approved: "default" as const,
      rejected: "destructive" as const,
    }

    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || "secondary"}
        className={colors[status as keyof typeof colors] || ""}
      >
        {getStatusIcon(status)}
        <span className="ml-1">
          {status === "pending" && "Đang chờ"}
          {status === "approved" && "Đã duyệt"}
          {status === "rejected" && "Bị từ chối"}
        </span>
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show loading spinner while auth state is being initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/profile")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Đơn ứng tuyển của tôi
          </h1>
          <p className="mt-2 text-gray-600">
            Xem tất cả các đơn ứng tuyển câu lạc bộ của bạn
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Đang chờ</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Bị từ chối</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-gray-500">
              Tổng cộng: {pagination.total_items} đơn ứng tuyển
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có đơn ứng tuyển nào
                </h3>
                <p className="text-gray-600 mb-4">
                  Bạn chưa nộp đơn ứng tuyển câu lạc bộ nào.
                </p>
                <Button onClick={() => router.push("/recruitment")}>
                  Xem cơ hội tuyển dụng
                </Button>
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <img
                          src={application.club.logo || "/placeholder.svg"}
                          alt={application.club.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div>
                          <CardTitle className="text-lg">
                            {application.club.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {application.campaign.title}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(application.status)}
                      <Badge variant="outline">
                        {application.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Campaign Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Thông tin chiến dịch
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {application.campaign.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(application.campaign.start_date)} - {formatDate(application.campaign.end_date)}
                        </div>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Nội dung ứng tuyển
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {application.application_message}
                      </p>
                      
                      {application.application_answers.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">
                            Câu trả lời:
                          </h5>
                          {application.application_answers.map((answer, index) => (
                            <div key={index} className="bg-gray-50 rounded p-3">
                              <p className="text-xs font-medium text-gray-600 mb-1">
                                {answer.question}
                              </p>
                              <p className="text-sm text-gray-800">
                                {answer.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div>
                        Nộp đơn: {formatDate(application.submitted_at)}
                      </div>
                      
                      {application.status === "approved" && application.approved_at && (
                        <div>
                          Được duyệt: {formatDate(application.approved_at)}
                        </div>
                      )}
                      
                      {application.status === "rejected" && application.rejection_reason && (
                        <div className="text-red-600">
                          Lý do từ chối: {application.rejection_reason}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Trang {pagination.current_page} / {pagination.total_pages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page <= 1}
                onClick={() => setCurrentPage(pagination.current_page - 1)}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page >= pagination.total_pages}
                onClick={() => setCurrentPage(pagination.current_page + 1)}
              >
                Tiếp
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
