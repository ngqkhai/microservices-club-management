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
import { Bell, CheckCheck } from "lucide-react"

interface Notification {
  id: string
  message: string
  timestamp: string
  read: boolean
  type: "recruitment" | "event" | "application" | "general"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    message: "CLB Kỹ năng mở đợt tuyển thành viên mới!",
    timestamp: "5 phút trước",
    read: false,
    type: "recruitment",
  },
  {
    id: "2",
    message: 'Sự kiện "Workshop React" bắt đầu trong 1 giờ.',
    timestamp: "1 giờ trước",
    read: false,
    type: "event",
  },
  {
    id: "3",
    message: "Bạn đã được chấp nhận vào CLB Nhiếp ảnh.",
    timestamp: "Hôm qua",
    read: true,
    type: "application",
  },
  {
    id: "4",
    message: "CLB Âm nhạc đã đăng tài liệu mới trong Files & Resources.",
    timestamp: "2 ngày trước",
    read: false,
    type: "general",
  },
  {
    id: "5",
    message: "Đơn ứng tuyển của bạn vào CLB Công nghệ đang được xem xét.",
    timestamp: "3 ngày trước",
    read: true,
    type: "application",
  },
  {
    id: "6",
    message: 'Sự kiện "Hackathon 2024" sẽ diễn ra vào tuần tới.',
    timestamp: "1 tuần trước",
    read: false,
    type: "event",
  },
]

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "recruitment":
        return "👥"
      case "event":
        return "📅"
      case "application":
        return "📝"
      default:
        return "🔔"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Thông báo</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              <CheckCheck className="h-3 w-3 mr-1" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer border-b last:border-b-0 ${!notification.read ? "bg-blue-50" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <span className="text-lg flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                  </div>
                  {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Xem tất cả thông báo
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
