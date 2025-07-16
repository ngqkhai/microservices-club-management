"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Search, Mail, MessageCircle } from "lucide-react"

interface ClubMembersProps {
  clubId: string
}

// Mock members data
const mockMembers = [
  {
    id: "1",
    name: "Nguyễn Văn Admin",
    email: "admin@student.edu.vn",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "manager",
    joinDate: "2023-09-01",
    skills: ["React", "Node.js", "Leadership"],
    isOnline: true,
  },
  {
    id: "2",
    name: "Trần Thị Bình",
    email: "binh@student.edu.vn",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "member",
    joinDate: "2023-10-15",
    skills: ["Python", "Machine Learning"],
    isOnline: false,
  },
  {
    id: "3",
    name: "Lê Minh Cường",
    email: "cuong@student.edu.vn",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "member",
    joinDate: "2023-11-20",
    skills: ["JavaScript", "Vue.js", "Design"],
    isOnline: true,
  },
  {
    id: "4",
    name: "Phạm Thu Dung",
    email: "dung@student.edu.vn",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "moderator",
    joinDate: "2023-09-30",
    skills: ["Java", "Spring Boot", "Database"],
    isOnline: false,
  },
]

export function ClubMembers({ clubId }: ClubMembersProps) {
  const [members] = useState(mockMembers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      manager: { label: "Quản lý", className: "bg-yellow-100 text-yellow-800" },
      moderator: { label: "Điều hành", className: "bg-blue-100 text-blue-800" },
      member: { label: "Thành viên", className: "bg-gray-100 text-gray-800" },
    }
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.member
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Thành viên ({filteredMembers.length})
          </h1>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm thành viên hoặc kỹ năng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="manager">Quản lý</SelectItem>
              <SelectItem value="moderator">Điều hành</SelectItem>
              <SelectItem value="member">Thành viên</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback className="bg-blue-600 text-white">{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">{member.name}</h3>
                      {getRoleBadge(member.role)}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">Tham gia từ {formatDate(member.joinDate)}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {member.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Mail className="h-3 w-3 mr-2" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <MessageCircle className="h-3 w-3 mr-2" />
                        Nhắn tin
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Không tìm thấy thành viên nào</p>
            <p className="text-sm">Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        )}
      </div>
    </div>
  )
}
