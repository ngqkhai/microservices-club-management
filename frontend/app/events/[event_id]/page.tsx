"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
  Instagram,
  Euro,
  Banknote
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
      name: org.user_full_name || "Ban tổ chức",
      role: org.role.split("_").map((r: string) => r.charAt(0).toUpperCase() + r.slice(1)).join(" "),
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

  // Function to get appropriate currency icon
  const getCurrencyIcon = (currency?: string) => {
    return <Banknote className="h-5 w-5 text-green-600" />
  }

  // Fetch event data and user status
  useEffect(() => {
    if (!eventId) return // Early return if no eventId
    
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
  }, [eventId]) // Only depend on eventId

  // Fetch user status separately when user changes
  useEffect(() => {
    if (!user || !eventId) return
    
    let mounted = true
    ;(async () => {
      try {
        const st = await eventService.getUserEventStatus(eventId)
        if (mounted && st.success && (st.data as any)) {
          setIsRegistered(st.data.registration_status === 'registered' || st.data.registration_status === 'attended')
          setIsFavorited(!!st.data.is_favorited)
        }
      } catch {}
    })()
    return () => {
      mounted = false
    }
  }, [user, eventId])

  // Load related events: 2 by same category + 3 by same club
  useEffect(() => {
    if (!event?.event_id) return // Add early return to prevent unnecessary fetches
    
    let mounted = true
    ;(async () => {
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
  }, [event?.event_id, event?.category, event?.club?.id]) // More specific dependencies

  const handleRegister = useCallback(async () => {
    if (!user) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để đăng ký tham gia sự kiện.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Calculate these values inline to avoid dependency issues
    const totalRegistrations = event?.statistics?.total_registrations ?? event?.current_participants ?? 0
    const isEventFull = totalRegistrations >= (event?.max_participants ?? 0)
    const now = new Date()
    const registrationDeadline = event?.registration_deadline ? new Date(event.registration_deadline) : null
    const isRegistrationExpired = registrationDeadline ? now > registrationDeadline : false

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
        // Update local state directly instead of fetching again
        setIsRegistered(true)
        toast({ title: "Đăng ký thành công!" })
      }
    } catch {
      toast({ title: "Lỗi", description: "Không thể đăng ký tham gia", variant: "destructive" })
    }
  }, [user, event, toast, router])

  const handleToggleFavorite = useCallback(async () => {
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
  }, [user, event?.event_id, event?.title, isFavorited, toast])

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

  // Memoized calculations to prevent unnecessary re-renders
  const { totalRegistrations, isEventFull, spotsLeft, registrationProgress, isRegistrationExpired, canRegister } = useMemo(() => {
    const totalRegistrations = event?.statistics?.total_registrations ?? event?.current_participants ?? 0
    const isEventFull = totalRegistrations >= (event?.max_participants ?? 0)
    const spotsLeft = event ? (event.max_participants ?? 0) - totalRegistrations : 0
    const registrationProgress = event ? (totalRegistrations / (event.max_participants ?? 1)) * 100 : 0
    
    // Check if registration deadline has passed
    const now = new Date()
    const registrationDeadline = event?.registration_deadline ? new Date(event.registration_deadline) : null
    const isRegistrationExpired = registrationDeadline ? now > registrationDeadline : false
    const canRegister = !isEventFull && !isRegistrationExpired && !isRegistered
    
    return {
      totalRegistrations,
      isEventFull,
      spotsLeft,
      registrationProgress,
      isRegistrationExpired,
      canRegister
    }
  }, [event?.statistics?.total_registrations, event?.current_participants, event?.max_participants, event?.registration_deadline, isRegistered])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      {/* Event Cover Image & Header */}
      <div className="relative w-full h-96 md:h-[500px]">
        <img 
          src={event.event_image_url || "/placeholder.svg"} 
          alt={event.title} 
          className="w-full h-full object-cover" 
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Content Overlay Container - Same width as main content */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {/* Top Section - Navigation and Action Buttons */}
          <div className="bg-gradient-to-b from-black/60 via-black/30 to-transparent pt-6 pb-4">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Breadcrumb and Back Button */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.back()} 
                    className="text-white hover:bg-white/20 p-2 h-auto w-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <Breadcrumb className="text-white">
                    <BreadcrumbList className="text-sm">
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/" className="text-white/90 hover:text-white">
                          Trang chủ
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="text-white/60" />
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/events" className="text-white/90 hover:text-white">
                          Sự kiện
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="text-white/60" />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-white font-medium">
                          {event.title.length > 30 ? event.title.substring(0, 30) + '...' : event.title}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                {/* Action Buttons - Top Right */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleFavorite}
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Event Info */}
          <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-4 pb-6">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                             {/* Status Badges and Tags */}
               <div className="flex flex-wrap gap-2 mb-4">
                 <Badge className="bg-blue-600 text-white border-0">
                   {event.status === 'upcoming' ? 'Sắp diễn ra' : 
                    event.status === 'ongoing' ? 'Đang diễn ra' : 
                    event.status === 'completed' ? 'Đã kết thúc' : 'Sắp diễn ra'}
                 </Badge>
                 {event.event_type && (
                   <Badge className="bg-gray-800 text-white border-0">
                     {event.event_type}
                   </Badge>
                 )}
                 {event.tags && event.tags.length > 0 && event.tags.slice(0, 3).map((tag: string, index: number) => (
                   <Badge 
                     key={index} 
                     className="bg-purple-100 text-purple-700 border-0 font-medium"
                   >
                     {tag}
                   </Badge>
                 ))}
                 {event.tags && event.tags.length > 3 && (
                   <Badge className="bg-purple-100 text-purple-700 border-0 font-medium">
                     +{event.tags.length - 3}
                   </Badge>
                 )}
               </div>

              {/* Event Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
                {event.title}
              </h1>

              {/* Event Description */}
              <p className="text-white/90 text-lg mb-4 drop-shadow-md max-w-2xl">
                {event.description.split('\n')[0]}
              </p>

                             {/* Organizer Info and Register Button */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <Avatar className="h-10 w-10 border-2 border-white/20">
                     <AvatarImage src={event.club.logo_url || "/placeholder.svg"} alt={event.club.name} />
                     <AvatarFallback className="bg-white/20 text-white">
                       {(event.club.name || event.club.id)[0]}
                     </AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="text-white font-medium">
                       Tổ chức bởi {event.club.name || `Club ${event.club.id}`}
                     </p>
                     <p className="text-white/80 text-sm">
                       {event.organizers.slice(0, 2).map((org: any) => org.name).join(", ")}
                       {event.organizers.length > 2 && ` và ${event.organizers.length - 2} người khác`}
                     </p>
                   </div>
                 </div>

                 {/* Register Button */}
                 <div className="flex gap-2">
                   <Button
                     onClick={handleRegister}
                     disabled={!canRegister}
                     className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
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
                     <Button 
                       variant="outline" 
                       onClick={async () => {
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
                       }}
                       className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                     >
                       Rời sự kiện
                     </Button>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </div>


      </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Chi tiết</TabsTrigger>
                  <TabsTrigger value="schedule" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Lịch trình</TabsTrigger>
                  <TabsTrigger value="media" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Thư viện</TabsTrigger>
                  <TabsTrigger value="comments" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Bình luận</TabsTrigger>
                </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Event Description */}
                <Card className="bg-white rounded-xl shadow-sm border-0">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">
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
                  <Card className="bg-white rounded-xl shadow-sm border-0">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-900">
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
                  <Card className="bg-white rounded-xl shadow-sm border-0">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-900">
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
                <Card className="bg-white rounded-xl shadow-sm border-0">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">Lịch trình sự kiện</CardTitle>
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
                <Card className="bg-white rounded-xl shadow-sm border-0">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">
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
                <Card className="bg-white rounded-xl shadow-sm border-0">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">
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
            <Card className="bg-white rounded-xl shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Thông tin sự kiện
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date */}
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(event.date)}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.start_time}
                      {event.end_time && ` - ${event.end_time}`}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{event.location}</p>
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

                {/* Fee */}
                <div className="flex items-center space-x-3">
                  <Banknote className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.fee === 0 ? "Miễn phí" : event.fee_display || `${event.fee.toLocaleString("vi-VN")} VNĐ`}
                    </p>
                  </div>
                </div>

                {/* Registration Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">Số người tham gia</span>
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
                    {Math.round(registrationProgress)}% đã đăng ký
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            {event.social_links && (
              <Card className="bg-white rounded-xl shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Theo dõi sự kiện</CardTitle>
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
            <Card className="bg-white rounded-xl shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Sự kiện liên quan</CardTitle>
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
