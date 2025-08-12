"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileText, Calendar, Users, MessageSquare, AlertCircle } from "lucide-react"
import { applicationService, Application } from "@/services/application.service"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface ApplicationDetailDialogProps {
  applicationId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplicationUpdated?: (application: Application) => void
}

export function ApplicationDetailDialog({
  applicationId,
  open,
  onOpenChange,
  onApplicationUpdated
}: ApplicationDetailDialogProps) {
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && applicationId) {
      loadApplication()
    }
  }, [open, applicationId])

  const loadApplication = async () => {
    if (!applicationId) return
    
    setLoading(true)
    try {
      const response = await applicationService.getApplication(applicationId)
      if (response.success) {
        setApplication(response.data)
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Không thể tải thông tin đơn ứng tuyển.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải thông tin đơn ứng tuyển.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      active: "default",
      rejected: "destructive",
      withdrawn: "outline"
    } as const

    const labels = {
      pending: "Đang xử lý",
      active: "Được chấp nhận",
      rejected: "Bị từ chối",
      withdrawn: "Đã rút"
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  if (!application && !loading) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Chi tiết đơn ứng tuyển
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về đơn ứng tuyển của bạn
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : application ? (
          <div className="space-y-6">
            {/* Club Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Thông tin câu lạc bộ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    {application.club?.logo ? (
                      <img 
                        src={application.club.logo} 
                        alt={application.club.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <Users className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{application.club?.name || 'Không xác định'}</h3>
                    <p className="text-sm text-gray-600">{application.club?.description}</p>
                    {application.club?.id && (
                      <Button size="sm" variant="outline" asChild className="mt-2">
                        <Link href={`/clubs/${application.club.id}`}>
                          Xem câu lạc bộ
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Information */}
            {application.campaign && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Thông tin chiến dịch tuyển thành viên
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">{application.campaign.title}</h4>
                      <p className="text-sm text-gray-600">{application.campaign.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Ngày bắt đầu:</span>
                        <p>{formatDate(application.campaign.start_date)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Ngày kết thúc:</span>
                        <p>{formatDate(application.campaign.end_date)}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{application.campaign.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đơn ứng tuyển</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Trạng thái:</span>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Ngày nộp đơn:</span>
                    <span className="text-sm">{formatDate(application.submitted_at)}</span>
                  </div>

                  {application.approved_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Ngày phê duyệt:</span>
                      <span className="text-sm">{formatDate(application.approved_at)}</span>
                    </div>
                  )}

                  {application.role && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Vai trò được giao:</span>
                      <Badge variant="outline">{application.role}</Badge>
                    </div>
                  )}

                  {application.application_message && (
                    <div>
                      <span className="text-sm text-gray-500 block mb-2">Lời nhắn:</span>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">{application.application_message}</p>
                      </div>
                    </div>
                  )}

                  {application.rejection_reason && (
                    <div>
                      <span className="text-sm text-gray-500 block mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                        Lý do từ chối:
                      </span>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-700">{application.rejection_reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Application Answers */}
            {application.application_answers && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Câu trả lời
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.isArray(application.application_answers.answers) ? 
                      application.application_answers.answers.map((answer: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <h4 className="font-medium text-sm">Câu hỏi {index + 1}</h4>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm">{answer.answer}</p>
                          </div>
                        </div>
                      ))
                      : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Không có câu trả lời</p>
                        </div>
                      )
                    }
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
