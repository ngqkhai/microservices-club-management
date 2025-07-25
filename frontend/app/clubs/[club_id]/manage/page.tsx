"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Users, Calendar, Settings, BarChart3, Plus } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { MemberList } from "@/components/club-manager/member-list"
import { CampaignList } from "@/components/club-manager/campaign-list"
import { ClubStats } from "@/components/club-manager/club-stats"
import { AddMemberForm } from "@/components/club-manager/add-member-form"
import { clubService, type ClubDetail, type ClubMember } from "@/services/club.service"

export default function ClubManagerDashboard() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const clubId = params.club_id as string

  const [club, setClub] = useState<ClubDetail | null>(null)
  const [members, setMembers] = useState<ClubMember[]>([])
  const [campaigns, setCampaigns] = useState<ClubDetail['current_recruitments']>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Check if user has club_manager role for this club
    if (!user) {
      router.push("/login")
      return
    }

    // In a real app, you would check user's club roles
    // For now, we'll simulate the check
    fetchClubData()
  }, [clubId, user])

  const fetchClubData = async () => {
    setIsLoading(true)

    try {
      // Fetch club details
      const clubResponse = await clubService.getClubDetail(clubId)
      if (clubResponse.success && clubResponse.data) {
        setClub(clubResponse.data)
        setCampaigns(clubResponse.data.current_recruitments)
      }

      // Fetch club members
      const membersResponse = await clubService.getClubMembers(clubId)
      if (membersResponse.success && membersResponse.data) {
        setMembers(membersResponse.data)
      }

      setIsLoading(false)
    } catch (error: any) {
      console.error("Error fetching club data:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải dữ liệu câu lạc bộ.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleAddMember = async (email: string, role: string) => {
    try {
      // Note: The API expects userId, but we only have email
      // In a real implementation, you might need to resolve email to userId first
      const response = await clubService.addClubMember(clubId, email, role as 'club_manager' | 'organizer' | 'member')
      
      if (response.success && response.data) {
        setMembers((prev) => [...prev, response.data])
        setShowAddMemberForm(false)

        toast({
          title: "Thành công",
          description: "Đã thêm thành viên mới vào câu lạc bộ.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm thành viên.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      const response = await clubService.removeClubMember(clubId, userId)
      
      if (response.success) {
        setMembers((prev) => prev.filter((member) => member.user_id !== userId))

        toast({
          title: "Thành công",
          description: "Đã xóa thành viên khỏi câu lạc bộ.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa thành viên.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateMemberRole = async (userId: string, newRole: string) => {
    try {
      const response = await clubService.updateMemberRole(clubId, userId, newRole)
      
      if (response.success && response.data) {
        setMembers((prev) => prev.map((member) => 
          member.user_id === userId ? response.data : member
        ))

        toast({
          title: "Thành công",
          description: "Đã cập nhật vai trò thành viên.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật vai trò thành viên.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-8 w-96"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Không thể tải thông tin câu lạc bộ</h1>
            <p className="mt-2 text-gray-600">Vui lòng thử lại sau.</p>
            <Button onClick={() => router.push('/clubs')} className="mt-4">
              Quay lại danh sách câu lạc bộ
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/clubs">Câu lạc bộ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/clubs/${clubId}`}>{club.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Quản lý</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý câu lạc bộ</h1>
              <p className="mt-2 text-gray-600">{club.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push(`/clubs/${clubId}`)}>
                Xem trang câu lạc bộ
              </Button>
              <Button
                onClick={() => router.push(`/clubs/${clubId}/manage/campaigns/new`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo chiến dịch mới
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="border-b">
                    <TabsList className="grid w-full grid-cols-3 h-12 bg-transparent rounded-none">
                      <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Tổng quan
                      </TabsTrigger>
                      <TabsTrigger
                        value="members"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Thành viên
                      </TabsTrigger>
                      <TabsTrigger
                        value="campaigns"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Chiến dịch
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="overview" className="p-6">
                    <ClubStats club={club} members={members} campaigns={campaigns} />
                  </TabsContent>

                  <TabsContent value="members" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Quản lý thành viên</h3>
                      <Button onClick={() => setShowAddMemberForm(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm thành viên
                      </Button>
                    </div>
                    <MemberList
                      members={members.map(member => ({
                        user_id: member.user_id,
                        name: `User ${member.user_id}`, // Temporary: API doesn't return name
                        email: `${member.user_id}@example.com`, // Temporary: API doesn't return email
                        role: member.role,
                        joined_at: member.joined_at,
                      }))}
                      onRemoveMember={handleRemoveMember}
                      onUpdateMemberRole={handleUpdateMemberRole}
                    />
                  </TabsContent>

                  <TabsContent value="campaigns" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Quản lý chiến dịch</h3>
                      <Button
                        onClick={() => router.push(`/clubs/${clubId}/manage/campaigns/new`)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo chiến dịch
                      </Button>
                    </div>
                    <CampaignList 
                      campaigns={campaigns.map(campaign => ({
                        _id: campaign.id,
                        title: campaign.title,
                        status: campaign.status,
                        start_date: campaign.start_date,
                        end_date: campaign.end_date,
                        total_applications: campaign.applications_count,
                        max_applications: campaign.max_applications,
                      }))} 
                      clubId={clubId} 
                      onCampaignUpdate={(updatedCampaigns) => {
                        // Transform back to the format expected by the state
                        setCampaigns(updatedCampaigns.map(campaign => ({
                          id: campaign._id,
                          title: campaign.title,
                          description: campaign.title, // Using title as description temporarily
                          requirements: [], // API doesn't provide requirements in campaign list
                          start_date: campaign.start_date,
                          end_date: campaign.end_date,
                          max_applications: campaign.max_applications || 0,
                          applications_count: campaign.total_applications,
                          status: campaign.status,
                        })))
                      }} 
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Club Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Thông tin câu lạc bộ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={club.logo_url || "/placeholder.svg"}
                    alt={club.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{club.name}</h4>
                    <Badge variant="secondary">{club.category}</Badge>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số thành viên:</span>
                    <span className="font-medium">{club.member_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Địa điểm:</span>
                    <span className="font-medium text-right">{club.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowAddMemberForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thành viên
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push(`/clubs/${clubId}/manage/campaigns/new`)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Tạo chiến dịch
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setActiveTab("members")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Xem thành viên
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Member Form Modal */}
      {showAddMemberForm && <AddMemberForm onClose={() => setShowAddMemberForm(false)} onAddMember={handleAddMember} />}
    </div>
  )
}
