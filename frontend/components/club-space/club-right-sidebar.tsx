"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pin, Calendar, BarChart3, ExternalLink } from "lucide-react"

interface ClubRightSidebarProps {
  clubId: string
}

// Mock sidebar data
const mockSidebarData = {
  announcements: [
    {
      id: "1",
      title: "Workshop React Advanced - Đăng ký ngay!",
      date: "2024-03-20",
      isPinned: true,
    },
    {
      id: "2",
      title: "Thay đổi lịch họp tuần này",
      date: "2024-03-18",
      isPinned: false,
    },
  ],
  upcomingEvents: [
    {
      id: "1",
      title: "Workshop React Advanced",
      date: "2024-03-25",
      time: "14:00",
    },
    {
      id: "2",
      title: "Hackathon 2024",
      date: "2024-04-01",
      time: "09:00",
    },
  ],
  stats: {
    totalMembers: 78,
    monthlyEvents: 4,
    filesShared: 23,
    activeProjects: 12,
  },
  quickLinks: [
    {
      name: "Google Drive",
      url: "https://drive.google.com/club-tech",
      icon: "📁",
    },
    {
      name: "Facebook Group",
      url: "https://facebook.com/groups/club-tech",
      icon: "📘",
    },
    {
      name: "Discord Server",
      url: "https://discord.gg/club-tech",
      icon: "💬",
    },
    {
      name: "GitHub Organization",
      url: "https://github.com/club-tech",
      icon: "🐙",
    },
  ],
}

export function ClubRightSidebar({ clubId }: ClubRightSidebarProps) {
  const data = mockSidebarData

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    })
  }

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 space-y-4 overflow-y-auto">
      {/* Recent Announcements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Pin className="h-4 w-4 mr-2" />
            Thông báo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.announcements.map((announcement) => (
            <div key={announcement.id} className="space-y-1">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium line-clamp-2">{announcement.title}</p>
                {announcement.isPinned && <Pin className="h-3 w-3 text-yellow-600 flex-shrink-0 ml-2" />}
              </div>
              <p className="text-xs text-gray-500">{formatDate(announcement.date)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Sự kiện sắp tới
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.upcomingEvents.map((event) => (
            <div key={event.id} className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium line-clamp-1">{event.title}</p>
              <p className="text-xs text-gray-600 mt-1">
                {formatEventDate(event.date)} • {event.time}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Club Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Thống kê
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{data.stats.totalMembers}</div>
              <div className="text-xs text-gray-600">Thành viên</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{data.stats.monthlyEvents}</div>
              <div className="text-xs text-gray-600">Sự kiện/tháng</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{data.stats.filesShared}</div>
              <div className="text-xs text-gray-600">Tài liệu</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">{data.stats.activeProjects}</div>
              <div className="text-xs text-gray-600">Dự án</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Liên kết nhanh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.quickLinks.map((link, index) => (
            <Button key={index} variant="ghost" className="w-full justify-start h-auto p-3 hover:bg-gray-100" asChild>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <span className="text-lg mr-3">{link.icon}</span>
                <span className="flex-1 text-left">{link.name}</span>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
