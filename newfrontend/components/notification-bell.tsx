"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock } from "lucide-react"

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    message: "CLB Kỹ năng mở đợt tuyển thành viên mới!",
    timestamp: "5 phút trước",
    isRead: false,
    type: "recruitment",
  },
  {
    id: "2",
    message: "Sự kiện Workshop React bắt đầu trong 1 giờ.",
    timestamp: "1 giờ trước",
    isRead: false,
    type: "event",
  },
  {
    id: "3",
    message: "Bạn đã được chấp nhận vào CLB Nhiếp ảnh.",
    timestamp: "Hôm qua",
    isRead: true,
    type: "application",
  },
  {
    id: "4",
    message: "CLB Âm nhạc đã đăng bài viết mới trong Discussion.",
    timestamp: "2 ngày trước",
    isRead: true,
    type: "post",
  },
  {
    id: "5",
    message: "Nhắc nhở: Sự kiện Hackathon 2024 diễn ra vào tuần tới.",
    timestamp: "3 ngày trước",
    isRead: true,
    type: "reminder",
  },
  {
    id: "6",
    message: "CLB Tình nguyện mời bạn tham gia hoạt động dọn dẹp bãi biển.",
    timestamp: "1 tuần trước",
    isRead: true,
    type: "invitation",
  },
]

export function NotificationBell() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "recruitment":
        return "🎯"
      case "event":
        return "📅"
      case "application":
        return "✅"
      case "post":
        return "💬"
      case "reminder":
        return "⏰"
      case "invitation":
        return "🤝"
      default:
        return "📢"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end" forceMount>
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Thông báo</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-blue-600 hover:text-blue-700">
              Đánh dấu đã đọc
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer hover:bg-gray-50 ${!notification.isRead ? "bg-blue-50" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="text-lg flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? "font-medium" : ""} line-clamp-2`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {notification.timestamp}
                    </div>
                  </div>
                  {!notification.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Không có thông báo mới</p>
            </div>
          )}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-3 text-center text-blue-600 hover:text-blue-700 cursor-pointer">
          Xem tất cả thông báo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
