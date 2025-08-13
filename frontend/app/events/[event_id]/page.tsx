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
  QrCode,
  Facebook,
  Instagram
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { EventRegistrationModal } from "@/components/event-registration-modal"
import { EventComments } from "@/components/event-comments"
import { eventService } from "@/services/event.service"
import { EventQrModal } from "@/components/event-qr-modal"

type UiEvent = {
  event_id: string
  title: string
  description: string
  date: string
  start_time: string
  end_time?: string
  location: string
  detailed_location?: string
  category?: string
  event_type?: string
  club: { id: string; name: string; logo_url?: string }
  organizers: Array<{ name: string; role?: string; email?: string; phone?: string; avatar_url?: string }>
  fee: number
  max_participants: number
  current_participants: number
  registration_deadline?: string
  status?: string
  tags: string[]
  images: string[]
  event_image_url?: string
  gallery: string[]
  attachments?: Array<{ id?: string; name: string; type: string; size?: string; url?: string; description?: string }>
  requirements?: string[]
  schedule: Array<{ time: string; activity: string }>
  contact_info?: { email?: string; phone?: string; website?: string }
  social_links?: { facebook?: string; instagram?: string; discord?: string }
  statistics?: {
    total_registrations: number
    total_interested: number
    total_attended: number
  }
}

function toUiEvent(api: any): UiEvent {
  const start = api.start_date || api.startDate
  const end = api.end_date || api.endDate
  const startDt = start ? new Date(start) : null
  const endDt = end ? new Date(end) : null

  // Normalize location
  const loc = api.location
  let locationText = "TBA"
  let detailedLocation = ""
  
  if (typeof loc === "string" && loc.trim()) {
    locationText = loc
  } else if (loc && typeof loc === "object") {
    const locationType = loc.location_type || loc.type
    if (locationType === "virtual" || locationType === "online") {
      // Online event
      if (loc.platform && loc.virtual_link) {
        locationText = `${loc.platform} (Online)`
        detailedLocation = loc.virtual_link
      } else if (loc.platform) {
        locationText = `${loc.platform} (Online)`
      } else if (loc.virtual_link) {
        locationText = "Online"
        detailedLocation = loc.virtual_link
      } else {
        locationText = "Online"
      }
    } else if (locationType === "physical" || locationType === "offline") {
      // Offline event
      const parts = [loc.room, loc.address].filter(Boolean)
      locationText = parts.length ? parts.join(" - ") : "TBA"
      detailedLocation = api.detailed_location || ""
    } else {
      // Fallback for other location types
      const parts = [loc.address, loc.room, api.detailed_location].filter(Boolean)
      locationText = parts.length ? parts.join(" - ") : "TBA"
    }
  } else if (api.detailed_location) {
    locationText = api.detailed_location
  }

  const club = api.club || {}
  const organizers = api.organizers || []

  return {
    event_id: api.id || api._id,
    title: api.title,
    description: api.description || api.short_description || "",
    date: startDt ? startDt.toISOString().slice(0, 10) : "",
    start_time: startDt ? startDt.toISOString().slice(11, 16) : "",
    end_time: endDt ? endDt.toISOString().slice(11, 16) : undefined,
    location: locationText,
    detailed_location: detailedLocation,
    category: api.category,
    event_type: api.event_type,
    club: { 
      id: club.id || api.club_id || "", 
      name: club.name || "", 
      logo_url: club.logo_url || club.logo || ""
    },
    organizers: organizers.map((org: any) => ({
      name: org.name || "Ban tổ chức",
      role: org.role,
      email: api.contact_info?.email,
      phone: api.contact_info?.phone,
      avatar_url: org.avatar_url,
    })),
    fee: api.participation_fee ?? api.fee ?? 0,
    max_participants: api.max_participants ?? api.max_attendees ?? 0,
    current_participants: api.current_participants ?? api.participants_count ?? api.statistics?.total_registrations ?? 0,
    registration_deadline: api.registration_deadline,
    status: api.status,
    tags: Array.isArray(api.tags) ? api.tags : [],
    images: Array.isArray(api.images) ? api.images : [],
    event_image_url: api.event_image_url || api.images[0],
    gallery: Array.isArray(api.images) ? api.images : [],
    attachments: Array.isArray(api.attachments) ? api.attachments : [],
    requirements: Array.isArray(api.requirements) ? api.requirements : [],
    schedule: Array.isArray(api.agenda)
      ? api.agenda.map((a: any) => ({ time: a.time, activity: a.activity }))
      : [],
    contact_info: api.contact_info,
    social_links: api.social_links,
    statistics: api.statistics,
  }
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
  const [relatedEvents, setRelatedEvents] = useState<UiEvent[]>([])
  const [isRelatedLoading, setIsRelatedLoading] = useState(false)
  const [showQr, setShowQr] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setIsLoading(true)
      try {
        const res = await eventService.getEvent(eventId)
        if (mounted && res.success && res.data) {
          const ui = toUiEvent(res.data)
          setEvent(ui)
          // Initialize user-specific status if available
          const userStatus = (res.data as any).user_status
          if (userStatus) {
            setIsRegistered(userStatus.registration_status === 'registered' || userStatus.registration_status === 'attended')
            setIsFavorited(!!userStatus.is_favorited)
          } else if (user) {
            // Fallback: fetch status explicitly
            try {
              const st = await eventService.getUserEventStatus(eventId)
              if (st.success && (st.data as any)) {
                setIsRegistered(st.data.registration_status === 'registered' || st.data.registration_status === 'attended')
                setIsFavorited(!!st.data.is_favorited)
              }
            } catch {}
          }
        } else if (mounted) {
          setEvent(null)
        }
      } catch (e) {
        if (mounted) setEvent(null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [eventId])

  // Load related events: 2 by same category + 3 by same club
  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!event) return
      setIsRelatedLoading(true)
      try {
        const relatedEvents: any[] = []
        
        // Get 2 events by same category
        if (event.category) {
          const categoryRes = await eventService.getEvents({ 
            page: 1, 
            limit: 5, 
            category: event.category, 
            filter: 'all' 
          })
          if (categoryRes.success && categoryRes.data?.events) {
            const categoryEvents = categoryRes.data.events
              .map(toUiEvent)
              .filter((e) => e.event_id !== event.event_id)
              .slice(0, 2)
            relatedEvents.push(...categoryEvents)
          }
        }

        // Get 3 events by same club
        if (event.club?.id) {
          const clubRes = await eventService.getEvents({ 
            page: 1, 
            limit: 5, 
            club_id: event.club.id, 
            filter: 'all' 
          })
          if (clubRes.success && clubRes.data?.events) {
            const clubEvents = clubRes.data.events
              .map(toUiEvent)
              .filter((e) => e.event_id !== event.event_id)
              .slice(0, 3)
            relatedEvents.push(...clubEvents)
          }
        }

        // Remove duplicates and limit to 5 total
        const uniqueEvents = relatedEvents.filter((event, index, self) => 
          index === self.findIndex(e => e.event_id === event.event_id)
        ).slice(0, 5)

        if (mounted) setRelatedEvents(uniqueEvents)
      } catch (_) {
        if (mounted) setRelatedEvents([])
      } finally {
        if (mounted) setIsRelatedLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [event])

  const handleRegister = async () => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để đăng ký tham gia sự kiện.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (isRegistrationExpired) {
      toast({
        title: "Không thể đăng ký",
        description: "Thời gian đăng ký đã hết hạn.",
        variant: "destructive",
      })
      return
    }

    if (isEventFull) {
      toast({
        title: "Không thể đăng ký",
        description: "Sự kiện đã đầy.",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await eventService.joinEvent(event.event_id)
      if (res.success) {
        // Refresh status from server to avoid stale UI
        const st = await eventService.getUserEventStatus(event.event_id)
        if (st.success) {
          setIsRegistered(st.data.registration_status === 'registered' || st.data.registration_status === 'attended')
        } else {
          setIsRegistered(true)
        }
        toast({ title: "Đăng ký thành công!" })
      }
    } catch {
      toast({ title: "Lỗi", description: "Không thể đăng ký tham gia", variant: "destructive" })
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để lưu sự kiện yêu thích.",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await eventService.toggleFavorite(event.event_id)
      if (res.success) {
        const fav = res.data?.is_favorited ?? !isFavorited
        setIsFavorited(fav)
    toast({
          title: fav ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích",
          description: `Sự kiện "${event.title}" ${fav ? "đã được thêm vào" : "đã được bỏ khỏi"} danh sách yêu thích`,
    })
      }
    } catch {
      toast({ title: "Lỗi", description: "Không thể cập nhật yêu thích", variant: "destructive" })
    }
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

  const totalRegistrations = event?.statistics?.total_registrations ?? event?.current_participants ?? 0
  const isEventFull = totalRegistrations >= (event?.max_participants ?? 0)
  const spotsLeft = event ? (event.max_participants ?? 0) - totalRegistrations : 0
  const registrationProgress = event ? (totalRegistrations / (event.max_participants ?? 1)) * 100 : 0
  
  // Check if registration deadline has passed
  const now = new Date()
  const registrationDeadline = event?.registration_deadline ? new Date(event.registration_deadline) : null
  const isRegistrationExpired = registrationDeadline ? now > registrationDeadline : false
  const canRegister = !isEventFull && !isRegistrationExpired && !isRegistered

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
            <img src={event.event_image_url || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
            {/* Enhanced overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-white/25 text-white border-white/40 backdrop-blur-sm shadow-lg">
                  <Tag className="h-3 w-3 mr-1" />
                  {event.category}
                </Badge>
                {event.event_type && (
                  <Badge variant="secondary" className="bg-white/25 text-white border-white/40 backdrop-blur-sm shadow-lg">
                    {event.event_type}
                  </Badge>
                )}
                {event.tags.slice(0, 3).map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-white/25 text-white border-white/40 backdrop-blur-sm shadow-lg">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {event.title}
              </h1>
              <p className="text-white text-lg drop-shadow-md">
                Được tổ chức bởi {event.club.name || `Club ${event.club.id}`}
              </p>
            </div>
          </div>

          {/* Event Actions */}
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={event.club.logo_url || "/placeholder.svg"} alt={event.club.name || `Club ${event.club.id}`} />
                  <AvatarFallback>{(event.club.name || event.club.id)[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/clubs/${event.club.id}`}
                    className="font-medium text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    {event.club.name || `Club ${event.club.id}`}
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                  <p className="text-sm text-gray-500">
                    Tổ chức bởi {event.organizers.slice(0, 3).map((org: any) => org.name).join(", ")}
                    {event.organizers.length > 3 && ` và ${event.organizers.length - 3} người khác`}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 w-full sm:w-auto">
                <Button
                  onClick={handleRegister}
                  disabled={!canRegister}
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
                  ) : isRegistrationExpired ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Hết hạn đăng ký
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Đăng ký tham gia
                    </>
                  )}
                </Button>

                {isRegistered && (
                  <Button variant="outline" onClick={async () => {
                    try {
                      await eventService.leaveEvent(event.event_id)
                      const st = await eventService.getUserEventStatus(event.event_id)
                      if (st.success) {
                        setIsRegistered(st.data.registration_status === 'registered' || st.data.registration_status === 'attended')
                      } else {
                        setIsRegistered(false)
                      }
                      toast({ title: 'Đã rời sự kiện' })
                    } catch {
                      toast({ title: 'Lỗi', description: 'Không thể rời sự kiện', variant: 'destructive' })
                    }
                  }}>
                    Rời sự kiện
                  </Button>
                )}

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
                      <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Yêu cầu tham gia
                      </CardTitle>
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
                {(event.contact_info?.email || event.contact_info?.phone || event.contact_info?.website) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Thông tin liên hệ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Organizers info - display up to 3 organizers */}
                        {event.organizers.slice(0, 3).map((organizer: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{organizer.name}</p>
                              <p className="text-sm text-gray-500">{organizer.role}</p>
                            </div>
                          </div>
                        ))}
                        {event.organizers.length > 3 && (
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-500">
                                và {event.organizers.length - 3} người tổ chức khác
                              </p>
                            </div>
                          </div>
                        )}

                        {event.contact_info?.email && (
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
                        )}

                        {event.contact_info?.phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">Điện thoại</p>
                              <a href={`tel:${event.contact_info.phone}`} className="text-sm text-blue-600 hover:underline">
                                {event.contact_info.phone}
                              </a>
                            </div>
                          </div>
                        )}

                        {event.contact_info?.website && (
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
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                    {/* <div className="text-sm text-gray-500 space-y-1">
                      <p className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Bắt đầu: {formatTime(event.start_time)}
                      </p>
                      <p className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Kết thúc: {event.end_time ? formatTime(event.end_time) : "Chưa xác định"}
                      </p>
                    </div> */}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    {event.detailed_location && (
                      <p className="text-sm text-gray-500">
                        {event.detailed_location.startsWith('http') ? (
                          <a 
                            href={event.detailed_location} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {event.detailed_location}
                          </a>
                        ) : (
                          event.detailed_location
                        )}
                      </p>
                    )}
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
                      {totalRegistrations}/{event.max_participants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${registrationProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isEventFull ? "Sự kiện đã đầy" : isRegistrationExpired ? "Đã hết hạn đăng ký" : `Còn ${spotsLeft} chỗ trống`}
                  </p>
                </div>

                {/* Registration Deadline */}
                <div className={`rounded-lg p-3 border ${
                  isRegistrationExpired 
                    ? "bg-red-50 border-red-200" 
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                  <div className="flex items-center">
                    <Clock className={`h-4 w-4 mr-2 ${
                      isRegistrationExpired ? "text-red-600" : "text-yellow-600"
                    }`} />
                    <div>
                      <p className={`text-sm font-medium ${
                        isRegistrationExpired ? "text-red-800" : "text-yellow-800"
                      }`}>
                        {isRegistrationExpired ? "Đã hết hạn đăng ký" : "Hạn đăng ký"}
                      </p>
                      <p className={`text-sm ${
                        isRegistrationExpired ? "text-red-700" : "text-yellow-700"
                      }`}>
                        {new Date(event.registration_deadline).toLocaleDateString("vi-VN")}
                      </p>
                      {isRegistrationExpired && (
                        <p className="text-xs text-red-600 mt-1">
                          Không thể đăng ký sau thời gian này
                        </p>
                      )}
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
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                      >
                        <Facebook className="h-4 w-4" />
                        <span className="text-sm">
                          {event.social_links.facebook.includes('facebook.com/') 
                            ? event.social_links.facebook.split('facebook.com/')[1]?.split('/')[0] || event.social_links.facebook
                            : event.social_links.facebook}
                        </span>
                      </a>
                    )}
                    {event.social_links.instagram && (
                      <a
                        href={event.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-pink-600 hover:text-pink-800"
                      >
                        <Instagram className="h-4 w-4" />
                        <span className="text-sm">
                          {event.social_links.instagram.includes('instagram.com/') 
                            ? event.social_links.instagram.split('instagram.com/')[1]?.split('/')[0] || event.social_links.instagram
                            : event.social_links.instagram}
                        </span>
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
                        <span className="text-sm">
                          {event.social_links.discord.includes('discord.gg/') 
                            ? event.social_links.discord.split('discord.gg/')[1] || event.social_links.discord
                            : event.social_links.discord}
                        </span>
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
                {isRelatedLoading ? (
                  <div className="space-y-3 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-14 bg-gray-100 rounded" />
                    ))}
                  </div>
                ) : relatedEvents.length > 0 ? (
                <div className="space-y-3">
                    {relatedEvents.map((re) => (
                      <Link key={re.event_id} href={`/events/${re.event_id}`} className="block">
                  <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <h4 className="font-medium text-sm truncate">{re.title}</h4>
                          <p className="text-xs text-gray-500 truncate">
                            {re.club?.name || `Club ${re.club?.id}` || 'Câu lạc bộ'} • {re.date}
                          </p>
                  </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Chưa có sự kiện liên quan</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* QR modal trigger and modal when registered */}
        {isRegistered && (
          <div className="fixed bottom-6 right-6">
            <Button variant="outline" onClick={() => setShowQr(true)}>
              <QrCode className="h-4 w-4 mr-2" /> Vé/QR
            </Button>
            <EventQrModal eventId={event.event_id} open={showQr} onOpenChange={setShowQr} />
          </div>
        )}
      </div>
    </div>
  )
}
