"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, ExternalLink } from "lucide-react"
import { Application } from "@/services/application.service"
import Link from "next/link"

interface ApplicationCardProps {
  application: Application
  onViewDetails: (applicationId: string) => void
  onWithdraw?: (applicationId: string) => void
  showWithdrawButton?: boolean
}

export function ApplicationCard({
  application,
  onViewDetails,
  onWithdraw,
  showWithdrawButton = true
}: ApplicationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const getRoleLabel = (role?: string) => {
    const roleLabels = {
      member: "Thành viên",
      organizer: "Tổ chức",
      club_manager: "Quản lý CLB"
    }
    return roleLabels[role as keyof typeof roleLabels] || role || "Thành viên"
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-semibold text-lg">
                {application.club?.name || 'Không xác định'}
              </h3>
              {getStatusBadge(application.status)}
            </div>
            <p className="text-gray-600 mb-1">
              {application.campaign?.title || 'Ứng tuyển thành viên'}
            </p>
            <p className="text-sm text-gray-500">
              Nộp ngày {formatDate(application.submitted_at)}
            </p>
            {application.role && (
              <p className="text-xs text-blue-600 mt-1">
                Vai trò: {getRoleLabel(application.role)}
              </p>
            )}
            {application.rejection_reason && (
              <p className="text-sm text-red-600 mt-1">
                Lý do từ chối: {application.rejection_reason}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onViewDetails(application.id)}
            >
              <FileText className="h-4 w-4 mr-1" />
              Chi tiết
            </Button>
            {application.club?.id && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/clubs/${application.club.id}`}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Xem CLB
                </Link>
              </Button>
            )}
            {showWithdrawButton && application.status === "pending" && onWithdraw && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-red-600 hover:text-red-700"
                onClick={() => onWithdraw(application.id)}
              >
                Rút đơn
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
