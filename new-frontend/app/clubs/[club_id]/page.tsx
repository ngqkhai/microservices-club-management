"use client"

import { useState, useEffect } from "react"
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
import { Users, Calendar, MapPin, Clock, ArrowRight, UserPlus, Eye, FileText, Target, CalendarDays } from "lucide-react"
import { EventCard } from "@/components/event-card"
import { RecruitmentCard } from "@/components/recruitment-card"
import { ClubHeader } from "@/components/club-header"
import { ActivitiesTab } from "@/components/activities-tab"
import { ApplicationForm } from "@/components/application-form"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"

// Mock club data with cover image
const mockClubData = {
  "music-club": {
    club_id: "music-club",
    name: "CLB Âm nhạc",
    description:
      "Chào mừng đến với Câu lạc bộ Âm nhạc! Chúng tôi là một cộng đồng sôi động của những người yêu âm nhạc, cùng nhau khám phá, sáng tạo và chia sẻ đam mê âm nhạc. Dù bạn là một nhạc sĩ dày dạn kinh nghiệm hay mới bắt đầu hành trình âm nhạc, câu lạc bộ của chúng tôi cung cấp một môi trường hỗ trợ nơi bạn có thể phát triển kỹ năng, hợp tác với những người khác và biểu diễn trước khán giả.",
    category: "Arts",
    members: 45,
    founded: "2019",
    meetingTime: "Thứ Tư hàng tuần 19:00",
    location: "Phòng nhạc, Trung tâm sinh viên",
    contact: "music.club@university.edu",
    isMember: false,
    logo_url: "/placeholder.svg?height=150&width=150",
    cover_url: "/placeholder.svg?height=300&width=1200",
  },
  "tech-club": {
    club_id: "tech-club",
    name: "CLB Công nghệ thông tin",
    description:
      "Câu lạc bộ Đổi mới Công nghệ là cánh cửa dẫn bạn đến thế giới công nghệ và đổi mới thú vị. Chúng tôi tập hợp những sinh viên đam mê lập trình, trí tuệ nhân tạo, phát triển web, ứng dụng di động và các công nghệ mới nổi.",
    category: "Technology",
    members: 78,
    founded: "2018",
    meetingTime: "Thứ Sáu hàng tuần 18:30",
    location: "Phòng máy tính 201",
    contact: "tech.innovation@university.edu",
    isMember: true,
    logo_url: "/placeholder.svg?height=150&width=150",
    cover_url: "/placeholder.svg?height=300&width=1200",
  },
}

// Mock activities data
const mockActivities = {
  "music-club": [
    {
      activity_id: "weekly-practice",
      title: "Luyện tập hàng tuần",
      description: "Buổi luyện tập chung cho tất cả thành viên, cải thiện kỹ năng và chuẩn bị cho các buổi biểu diễn",
      frequency: "Thứ Tư hàng tuần",
      location: "Phòng nhạc",
      time: "19:00 - 21:00",
    },
    {
      activity_id: "jam-session",
      title: "Jam Session",
      description: "Buổi chơi nhạc tự do, thành viên có thể thử nghiệm và sáng tạo cùng nhau",
      frequency: "Thứ Bảy hàng tuần",
      location: "Studio âm nhạc",
      time: "14:00 - 17:00",
    },
  ],
  "tech-club": [
    {
      activity_id: "coding-workshop",
      title: "Workshop lập trình",
      description: "Học các ngôn ngữ lập trình mới và kỹ thuật phát triển phần mềm",
      frequency: "Thứ Sáu hàng tuần",
      location: "Phòng máy tính 201",
      time: "18:30 - 20:30",
    },
  ],
}

// Mock photos data
const mockPhotos = {
  "music-club": [
    { id: 1, url: "/placeholder.svg?height=200&width=200", caption: "Buổi biểu diễn mùa xuân" },
    { id: 2, url: "/placeholder.svg?height=200&width=200", caption: "Luyện tập hàng tuần" },
    { id: 3, url: "/placeholder.svg?height=200&width=200", caption: "Workshop nhạc jazz" },
    { id: 4, url: "/placeholder.svg?height=200&width=200", caption: "Đêm nhạc acoustic" },
  ],
  "tech-club": [
    { id: 1, url: "/placeholder.svg?height=200&width=200", caption: "Hackathon 2024" },
    { id: 2, url: "/placeholder.svg?height=200&width=200", caption: "Workshop AI" },
    { id: 3, url: "/placeholder.svg?height=200&width=200", caption: "Coding bootcamp" },
    { id: 4, url: "/placeholder.svg?height=200&width=200", caption: "Tech talk" },
  ],
}

// Mock upcoming events
const mockUpcomingEvents = {
  "music-club": [
    {
      event_id: "music-concert-2024",
      title: "Spring Concert 2024",
      date: "2024-04-15",
      time: "19:00",
      location: "University Auditorium",
      club: "CLB Âm nhạc",
      fee: 0,
      description: "Annual spring concert featuring performances by club members",
    },
    {
      event_id: "jazz-workshop",
      title: "Jazz Improvisation Workshop",
      date: "2024-03-20",
      time: "18:00",
      location: "Music Room",
      club: "CLB Âm nhạc",
      fee: 15,
      description: "Learn jazz improvisation techniques with professional musicians",
    },
  ],
  "tech-club": [
    {
      event_id: "hackathon-2024",
      title: "Innovation Hackathon 2024",
      date: "2024-04-01",
      time: "09:00",
      location: "Tech Hub",
      club: "Tech Innovation Club",
      fee: 0,
      description: "48-hour hackathon to build innovative solutions",
    },
    {
      event_id: "ai-workshop",
      title: "Introduction to Machine Learning",
      date: "2024-03-25",
      time: "14:00",
      location: "Computer Lab 201",
      club: "Tech Innovation Club",
      fee: 20,
      description: "Hands-on workshop covering ML fundamentals and practical applications",
    },
  ],
}

// Mock recruitment campaigns
const mockRecruitments = {
  "music-club": [
    {
      recruitment_id: "music-spring-2024",
      title: "Spring 2024 Recruitment",
      description:
        "We're looking for passionate musicians to join our community! Whether you're a beginner or experienced player, we welcome all skill levels.",
      criteria: [
        "Passion for music",
        "Commitment to attend weekly meetings",
        "Willingness to participate in performances",
      ],
      deadline: "2024-03-30",
      status: "open",
    },
  ],
  "tech-club": [
    {
      recruitment_id: "tech-leadership-2024",
      title: "Leadership Team Recruitment",
      description:
        "Join our leadership team and help shape the future of tech education at our university. We're seeking motivated individuals with leadership experience.",
      criteria: [
        "Previous leadership experience",
        "Strong technical background",
        "Excellent communication skills",
        "Available for 10+ hours per week",
      ],
      deadline: "2024-03-25",
      status: "open",
    },
  ],
}

export default function ClubDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const clubId = params.club_id as string
  const showApplicationForm = searchParams.get("apply") === "true"

  const [club, setClub] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [recruitments, setRecruitments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    fetchClubData()
  }, [clubId])

  const fetchClubData = async () => {
    setIsLoading(true)

    // Simulate API calls
    setTimeout(() => {
      const clubData = mockClubData[clubId as keyof typeof mockClubData]
      const clubActivities = mockActivities[clubId as keyof typeof mockActivities] || []
      const clubPhotos = mockPhotos[clubId as keyof typeof mockPhotos] || []
      const events = mockUpcomingEvents[clubId as keyof typeof mockUpcomingEvents] || []
      const campaigns = mockRecruitments[clubId as keyof typeof mockRecruitments] || []

      if (clubData) {
        setClub(clubData)
        setActivities(clubActivities)
        setPhotos(clubPhotos)
        setUpcomingEvents(events)
        setRecruitments(campaigns)
      }
      setIsLoading(false)
    }, 1000)
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

    setTimeout(() => {
      setClub((prev: any) => ({ ...prev, isMember: true }))
      setIsJoining(false)
      toast({
        title: "Tham gia thành công!",
        description: `Chào mừng bạn đến với ${club.name}! Bạn sẽ nhận được thông báo về các sự kiện và hoạt động sắp tới.`,
      })
    }, 1000)
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

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy câu lạc bộ</h1>
          <p className="text-gray-600 mb-8">Câu lạc bộ bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
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
                        {club.members} thành viên
                      </div>
                    </div>
                    <CardTitle className="text-3xl">{club.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {club.isMember ? (
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Xem thành viên
                      </Button>
                    ) : (
                      <Button onClick={handleJoinClub} disabled={isJoining} className="bg-blue-600 hover:bg-blue-700">
                        <UserPlus className="h-4 w-4 mr-2" />
                        {isJoining ? "Đang tham gia..." : "Tham gia câu lạc bộ"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">{club.description}</p>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium mr-2">Thành lập:</span>
                    <span>{club.founded}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium mr-2">Họp:</span>
                    <span>{club.meetingTime}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium mr-2">Địa điểm:</span>
                    <span>{club.location}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium mr-2">Liên hệ:</span>
                    <span>{club.contact}</span>
                  </div>
                </div>
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
                        Sự kiện
                      </TabsTrigger>
                      <TabsTrigger
                        value="activities"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                      >
                        Hoạt động
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="events" className="p-6">
                    {upcomingEvents.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingEvents.map((event) => (
                          <EventCard key={event.event_id} event={event} />
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

                  <TabsContent value="activities" className="p-6">
                    <ActivitiesTab activities={activities} photos={photos} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recruitment Campaigns */}
            {recruitments.length > 0 && (
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
                    {recruitments.map((recruitment) => (
                      <RecruitmentCard
                        key={recruitment.recruitment_id}
                        recruitment={recruitment}
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
                  <span className="font-semibold">{club.members}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sự kiện sắp tới</span>
                  <span className="font-semibold">{upcomingEvents.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đang tuyển</span>
                  <span className="font-semibold">{recruitments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thành lập</span>
                  <span className="font-semibold">{club.founded}</span>
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
