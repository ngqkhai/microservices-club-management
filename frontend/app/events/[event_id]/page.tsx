"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Heart,
  Share2,
  ArrowLeft,
  ExternalLink,
  User,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  Info,
  Camera,
  Download,
  FileText,
  ImageIcon,
  Tag,
  CalendarDays,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { EventRegistrationModal } from "@/components/event-registration-modal"
import { EventComments } from "@/components/event-comments"

// Mock event data with enhanced information
const mockEventData = {
  "spring-concert-2024": {
    event_id: "spring-concert-2024",
    title: "Spring Concert 2024",
    description: `Chào mừng đến với Đêm nhạc mùa xuân 2024 - sự kiện âm nhạc lớn nhất trong năm của CLB Âm nhạc!

Đây là dịp để các thành viên câu lạc bộ thể hiện tài năng âm nhạc đa dạng qua các thể loại từ cổ điển, jazz đến nhạc đương đại. Chương trình hứa hẹn mang đến những màn trình diễn đầy cảm xúc và chuyên nghiệp.

Chương trình bao gồm:
• Biểu diễn solo piano và violin
• Tiết mục hòa tấu nhạc cổ điển
• Jazz ensemble performance
• Acoustic guitar và vocal
• Nhạc đương đại với ban nhạc đầy đủ

Sự kiện hoàn toàn miễn phí và mở cửa cho tất cả sinh viên và giảng viên trong trường. Hãy đến và cùng chúng tôi tận hưởng một đêm nhạc tuyệt vời!`,
    date: "2024-04-15",
    start_time: "19:00",
    end_time: "21:30",
    location: "University Auditorium",
    detailed_location: "Hội trường lớn, Tầng 2, Tòa nhà chính",
    category: "Arts & Culture",
    event_type: "Concert",
    club: {
      id: "music-club",
      name: "CLB Âm nhạc",
      logo_url: "/placeholder.svg?height=64&width=64",
    },
    organizer: {
      name: "Nguyễn Thị Lan Anh",
      role: "Trưởng ban tổ chức",
      email: "lananh@music.club",
      phone: "+84 987 654 321",
      avatar_url: "/placeholder.svg?height=48&width=48",
    },
    fee: 0,
    max_participants: 300,
    current_participants: 156,
    registration_deadline: "2024-04-10",
    status: "open",
    tags: ["Âm nhạc", "Biểu diễn", "Miễn phí", "Sinh viên"],
    image_url: "/placeholder.svg?height=400&width=800",
    gallery: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    attachments: [
      {
        id: "1",
        name: "Chương trình biểu diễn chi tiết.pdf",
        type: "pdf",
        size: "2.5 MB",
        url: "/placeholder.pdf",
        description: "Danh sách các tiết mục và thời gian biểu diễn",
      },
      {
        id: "2",
        name: "Hướng dẫn tham gia sự kiện.docx",
        type: "docx",
        size: "1.2 MB",
        url: "/placeholder.docx",
        description: "Thông tin chi tiết về quy định và hướng dẫn",
      },
      {
        id: "3",
        name: "Bản đồ địa điểm.jpg",
        type: "image",
        size: "800 KB",
        url: "/placeholder.svg?height=600&width=800",
        description: "Sơ đồ đường đi đến hội trường",
      },
    ],
    requirements: [
      "Sinh viên hoặc giảng viên của trường",
      "Đăng ký trước ngày 10/04/2024",
      "Tuân thủ quy định về trang phục lịch sự",
    ],
    schedule: [
      { time: "19:00", activity: "Chào mừng và giới thiệu" },
      { time: "19:15", activity: "Biểu diễn solo piano" },
      { time: "19:45", activity: "Hòa tấu nhạc cổ điển" },
      { time: "20:15", activity: "Giải lao" },
      { time: "20:30", activity: "Jazz ensemble" },
      { time: "21:00", activity: "Acoustic performance" },
      { time: "21:30", activity: "Kết thúc chương trình" },
    ],
    contact_info: {
      email: "events@music.club",
      phone: "+84 123 456 789",
      website: "https://music.club.university.edu",
    },
    social_links: {
      facebook: "https://facebook.com/musicclub.university",
      instagram: "https://instagram.com/musicclub_uni",
    },
    created_at: "2024-03-01",
    updated_at: "2024-03-15",
  },
  "hackathon-2024": {
    event_id: "hackathon-2024",
    title: "Innovation Hackathon 2024",
    description: `Tham gia cuộc thi lập trình 48 giờ lớn nhất trong năm! Innovation Hackathon 2024 là nơi các lập trình viên, nhà thiết kế và những người đam mê công nghệ cùng nhau tạo ra những giải pháp sáng tạo cho các vấn đề thực tế.

Chủ đề năm nay: "Technology for Sustainable Future"

Các track thi đấu:
• Web Development
• Mobile App Development  
• AI/Machine Learning
• IoT & Hardware
• Blockchain & Fintech

Giải thưởng hấp dẫn:
🥇 Giải Nhất: 50,000,000 VNĐ + Cơ hội thực tập tại các công ty công nghệ hàng đầu
🥈 Giải Nhì: 30,000,000 VNĐ + Voucher khóa học online
🥉 Giải Ba: 20,000,000 VNĐ + Thiết bị công nghệ
🏆 Giải Đặc biệt: 15,000,000 VNĐ cho giải pháp sáng tạo nhất

Sự kiện bao gồm:
• Workshop từ các chuyên gia
• Mentoring 1-1 với senior developers
• Networking với các công ty công nghệ
• Ăn uống miễn phí suốt 48 giờ`,
    date: "2024-04-01",
    start_time: "09:00",
    end_time: "2024-04-03T17:00",
    location: "Tech Hub",
    detailed_location: "Tầng 3-4, Tòa nhà Công nghệ, Khu A",
    category: "Technology",
    event_type: "Competition",
    club: {
      id: "tech-club",
      name: "Tech Innovation Club",
      logo_url: "/placeholder.svg?height=64&width=64",
    },
    organizer: {
      name: "Trần Minh Đức",
      role: "Tech Lead",
      email: "duc@tech.club",
      phone: "+84 901 234 567",
      avatar_url: "/placeholder.svg?height=48&width=48",
    },
    fee: 0,
    max_participants: 200,
    current_participants: 178,
    registration_deadline: "2024-03-25",
    status: "open",
    tags: ["Lập trình", "Hackathon", "Công nghệ", "Giải thưởng"],
    image_url: "/placeholder.svg?height=400&width=800",
    gallery: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    attachments: [
      {
        id: "1",
        name: "Hackathon Rules & Guidelines.pdf",
        type: "pdf",
        size: "3.2 MB",
        url: "/placeholder.pdf",
        description: "Quy định cuộc thi và hướng dẫn tham gia",
      },
      {
        id: "2",
        name: "API Documentation.zip",
        type: "zip",
        size: "15.8 MB",
        url: "/placeholder.zip",
        description: "Tài liệu API và SDK cho các track thi đấu",
      },
      {
        id: "3",
        name: "Sponsor Information.pptx",
        type: "pptx",
        size: "4.1 MB",
        url: "/placeholder.pptx",
        description: "Thông tin về các nhà tài trợ và đối tác",
      },
      {
        id: "4",
        name: "Tech Stack Templates.zip",
        type: "zip",
        size: "25.6 MB",
        url: "/placeholder.zip",
        description: "Template code và boilerplate cho các công nghệ",
      },
    ],
    requirements: [
      "Sinh viên đại học hoặc cao đẳng",
      "Có kinh nghiệm lập trình cơ bản",
      "Tham gia theo nhóm 2-4 người",
      "Mang theo laptop và thiết bị cần thiết",
    ],
    schedule: [
      { time: "09:00 - 01/04", activity: "Check-in và breakfast" },
      { time: "10:00 - 01/04", activity: "Opening ceremony & Team formation" },
      { time: "11:00 - 01/04", activity: "Hackathon bắt đầu" },
      { time: "12:30 - 01/04", activity: "Lunch break" },
      { time: "15:00 - 01/04", activity: "Workshop: AI/ML fundamentals" },
      { time: "18:00 - 01/04", activity: "Dinner & Networking" },
      { time: "20:00 - 01/04", activity: "Mentoring sessions" },
      { time: "08:00 - 02/04", activity: "Breakfast" },
      { time: "12:00 - 02/04", activity: "Lunch" },
      { time: "15:00 - 02/04", activity: "Workshop: Pitching skills" },
      { time: "18:00 - 02/04", activity: "Dinner" },
      { time: "09:00 - 03/04", activity: "Final preparations" },
      { time: "13:00 - 03/04", activity: "Project presentations" },
      { time: "16:00 - 03/04", activity: "Awards ceremony" },
      { time: "17:00 - 03/04", activity: "Closing & Networking" },
    ],
    contact_info: {
      email: "hackathon@tech.club",
      phone: "+84 987 123 456",
      website: "https://hackathon.tech.club",
    },
    social_links: {
      facebook: "https://facebook.com/techclub.hackathon",
      instagram: "https://instagram.com/techclub_hackathon",
      discord: "https://discord.gg/techclub",
    },
    created_at: "2024-02-15",
    updated_at: "2024-03-20",
  },
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const eventId = params.event_id as string
  const [event, setEvent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const eventData = mockEventData[eventId as keyof typeof mockEventData]
      if (eventData) {
        setEvent(eventData)
        // Mock check if user is registered/favorited
        setIsRegistered(Math.random() > 0.7)
        setIsFavorited(Math.random() > 0.5)
      }
      setIsLoading(false)
    }, 1000)
  }, [eventId])

  const handleRegister = () => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để đăng ký tham gia sự kiện.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setShowRegistrationModal(true)
  }

  const handleToggleFavorite = () => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để lưu sự kiện yêu thích.",
        variant: "destructive",
      })
      return
    }

    setIsFavorited(!isFavorited)
    toast({
      title: isFavorited ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích",
      description: `Sự kiện "${event.title}" ${isFavorited ? "đã được bỏ khỏi" : "đã được thêm vào"} danh sách yêu thích`,
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Đã sao chép liên kết",
      description: "Liên kết sự kiện đã được sao chép vào clipboard",
    })
  }

  const handleDownloadAttachment = (attachment: any) => {
    // Simulate download
    toast({
      title: "Đang tải xuống",
      description: `Đang tải "${attachment.name}"...`,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    if (timeString.includes("T")) {
      return new Date(timeString).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    }
    const [hours, minutes] = timeString.split(":")
    return `${hours}:${minutes}`
  }

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString)
    const [hours, minutes] = timeString.split(":")
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
    return date.toLocaleString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "📄"
      case "docx":
      case "doc":
        return "📝"
      case "pptx":
      case "ppt":
        return "📊"
      case "zip":
      case "rar":
        return "🗜️"
      case "image":
      case "jpg":
      case "png":
        return "🖼️"
      default:
        return "📎"
    }
  }

  const isEventFull = event?.current_participants >= event?.max_participants
  const spotsLeft = event ? event.max_participants - event.current_participants : 0
  const registrationProgress = event ? (event.current_participants / event.max_participants) * 100 : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-8 w-64"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sự kiện</h1>
          <p className="text-gray-600 mb-8">Sự kiện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Button onClick={() => router.push("/events")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách sự kiện
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/events">Sự kiện</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{event.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {/* Event Image */}
          <div className="relative h-64 md:h-80">
            <img src={event.image_url || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Tag className="h-3 w-3 mr-1" />
                  {event.category}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {event.event_type}
                </Badge>
                {event.tags.slice(0, 3).map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
              <p className="text-white/90 text-lg">Được tổ chức bởi {event.club.name}</p>
            </div>
          </div>

          {/* Event Actions */}
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={event.club.logo_url || "/placeholder.svg"} alt={event.club.name} />
                  <AvatarFallback>{event.club.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/clubs/${event.club.id}`}
                    className="font-medium text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    {event.club.name}
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                  <p className="text-sm text-gray-500">Tổ chức bởi {event.organizer.name}</p>
                </div>
              </div>

              <div className="flex space-x-3 w-full sm:w-auto">
                <Button
                  onClick={handleRegister}
                  disabled={isEventFull || isRegistered}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                >
                  {isRegistered ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Đã đăng ký
                    </>
                  ) : isEventFull ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Đã đầy
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Đăng ký tham gia
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={handleToggleFavorite} className="bg-transparent">
                  <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                  {isFavorited ? "Đã yêu thích" : "Yêu thích"}
                </Button>

                <Button variant="outline" onClick={handleShare} className="bg-transparent">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="schedule">Lịch trình</TabsTrigger>
                <TabsTrigger value="media">Hình ảnh</TabsTrigger>
                <TabsTrigger value="attachments">Tài liệu</TabsTrigger>
                <TabsTrigger value="comments">Bình luận</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Event Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="h-5 w-5 mr-2" />
                      Mô tả sự kiện
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      {event.description.split("\n").map((paragraph: string, index: number) => (
                        <p key={index} className="text-gray-700 leading-relaxed mb-3">
                          {paragraph.trim()}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Requirements */}
                {event.requirements && event.requirements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Yêu cầu tham gia</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {event.requirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin liên hệ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{event.organizer.name}</p>
                          <p className="text-sm text-gray-500">{event.organizer.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Email</p>
                          <a
                            href={`mailto:${event.contact_info.email}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {event.contact_info.email}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Điện thoại</p>
                          <a href={`tel:${event.contact_info.phone}`} className="text-sm text-blue-600 hover:underline">
                            {event.contact_info.phone}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">Website</p>
                          <a
                            href={event.contact_info.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {event.contact_info.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>Lịch trình sự kiện</CardTitle>
                    <CardDescription>Chi tiết các hoạt động trong sự kiện</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {event.schedule.map((item: any, index: number) => (
                        <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                          <div className="flex-shrink-0 w-24 text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {item.time}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900">{item.activity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Hình ảnh sự kiện
                    </CardTitle>
                    <CardDescription>Bộ sưu tập hình ảnh từ các sự kiện trước</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {event.gallery.map((image: string, index: number) => (
                        <div
                          key={index}
                          className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity group relative"
                          onClick={() => setSelectedImage(image)}
                        >
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Event gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                            <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Image Modal */}
                {selectedImage && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImage(null)}
                  >
                    <div className="max-w-4xl max-h-full">
                      <img
                        src={selectedImage || "/placeholder.svg"}
                        alt="Event image"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="attachments">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Tài liệu đính kèm
                    </CardTitle>
                    <CardDescription>Tài liệu hướng dẫn và thông tin bổ sung</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {event.attachments && event.attachments.length > 0 ? (
                        event.attachments.map((attachment: any) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{getFileIcon(attachment.type)}</span>
                              <div>
                                <h4 className="font-medium text-gray-900">{attachment.name}</h4>
                                <p className="text-sm text-gray-500">{attachment.description}</p>
                                <p className="text-xs text-gray-400">{attachment.size}</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadAttachment(attachment)}
                              className="flex items-center"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Tải xuống
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Chưa có tài liệu đính kèm</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments">
                <EventComments eventId={event.event_id} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Event Info */}
          <div className="space-y-6">
            {/* Event Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Thông tin sự kiện
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event Category & Type */}
                <div className="flex items-center space-x-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{event.category}</p>
                    <p className="text-sm text-gray-500">{event.event_type}</p>
                  </div>
                </div>

                <Separator />

                {/* Date & Time */}
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{formatDate(event.date)}</p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Bắt đầu: {formatTime(event.start_time)}
                      </p>
                      <p className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Kết thúc: {event.end_time ? formatTime(event.end_time) : "Chưa xác định"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-sm text-gray-500">{event.detailed_location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {event.fee === 0 ? "Miễn phí" : `${event.fee.toLocaleString("vi-VN")} VNĐ`}
                    </p>
                    <p className="text-sm text-gray-500">Phí tham gia</p>
                  </div>
                </div>

                <Separator />

                {/* Registration Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Đăng ký</span>
                    <span className="text-sm text-gray-500">
                      {event.current_participants}/{event.max_participants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${registrationProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isEventFull ? "Sự kiện đã đầy" : `Còn ${spotsLeft} chỗ trống`}
                  </p>
                </div>

                {/* Registration Deadline */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Hạn đăng ký</p>
                      <p className="text-sm text-yellow-700">
                        {new Date(event.registration_deadline).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            {event.social_links && (
              <Card>
                <CardHeader>
                  <CardTitle>Theo dõi sự kiện</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {event.social_links.facebook && (
                      <a
                        href={event.social_links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                      >
                        <span>📘</span>
                        <span>Facebook</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {event.social_links.instagram && (
                      <a
                        href={event.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-pink-600 hover:text-pink-700"
                      >
                        <span>📷</span>
                        <span>Instagram</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {event.social_links.discord && (
                      <a
                        href={event.social_links.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
                      >
                        <span>💬</span>
                        <span>Discord</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Events */}
            <Card>
              <CardHeader>
                <CardTitle>Sự kiện liên quan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium text-sm">Jazz Workshop</h4>
                    <p className="text-xs text-gray-500">CLB Âm nhạc • 20/03/2024</p>
                  </div>
                  <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium text-sm">AI Workshop</h4>
                    <p className="text-xs text-gray-500">Tech Innovation Club • 25/03/2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Registration Modal */}
        <EventRegistrationModal
          event={event}
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={() => {
            setIsRegistered(true)
            setShowRegistrationModal(false)
            toast({
              title: "Đăng ký thành công!",
              description: `Bạn đã đăng ký tham gia sự kiện "${event.title}"`,
            })
          }}
        />
      </div>
    </div>
  )
}
