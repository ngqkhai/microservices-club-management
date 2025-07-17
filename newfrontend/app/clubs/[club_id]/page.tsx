"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Users, Calendar, MapPin, Clock, ArrowRight, UserPlus, Eye, FileText, Target, CalendarDays, Globe, Phone, Mail, Facebook, Instagram } from "lucide-react"
import { EventCard } from "@/components/event-card"
import { RecruitmentCard } from "@/components/recruitment-card"
import { ClubHeader } from "@/components/club-header"
import { ActivitiesTab } from "@/components/activities-tab"
import { ApplicationForm } from "@/components/application-form"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { clubService, ClubDetail, Event as ApiEvent, Recruitment as ApiRecruitment } from "@/services/club.service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"

// Transform API event to component event
const transformEventForCard = (apiEvent: ApiEvent): any => {
  return {
    event_id: apiEvent.id,
    title: apiEvent.title,
    date: apiEvent.start_date || apiEvent.date || new Date().toISOString(),
    time: apiEvent.start_date ? new Date(apiEvent.start_date).toTimeString().slice(0, 5) : "00:00",
    location: apiEvent.location?.address || apiEvent.location?.room || "TBA",
    club: "Club Event",
    fee: apiEvent.participation_fee || apiEvent.fee || 0,
    description: apiEvent.short_description || apiEvent.description || "",
  }
}

// Transform API recruitment to component recruitment
const transformRecruitmentForCard = (apiRecruitment: ApiRecruitment): any => {
  return {
    recruitment_id: apiRecruitment.id,
    title: apiRecruitment.title,
    description: apiRecruitment.description,
    criteria: apiRecruitment.requirements || [],
    deadline: apiRecruitment.end_date,
    status: apiRecruitment.status,
  }
}

// API lấy các campaign tuyển thành viên đã publish của club
const fetchClubRecruitmentCampaigns = async (clubId: string) => {
  try {
    const res = await fetch(`/api/campaigns/clubs/${clubId}/published`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (e) {
    return [];
  }
};

// Component hiển thị chi tiết campaign trong popup
function CampaignDetailModal({ campaignId, open, onClose }: { campaignId: string, open: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setCampaign(null);
    fetch(`/api/campaigns/${campaignId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCampaign(data.data);
        } else {
          setError(data.message || "Không thể tải thông tin chiến dịch.");
        }
      })
      .catch(() => setError("Không thể tải thông tin chiến dịch."))
      .finally(() => setLoading(false));
  }, [campaignId, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết đợt tuyển thành viên</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Đang tải...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : campaign ? (
          <div className="space-y-4">
            <div className="text-2xl font-bold text-blue-700">{campaign.title}</div>
            <div className="text-gray-600">{campaign.description}</div>
            <div className="flex flex-wrap gap-2 text-sm mt-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Trạng thái: {campaign.status}</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Hạn nộp: {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'N/A'}</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Bắt đầu: {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'N/A'}</span>
              {campaign.max_applications && <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Tối đa: {campaign.max_applications} đơn</span>}
            </div>
            {campaign.requirements && campaign.requirements.length > 0 && (
              <div>
                <div className="font-medium mb-1">Yêu cầu:</div>
                <ul className="list-disc list-inside text-gray-700 text-sm">
                  {campaign.requirements.map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {campaign.statistics && (
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
                <span>Đơn đã nộp: {campaign.statistics.total_applications}</span>
                <span>Chờ duyệt: {campaign.statistics.pending_applications}</span>
                <span>Đã duyệt: {campaign.statistics.approved_applications}</span>
                <span>Đã từ chối: {campaign.statistics.rejected_applications}</span>
              </div>
            )}
          </div>
        ) : null}
        <DialogClose asChild>
          <Button className="mt-6 w-full" variant="default">Đóng</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export default function ClubDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const clubId = params.club_id as string
  const showApplicationForm = searchParams.get("apply") === "true"

  const [club, setClub] = useState<ClubDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clubCampaigns, setClubCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  const [openCampaignDetail, setOpenCampaignDetail] = useState<string | null>(null);

  useEffect(() => {
    fetchClubData()
  }, [clubId])

  const loadClubCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    setCampaignsError(null);
    try {
      const data = await fetchClubRecruitmentCampaigns(clubId);
      setClubCampaigns(data);
    } catch (e) {
      setCampaignsError("Không thể tải đợt tuyển thành viên.");
    } finally {
      setCampaignsLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    loadClubCampaigns();
  }, [loadClubCampaigns]);

  const fetchClubData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await clubService.getClubDetail(clubId)
      if (response.success && response.data) {
        setClub(response.data)
      } else {
        setError(response.message || 'Failed to fetch club data')
      }
    } catch (error) {
      console.error('Error fetching club data:', error)
      setError('Failed to fetch club data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinClub = async () => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để tham gia câu lạc bộ.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsJoining(true)

    try {
      await clubService.joinClub(clubId)
      toast({
        title: "Tham gia thành công!",
        description: `Chào mừng bạn đến với ${club?.name || 'câu lạc bộ'}! Bạn sẽ nhận được thông báo về các sự kiện và hoạt động sắp tới.`,
      })
      // Refetch club data to update member status
      fetchClubData()
    } catch (error) {
      console.error('Error joining club:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tham gia câu lạc bộ. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const handleApplyRecruitment = async (recruitmentId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply for recruitment.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    toast({
      title: "Application submitted!",
      description: "Your application has been submitted successfully. You'll hear back from us soon.",
    })
  }

  const handleCloseApplication = () => {
    router.replace(`/clubs/${clubId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-8 w-64"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? "Lỗi tải dữ liệu" : "Không tìm thấy câu lạc bộ"}
          </h1>
          <p className="text-gray-600 mb-8">
            {error || "Câu lạc bộ bạn đang tìm không tồn tại hoặc đã bị xóa."}
          </p>
          <Button asChild>
            <Link href="/clubs">Quay lại danh sách câu lạc bộ</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Club Header with Cover Image */}
      <ClubHeader club={club} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <BreadcrumbPage>{club.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Club Info */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{club.category}</Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {club.member_count || club.size || 0} thành viên
                      </div>
                    </div>
                    <CardTitle className="text-3xl">{club.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleJoinClub} disabled={isJoining} className="bg-blue-600 hover:bg-blue-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      {isJoining ? "Đang tham gia..." : "Tham gia câu lạc bộ"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">{club.description}</p>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {club.manager?.assigned_at && (
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Quản lý từ:</span>
                      <span>{new Date(club.manager.assigned_at).getFullYear()}</span>
                    </div>
                  )}
                  {club.status && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Trạng thái:</span>
                      <span>{club.status}</span>
                    </div>
                  )}
                  {club.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Địa điểm:</span>
                      <span>{club.location}</span>
                    </div>
                  )}
                  {club.contact_email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Email:</span>
                      <span>{club.contact_email}</span>
                    </div>
                  )}
                  {club.contact_phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Điện thoại:</span>
                      <span>{club.contact_phone}</span>
                    </div>
                  )}
                  {club.website_url && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Website:</span>
                      <a href={club.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {club.website_url}
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Social Links */}
                {club.social_links && (Object.keys(club.social_links).length > 0) && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex gap-3">
                      <span className="font-medium text-sm">Mạng xã hội:</span>
                      <div className="flex gap-2">
                        {club.social_links.facebook && (
                          <a href={club.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            <Facebook className="h-4 w-4" />
                          </a>
                        )}
                        {club.social_links.instagram && (
                          <a href={club.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
                            <Instagram className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tabs for Events and Activities */}
            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="events" className="w-full">
                  <div className="border-b">
                    <TabsList className="grid w-full grid-cols-2 h-12 bg-transparent rounded-none">
                      <TabsTrigger
                        value="events"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                      >
                        Sự kiện sắp tới
                      </TabsTrigger>
                      <TabsTrigger
                        value="recruitments"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                      >
                        Đợt tuyển thành viên
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="events" className="p-6">
                    {club.upcoming_events && club.upcoming_events.length > 0 ? (
                      <div className="space-y-4">
                        {club.upcoming_events.map((event) => (
                          <EventCard key={event.id} event={transformEventForCard(event)} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Chưa có sự kiện nào được lên lịch</p>
                        <p className="text-sm">Hãy quay lại sau để xem sự kiện mới!</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="recruitments" className="p-6">
                    {campaignsLoading ? (
                      <div className="text-center py-8 text-gray-500">Đang tải đợt tuyển thành viên...</div>
                    ) : campaignsError ? (
                      <div className="text-center py-8 text-red-500">{campaignsError}</div>
                    ) : clubCampaigns.length > 0 ? (
                      <div className="space-y-4">
                        {clubCampaigns.map((c) => (
                          <Card key={c.id} className="border-blue-100">
                            <CardContent className="py-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div>
                                <div className="font-semibold text-lg text-blue-700">{c.title}</div>
                                <div className="text-gray-500 text-sm mb-1">Hạn nộp: {c.end_date ? new Date(c.end_date).toLocaleDateString() : 'N/A'}</div>
                                <div className="text-xs text-gray-400">Trạng thái: {c.status}</div>
                              </div>
                              <Button size="sm" variant="outline" className="ml-auto" onClick={() => setOpenCampaignDetail(c.id)}>
                                Xem chi tiết
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                        {openCampaignDetail && (
                          <CampaignDetailModal
                            campaignId={openCampaignDetail}
                            open={!!openCampaignDetail}
                            onClose={() => setOpenCampaignDetail(null)}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Chưa có đợt tuyển thành viên nào</p>
                        <p className="text-sm">Hãy quay lại sau để xem các đợt tuyển mới!</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recruitment Campaigns */}
            {club.current_recruitments && club.current_recruitments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Tuyển thành viên
                  </CardTitle>
                  <CardDescription>Tham gia đội ngũ của chúng tôi! Xem các cơ hội tuyển dụng đang mở</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {club.current_recruitments.map((recruitment) => (
                      <RecruitmentCard
                        key={recruitment.id}
                        recruitment={transformRecruitmentForCard(recruitment)}
                        onApply={() => router.push(`/clubs/${clubId}?apply=true`)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê câu lạc bộ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng thành viên</span>
                  <span className="font-semibold">{club.member_count || club.size || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sự kiện sắp tới</span>
                  <span className="font-semibold">{club.upcoming_events?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đang tuyển</span>
                  <span className="font-semibold">{club.current_recruitments?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng sự kiện</span>
                  <span className="font-semibold">{club.total_events || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Related Clubs */}
            <Card>
              <CardHeader>
                <CardTitle>Câu lạc bộ tương tự</CardTitle>
                <CardDescription>Bạn có thể quan tâm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">CLB Nghệ thuật</p>
                      <p className="text-xs text-gray-500">56 thành viên</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">CLB Nhiếp ảnh</p>
                      <p className="text-xs text-gray-500">38 thành viên</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && <ApplicationForm clubId={clubId} clubName={club.name} onClose={handleCloseApplication} />}
    </div>
  )
}
