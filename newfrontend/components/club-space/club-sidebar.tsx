"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Calendar, FileText, Users, Info } from "lucide-react"

interface Club {
  club_id: string
  name: string
  logo_url: string
  members: number
  role: string
}

interface ClubSidebarProps {
  club: Club
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "discussion", label: "Thảo luận", icon: MessageCircle },
  { id: "events", label: "Sự kiện", icon: Calendar },
  { id: "resources", label: "Tài liệu", icon: FileText },
  { id: "members", label: "Thành viên", icon: Users },
  { id: "about", label: "Giới thiệu", icon: Info },
]

export function ClubSidebar({ club, activeTab, onTabChange }: ClubSidebarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadge = (role: string) => {
    if (role === "manager") {
      return <Badge className="bg-yellow-100 text-yellow-800">Quản lý</Badge>
    }
    return <Badge variant="secondary">Thành viên</Badge>
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Club Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-16 w-16">
            <AvatarImage src={club.logo_url || "/placeholder.svg"} alt={club.name} />
            <AvatarFallback className="bg-blue-600 text-white font-semibold text-lg">
              {getInitials(club.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{club.name}</h2>
            <p className="text-sm text-gray-500">{club.members} thành viên</p>
            {getRoleBadge(club.role)}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {tab.label}
              </Button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
