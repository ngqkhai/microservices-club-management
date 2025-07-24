"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, Users, Clock, MapPin } from "lucide-react"
import { Campaign } from "@/services/campaign.service"

interface RecruitmentCardProps {
  campaign: Campaign
  onApply: (campaign: Campaign) => void
  showClubName?: boolean
}

export function RecruitmentCard({ campaign, onApply, showClubName = true }: RecruitmentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isDeadlineSoon = () => {
    const deadline = new Date(campaign.end_date)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  const isExpired = () => {
    const deadline = new Date(campaign.end_date)
    const now = new Date()
    return deadline.getTime() < now.getTime()
  }

  const getStatusBadge = () => {
    if (isExpired()) {
      return <Badge variant="secondary" className="bg-gray-500">Đã hết hạn</Badge>
    }
    
    switch (campaign.status) {
      case "published":
        return <Badge variant="default" className="bg-green-600">Đang mở</Badge>
      case "paused":
        return <Badge variant="secondary" className="bg-yellow-600">Tạm dừng</Badge>
      case "completed":
        return <Badge variant="secondary" className="bg-blue-600">Đã hoàn thành</Badge>
      case "draft":
        return <Badge variant="secondary">Bản nháp</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const canApply = campaign.status === "published" && !isExpired()
  const applicationProgress = campaign.max_applications 
    ? (campaign.statistics.total_applications / campaign.max_applications) * 100 
    : 0

  return (
    <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{campaign.title}</span>
            </CardTitle>
            {showClubName && campaign.club_name && (
              <div className="flex items-center gap-1 mt-1 text-sm text-blue-600">
                <MapPin className="h-4 w-4" />
                {campaign.club_name}
              </div>
            )}
            <CardDescription className="mt-2 line-clamp-3">{campaign.description}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Requirements */}
          {campaign.requirements && campaign.requirements.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-2">Yêu cầu:</h4>
              <ul className="space-y-1 max-h-20 overflow-y-auto">
                {campaign.requirements.slice(0, 3).map((requirement, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                    <span className="line-clamp-1">{requirement}</span>
                  </li>
                ))}
                {campaign.requirements.length > 3 && (
                  <li className="text-sm text-gray-500 ml-6">
                    +{campaign.requirements.length - 3} yêu cầu khác...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Application Statistics */}
          {campaign.max_applications && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Số lượng ứng tuyển:</span>
                <span className="font-medium">
                  {campaign.statistics.total_applications}/{campaign.max_applications}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    applicationProgress >= 90 ? 'bg-red-500' : 
                    applicationProgress >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(applicationProgress, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Dates and Action */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Bắt đầu: {formatDate(campaign.start_date)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span className={isDeadlineSoon() || isExpired() ? "text-red-600 font-medium" : ""}>
                  Kết thúc: {formatDate(campaign.end_date)}
                </span>
                {isDeadlineSoon() && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    Sắp hết hạn
                  </Badge>
                )}
              </div>
            </div>
            <Button
              onClick={() => onApply(campaign)}
              disabled={!canApply}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isExpired() ? "Đã hết hạn" : 
               campaign.status === "paused" ? "Tạm dừng" :
               campaign.max_applications && campaign.statistics.total_applications >= campaign.max_applications ? "Đã đầy" :
               "Ứng tuyển"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
