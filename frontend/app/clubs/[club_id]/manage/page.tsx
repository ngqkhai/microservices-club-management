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
import { Users, Calendar, Settings, BarChart3, Plus, MapPin } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { MemberList } from "@/components/club-manager/member-list"
import { CampaignList } from "@/components/club-manager/campaign-list"
import { EventList } from "@/components/club-manager/event-list"
import { ClubStats } from "@/components/club-manager/club-stats"
import { AddMemberForm } from "@/components/club-manager/add-member-form"
import { clubService, type ClubDetail, type ClubMember } from "@/services/club.service"

export default function ClubManagerDashboard() {
  const params = useParams()
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()
  const { toast } = useToast()

  const clubId = params.club_id as string

  const [club, setClub] = useState<ClubDetail | null>(null)
  const [members, setMembers] = useState<ClubMember[]>([])
  const [campaigns, setCampaigns] = useState<ClubDetail['current_recruitments']>([])
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Wait for auth state to be initialized before checking user
    if (!isInitialized) {
      return; // Still loading auth state, don't redirect yet
    }

    // Now we can safely check if user exists
    if (!user) {
      router.push("/login")
      return
    }

    // Load basic club info first, then load tab data on demand
    fetchBasicClubData()
  }, [clubId, user, isInitialized])

  // Load data for specific tab only when accessed
  useEffect(() => {
    if (!isLoading && !loadedTabs.has(activeTab)) {
      loadTabData(activeTab)
    }
  }, [activeTab, isLoading, loadedTabs])

  const fetchBasicClubData = async () => {
    setIsLoading(true)
    try {
      // Only fetch basic club info initially
      const clubResponse = await clubService.getClubDetail(clubId)
      if (clubResponse.success && clubResponse.data) {
        setClub(clubResponse.data)
        // Don't set campaigns and members here - load them on demand
      }
      setIsLoading(false)
    } catch (error: any) {
      console.error("Error fetching basic club data:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải dữ liệu câu lạc bộ.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const loadTabData = async (tabName: string) => {
    if (loadedTabs.has(tabName)) return

    try {
      switch (tabName) {
        case "overview":
          // Overview data is already loaded with basic club data
          if (club?.current_recruitments) {
            setCampaigns(club.current_recruitments)
          }
          break

        case "events":
          if (events.length === 0) {
            // Mock events data - replace with actual API call
            const mockEvents = [
              {
                _id: "event-1",
                title: "Spring Concert 2024",
                description: "Đêm nhạc mùa xuân với các tiết mục đa dạng",
                start_date: "2024-04-15T19:00:00Z",
                end_date: "2024-04-15T21:30:00Z",
                location: "University Auditorium",
                max_participants: 300,
                current_participants: 156,
                status: "published",
                fee: 0,
                category: "Arts & Culture",
                event_type: "Concert",
                created_at: "2024-03-01T00:00:00Z",
                updated_at: "2024-03-15T00:00:00Z",
              },
              {
                _id: "event-2",
                title: "Tech Workshop: AI Basics",
                description: "Workshop về AI cơ bản cho sinh viên",
                start_date: "2024-04-20T14:00:00Z",
                end_date: "2024-04-20T17:00:00Z",
                location: "Tech Hub, Room 301",
                max_participants: 50,
                current_participants: 32,
                status: "ongoing",
                fee: 50000,
                category: "Technology",
                event_type: "Workshop",
                created_at: "2024-03-10T00:00:00Z",
                updated_at: "2024-03-10T00:00:00Z",
              },
              {
                _id: "event-3",
                title: "Football Tournament",
                description: "Giải bóng đá sinh viên mùa xuân 2024",
                start_date: "2024-04-25T08:00:00Z",
                end_date: "2024-04-25T18:00:00Z",
                location: "Sân bóng đá trường",
                max_participants: 200,
                current_participants: 180,
                status: "published",
                fee: 0,
                category: "Sports",
                event_type: "Tournament",
                created_at: "2024-03-05T00:00:00Z",
                updated_at: "2024-03-05T00:00:00Z",
              },
            ]
            setEvents(mockEvents)
          }
          break

        case "members":
          if (members.length === 0) {
            const membersResponse = await clubService.getClubMembers(clubId)
            if (membersResponse.success && membersResponse.data) {
              setMembers(membersResponse.data)
            }
          }
          break

        case "campaigns":
          // Load campaigns from API
          const campaignResponse = await clubService.getClubCampaigns(clubId, {
            page: 1,
            limit: 50
          });
          
          if (campaignResponse.success && campaignResponse.data) {
            // Transform API response to the format expected by the state
            const transformedCampaigns = campaignResponse.data.campaigns.map(campaign => ({
              id: campaign.id,
              title: campaign.title,
              description: campaign.description,
              requirements: campaign.requirements,
              start_date: campaign.start_date,
              end_date: campaign.end_date,
              max_applications: campaign.max_applications || 0,
              applications_count: campaign.statistics?.total_applications || 0,
              status: campaign.status,
            }));
            setCampaigns(transformedCampaigns);
          } else if (club?.current_recruitments) {
            // Fallback to basic club data if API fails
            setCampaigns(club.current_recruitments);
          }
          break
      }
      
      setLoadedTabs(prev => new Set([...prev, tabName]))
    } catch (error: any) {
      console.error(`Error loading ${tabName} data:`, error)
      toast({
        title: "Lỗi",
        description: `Không thể tải dữ liệu ${tabName}.`,
        variant: "destructive",
      })
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

  const handleCampaignDetailView = async (campaignId: string) => {
    try {
      const response = await clubService.getCampaignDetail(clubId, campaignId)
      
      if (response.success && response.data) {
        // Navigate to campaign detail page or show modal
        router.push(`/clubs/${clubId}/manage/campaigns/${campaignId}`)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải chi tiết chiến dịch.",
        variant: "destructive",
      })
    }
  }

  // Show loading spinner while auth state is being initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
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
                                      <TabsList className="grid w-full grid-cols-4 h-12 bg-transparent rounded-none">
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
                    <TabsTrigger
                      value="events"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Sự kiện
                    </TabsTrigger>
                  </TabsList>
                  </div>

                  <TabsContent value="overview" className="p-6">
                    {loadedTabs.has("overview") ? (
                      <ClubStats club={club} members={members} campaigns={campaigns} />
                    ) : (
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="members" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Quản lý thành viên</h3>
                      <Button onClick={() => setShowAddMemberForm(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm thành viên
                      </Button>
                    </div>
                    {loadedTabs.has("members") ? (
                      <MemberList
                        members={members.map(member => ({
                          user_id: member.user_id,
                          name: member.user_full_name || `User ${member.user_id}`, 
                          email: member.user_email || `${member.user_id}@example.com`, 
                          role: member.role,
                          joined_at: member.joined_at,
                        }))}
                        onRemoveMember={handleRemoveMember}
                        onUpdateMemberRole={handleUpdateMemberRole}
                      />
                    ) : (
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}
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
                    {loadedTabs.has("campaigns") ? (
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
                    ) : (
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="events" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Quản lý sự kiện</h3>
                      <Button
                        onClick={() => router.push(`/clubs/${clubId}/manage/events/new`)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo sự kiện
                      </Button>
                    </div>
                    {loadedTabs.has("events") ? (
                      <EventList 
                        events={events} 
                        clubId={clubId} 
                        onEventUpdate={(updatedEvents) => {
                          setEvents(updatedEvents)
                        }} 
                      />
                    ) : (
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}
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
