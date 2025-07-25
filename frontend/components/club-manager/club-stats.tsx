"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Target, Calendar, TrendingUp } from "lucide-react"
import { ClubDetail, ClubMember } from "@/services/club.service"

interface ClubStatsProps {
  club: ClubDetail
  members: ClubMember[]
  campaigns: ClubDetail['current_recruitments']
}

export function ClubStats({ club, members, campaigns }: ClubStatsProps) {
  const totalMembers = members?.length || 0
  const activeCampaigns = campaigns?.filter((c) => c.status === "published").length || 0
  const completedCampaigns = campaigns?.filter((c) => c.status === "completed").length || 0
  const totalApplications = campaigns?.reduce((sum, c) => sum + (c.applications_count || 0), 0) || 0

  const membersByRole = (members || []).reduce((acc: Record<string, number>, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1
    return acc
  }, {})

  const campaignsByStatus = (campaigns || []).reduce((acc: Record<string, number>, campaign) => {
    acc[campaign.status] = (acc[campaign.status] || 0) + 1
    return acc
  }, {})

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "club_manager":
        return "Quản lý"
      case "organizer":
        return "Tổ chức"
      case "member":
        return "Thành viên"
      default:
        return role
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published":
        return "Đã xuất bản"
      case "draft":
        return "Bản nháp"
      case "paused":
        return "Tạm dừng"
      case "completed":
        return "Hoàn thành"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng thành viên</p>
                <p className="text-2xl font-bold">{totalMembers}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiến dịch đang hoạt động</p>
                <p className="text-2xl font-bold">{activeCampaigns}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiến dịch hoàn thành</p>
                <p className="text-2xl font-bold">{completedCampaigns}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đơn ứng tuyển</p>
                <p className="text-2xl font-bold">{totalApplications}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố thành viên theo vai trò</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(membersByRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{getRoleLabel(role)}</Badge>
                    <span className="text-sm text-gray-600">{count as number} thành viên</span>
                  </div>
                  <Progress value={totalMembers > 0 ? ((count as number) / totalMembers) * 100 : 0} className="w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái chiến dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(campaignsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{getStatusLabel(status)}</Badge>
                    <span className="text-sm text-gray-600">{count as number} chiến dịch</span>
                  </div>
                  <Progress value={campaigns && campaigns.length > 0 ? ((count as number) / campaigns.length) * 100 : 0} className="w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Club Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin câu lạc bộ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tên câu lạc bộ</p>
              <p className="text-lg">{club?.name || 'Không có tên'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Thể loại</p>
              <Badge variant="secondary">{club?.category || 'Không xác định'}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Địa điểm</p>
              <p className="text-sm">{club?.location || 'Không có địa điểm'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Số thành viên</p>
              <p className="text-lg font-semibold">{club?.member_count || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Mô tả</p>
            <p className="text-sm text-gray-700">{club?.description || 'Không có mô tả'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
