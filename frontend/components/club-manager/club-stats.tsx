"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Target, Calendar, TrendingUp } from "lucide-react"
import { ClubDetail, ClubMember } from "@/services/club.service"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ClubStatsProps {
  club: ClubDetail
  members: ClubMember[]
  campaigns: ClubDetail['current_recruitments']
}

export function ClubStats({ club, members, campaigns }: ClubStatsProps) {
  const totalMembers = members?.length || 0
  const totalEvents = club["total_events"] || 0
  const publishedEvents = club["published_events_count"] || 0
  const completedEvents = club["completed_events_count"] || 0
  const totalRequirements = club["total_recruitments"] || 0
  const activeRecruitments = club["active_recruitments"] || 0
  const inactiveRecruitments = totalRequirements - activeRecruitments
  const totalApplications = campaigns?.reduce((sum, c) => sum + (c.applications_count || 0), 0) || 0

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

  const membersByRole = (members || []).reduce((acc: Record<string, number>, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1
    return acc
  }, {})

  // Data for pie chart
  const pieChartData = Object.entries(membersByRole).map(([role, count]) => ({
    name: getRoleLabel(role),
    value: count as number,
    role: role
  }))

  // Data for bar chart - recruitment status
  const recruitmentStatusData = [
    {
      name: 'Hoạt động',
      count: activeRecruitments,
      fill: '#10b981'
    },
    {
      name: 'Không hoạt động',
      count: inactiveRecruitments,
      fill: '#6b7280'
    }
  ]

  // Data for bar chart - applications by campaign
  const campaignApplicationsData = (campaigns || []).map((campaign) => ({
    // Get 2 first words of the title or fallback to a default name
    name: campaign.title.split(" ").slice(0, 2).join(" ") || `Đợt tuyển ${campaign.id.slice(-4)}`,
    applications: campaign.applications_count || 0,
    status: getStatusLabel(campaign.status),
    fill: campaign.status === 'active' ? '#3b82f6' : '#f59e0b'
  }))

  // Colors for pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

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
                <p className="text-sm font-medium text-gray-600">Tổng số sự kiện</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
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
                <p className="text-sm font-medium text-gray-600">Tổng số đợt tuyển</p>
                <p className="text-2xl font-bold">{totalRequirements}</p>
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
        {/* Event Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái các sự kiện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Đang diễn ra</Badge>
                  <span className="text-sm text-gray-600">{publishedEvents} sự kiện</span>
                </div>
                <Progress value={totalEvents > 0 ? (publishedEvents / totalEvents) * 100 : 0} className="w-24" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Đã diễn ra</Badge>
                  <span className="text-sm text-gray-600">{completedEvents} sự kiện</span>
                </div>
                <Progress value={totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0} className="w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái các đợt tuyển</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">        
              {/* Traditional Progress View */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Hoạt động</Badge>
                    <span className="text-sm text-gray-600">{activeRecruitments} đợt tuyển</span>
                  </div>
                  <Progress value={totalRequirements > 0 ? (activeRecruitments / totalRequirements) * 100 : 0} className="w-24" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Không hoạt động</Badge>
                    <span className="text-sm text-gray-600">{inactiveRecruitments} đợt tuyển</span>
                  </div>
                  <Progress value={totalRequirements > 0 ? (inactiveRecruitments / totalRequirements) * 100 : 0} className="w-24" />
                </div>
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
              {/* Pie Chart */}
              {pieChartData.length > 0 && (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          percent && percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                        }
                        outerRadius={57}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {/* Traditional List View */}
              {/* <div className="space-y-2">
                {Object.entries(membersByRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{getRoleLabel(role)}</Badge>
                      <span className="text-sm text-gray-600">{count as number} thành viên</span>
                    </div>
                    <Progress value={totalMembers > 0 ? ((count as number) / totalMembers) * 100 : 0} className="w-24" />
                  </div>
                ))}
              </div> */}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Applications Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Số đơn ứng tuyển (đợt đang hoạt động)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bar Chart for Applications */}
              {campaignApplicationsData.length > 0 && (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaignApplicationsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} đơn ứng tuyển`,
                          `Trạng thái: ${props.payload.status}`
                        ]}
                      />
                      <Bar dataKey="applications" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {/* Traditional List View */}
              {/* <div className="space-y-2">
                {(campaigns || []).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{getStatusLabel(campaign.status)}</Badge>
                      <span className="text-sm text-gray-600">{campaign.applications_count || 0} đơn ứng tuyển</span>
                    </div>
                    <Progress value={totalApplications > 0 ? ((campaign.applications_count || 0) / totalApplications) * 100 : 0} className="w-24" />
                  </div>
                ))}
              </div> */}
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
