"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  User,
  Mail,
  Phone,
  Users,
  Calendar,
  Settings,
  Eye,
  Trash2,
  Edit,
  QrCode,
  Download,
  ExternalLink,
  FileText,
  Heart,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { authService } from "@/services"

// Mock applications data
const mockApplications = [
  {
    id: "1",
    clubId: "photography-club",
    clubName: "CLB Nhiếp ảnh",
    position: "Thành viên",
    status: "pending",
    submittedDate: "2024-03-15",
  },
  {
    id: "2",
    clubId: "debate-club",
    clubName: "CLB Tranh luận",
    position: "Thành viên",
    status: "accepted",
    submittedDate: "2024-03-10",
  },
]

// Mock favorite events data
const mockFavoriteEvents = [
  {
    id: "workshop-photography",
    title: "Workshop Nhiếp ảnh cơ bản",
    clubName: "CLB Nhiếp ảnh",
    date: "2024-03-28",
    time: "14:00",
  },
  {
    id: "debate-competition",
    title: "Cuộc thi tranh luận liên trường",
    clubName: "CLB Tranh luận",
    date: "2024-04-05",
    time: "09:00",
  },
]

// Mock user data
const mockUserData = {
  id: "user123",
  name: "Nguyễn Văn An",
  email: "nguyenvanan@student.edu.vn",
  phone: "+84 123 456 789",
  avatar_url: "https://res.cloudinary.com/djupm4v0l/image/upload/v1718000000/sample_avatar.jpg", // ảnh thật trên Cloudinary
  join_date: "2023-09-01",
  stats: {
    clubs_joined: 3,
    events_participated: 12,
    upcoming_rsvps: 2,
  },
}

// Mock joined clubs
const mockJoinedClubs = [
  {
    club_id: "tech-club",
    name: "CLB Công nghệ thông tin",
    logo_url: "/placeholder.svg?height=60&width=60",
    join_date: "2023-09-15",
    role: "member",
    status: "active",
  },
  {
    club_id: "music-club",
    name: "CLB Âm nhạc",
    logo_url: "/placeholder.svg?height=60&width=60",
    join_date: "2023-10-01",
    role: "member",
    status: "active",
  },
  {
    club_id: "volunteer-club",
    name: "CLB Tình nguyện",
    logo_url: "/placeholder.svg?height=60&width=60",
    join_date: "2023-11-10",
    role: "manager",
    status: "active",
  },
]

// Mock event participation
const mockEventParticipation = [
  {
    event_id: "workshop-git",
    title: "Workshop Git & GitHub",
    date: "2024-07-18",
    time: "13:00",
    club_name: "CLB Công nghệ thông tin",
    status: "confirmed",
    qr_code: "QR123456",
    location: "Phòng máy tính 201",
  },
  {
    event_id: "music-concert",
    title: "Đêm nhạc mùa xuân 2024",
    date: "2024-07-20",
    time: "19:00",
    club_name: "CLB Âm nhạc",
    status: "confirmed",
    qr_code: "QR789012",
    location: "Hội trường lớn",
  },
  {
    event_id: "volunteer-activity",
    title: "Hoạt động tình nguyện",
    date: "2024-07-15",
    time: "08:00",
    club_name: "CLB Tình nguyện",
    status: "pending",
    qr_code: null,
    location: "Cộng đồng địa phương",
  },
]

export default function ProfilePage() {
  const { user, isInitialized, updateProfile, isLoading, logout } = useAuthStore()
  const router = useRouter()
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    profile_picture_url: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [eventParticipation] = useState(mockEventParticipation)
  const [joinedClubs] = useState(mockJoinedClubs)
  const [pageLoading, setPageLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Wait for auth state to be initialized before checking user
    if (!isInitialized) {
      return; // Still loading auth state, don't redirect yet
    }

    if (!user) {
      router.push("/login")
      return
    }

    // Initialize profile data when user is loaded
    setProfileData({
      full_name: user.full_name || '',
      phone: user.phone || '',
      profile_picture_url: user.profile_picture_url || ''
    })

    // Initialize userData with user from auth store
    setUserData({
      ...user,
      join_date: user.createdAt || new Date().toISOString(),
      stats: {
        clubs_joined: user.club_roles?.length || 0,
        events_participated: 0,
        upcoming_rsvps: 0
      }
    })
  }, [user, isInitialized, router])

  // Show loading spinner while auth state is being initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setPageLoading(true)
    
    const updateData: Partial<any> = {}
    
    if (editForm.name && editForm.name.trim().length >= 2) {
      updateData.full_name = editForm.name.trim()
    }
    
    if (
      editForm.phone &&
      editForm.phone.trim().length > 0 &&
      /^[\+]?[1-9][\d]{0,15}$/.test(editForm.phone.trim())
    ) {
      updateData.phone = editForm.phone.trim()
    }
    
    if (Object.keys(updateData).length > 0) {
      try {
        const success = await updateProfile(updateData)
        if (success) {
          setUserData((prev: any) => ({ ...prev, ...updateData }))
          toast({
            title: "Cập nhật thành công",
            description: "Thông tin của bạn đã được cập nhật.",
          })
        }
        setPageLoading(false)
      } catch (error) {
        setPageLoading(false)
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật thông tin.",
          variant: "destructive",
        })
      }
    }

    // Handle password change
    if (
      editForm.currentPassword &&
      editForm.newPassword &&
      editForm.newPassword === editForm.confirmPassword
    ) {
      try {
        // Call password change API here
        toast({
          title: "Mật khẩu đã được thay đổi",
          description: "Mật khẩu của bạn đã được cập nhật thành công.",
        })
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể thay đổi mật khẩu.",
          variant: "destructive",
        })
      }
    }

    setPageLoading(false)
  }

  const handleUpdateProfile = handleSubmit

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setPageLoading(true)
    
    try {
      // Simulate avatar upload
      const url = URL.createObjectURL(avatarFile)
      setUserData((prev: any) => ({ ...prev, avatar_url: url }))
      setAvatarPreview(null)
      setAvatarFile(null)
      
      toast({
        title: "Avatar đã được cập nhật",
        description: "Ảnh đại diện của bạn đã được thay đổi.",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật avatar.",
        variant: "destructive",
      })
    }
    
    setPageLoading(false)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleDeleteAccount = async () => {
    // Simulate API call
    setTimeout(() => {
      logout()
      toast({
        title: "Tài khoản đã được xóa",
        description: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.",
      })
      router.push("/")
    }, 1000)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'unsigned_avatar')
    const res = await fetch('https://api.cloudinary.com/v1_1/djupm4v0l/image/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (!data.secure_url) throw new Error('Upload thất bại')
    return data.secure_url
  }

  const handleUploadAvatar = async () => {
    if (!avatarFile) return
    setPageLoading(true)
    try {
      const url = await uploadToCloudinary(avatarFile)
      await authService.updateProfilePicture({ profile_picture_url: url })
      setUserData((prev: any) => ({ ...prev, avatar_url: url }))
      setAvatarFile(null)
      setAvatarPreview(null)
      toast({ title: 'Cập nhật avatar thành công!' })
    } catch (err: any) {
      toast({ title: 'Lỗi upload avatar', description: err.message, variant: 'destructive' })
    } finally {
      setPageLoading(false)
    }
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin và hoạt động của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={avatarPreview || userData?.profile_picture_url || "/placeholder.svg"} alt={userData?.full_name || "User"} />
                    <AvatarFallback className="bg-blue-600 text-white text-xl">
                      {getInitials(userData?.full_name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1 border shadow hover:bg-gray-100"
                    onClick={() => fileInputRef.current?.click()}
                    title="Đổi avatar"
                  >
                    <Edit className="h-5 w-5 text-blue-600" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
                {avatarPreview && (
                  <div className="mt-2 flex flex-col items-center">
                    <img src={avatarPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border mb-2" />
                    <Button size="sm" onClick={handleUploadAvatar} disabled={isLoading}>
                      {isLoading ? 'Đang lưu...' : 'Lưu avatar'}
                    </Button>
                    <Button size="sm" variant="outline" className="ml-2" onClick={() => { setAvatarFile(null); setAvatarPreview(null); }} disabled={isLoading}>
                      Hủy
                    </Button>
                  </div>
                )}
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{userData?.full_name || "User"}</h2>
                <p className="text-gray-600 text-sm mb-4">{userData?.email || "No email"}</p>
                <Badge variant="secondary" className="mb-4">
                  Thành viên từ {formatDate(userData?.join_date || "")}
                </Badge>

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Câu lạc bộ</span>
                    <span className="font-semibold">{userData?.stats?.clubs_joined || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sự kiện tham gia</span>
                    <span className="font-semibold">{userData?.stats?.events_participated || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sự kiện sắp tới</span>
                    <span className="font-semibold">{userData?.stats?.upcoming_rsvps || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="clubs">Câu lạc bộ</TabsTrigger>
                <TabsTrigger value="events">Sự kiện</TabsTrigger>
                <TabsTrigger value="settings">Cài đặt</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Thông tin cá nhân
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{userData?.email || "No email"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Số điện thoại</p>
                          <p className="font-medium">{userData?.phone || "No phone"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sự kiện sắp tới</CardTitle>
                    <CardDescription>Các sự kiện bạn đã đăng ký trong thời gian tới</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {eventParticipation
                        .filter((event) => event.status === "confirmed" && new Date(event.date) > new Date())
                        .slice(0, 3)
                        .map((event) => (
                          <div
                            key={event.event_id}
                            className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-gray-600">{event.club_name}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(event.date)} • {event.time}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              <QrCode className="h-4 w-4 mr-2" />
                              QR Code
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Application Status Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Trạng thái đơn ứng tuyển
                    </CardTitle>
                    <CardDescription>Theo dõi các đơn ứng tuyển của bạn</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockApplications.map((application) => (
                        <div
                          key={application.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{application.clubName}</h4>
                            <p className="text-sm text-gray-600">{application.position}</p>
                            <p className="text-xs text-gray-500">Nộp ngày {formatDate(application.submittedDate)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                application.status === "pending"
                                  ? "secondary"
                                  : application.status === "accepted"
                                    ? "default"
                                    : "destructive"
                              }
                            >
                              {application.status === "pending"
                                ? "Đang xử lý"
                                : application.status === "accepted"
                                  ? "Được chấp nhận"
                                  : "Bị từ chối"}
                            </Badge>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/clubs/${application.clubId}`}>Xem</Link>
                            </Button>
                            {application.status === "pending" && (
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                Hủy
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Favourite Events Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 mr-2" />
                      Sự kiện yêu thích
                    </CardTitle>
                    <CardDescription>Các sự kiện bạn đã lưu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockFavoriteEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-600">{event.clubName}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(event.date)} • {event.time}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Đăng ký ngay
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/events/${event.id}`}>Chi tiết</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Clubs Tab */}
              <TabsContent value="clubs" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Câu lạc bộ đã tham gia
                    </CardTitle>
                    <CardDescription>Danh sách các câu lạc bộ bạn là thành viên</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {joinedClubs.map((club) => (
                        <div key={club.club_id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={club.logo_url || "/placeholder.svg"} alt={club.name} />
                            <AvatarFallback>{getInitials(club.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{club.name}</h4>
                            <p className="text-sm text-gray-600">Tham gia: {formatDate(club.join_date)}</p>
                            <Badge variant={club.role === "manager" ? "default" : "secondary"} className="mt-1">
                              {club.role === "manager" ? "Quản lý" : "Thành viên"}
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/clubs/${club.club_id}`}>
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Sự kiện đã tham gia
                    </CardTitle>
                    <CardDescription>Lịch sử và trạng thái tham gia sự kiện</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {eventParticipation.map((event) => (
                        <div key={event.event_id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-gray-600">{event.club_name}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(event.date)} • {event.time} • {event.location}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={event.status === "confirmed" ? "default" : "secondary"}>
                              {event.status === "confirmed" ? "Đã xác nhận" : "Chờ xác nhận"}
                            </Badge>
                            {event.qr_code && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <QrCode className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Vé tham gia sự kiện</DialogTitle>
                                    <DialogDescription>Quét mã QR này khi tham gia sự kiện</DialogDescription>
                                  </DialogHeader>
                                  <div className="flex items-center justify-center p-6">
                                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <QrCode className="h-24 w-24 text-gray-400" />
                                    </div>
                                  </div>
                                  <DialogFooter className="sm:justify-start">
                                    <Button type="button" variant="secondary">
                                      <Download className="h-4 w-4 mr-2" />
                                      Tải xuống
                                    </Button>
                                    <Button type="button" variant="outline">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Thêm vào lịch
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Cài đặt tài khoản
                    </CardTitle>
                    <CardDescription>Chỉnh sửa thông tin cá nhân và bảo mật</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Họ và tên</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm((prev: any) => ({ ...prev, name: e.target.value }))}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Số điện thoại</Label>
                          <Input
                            id="phone"
                            value={editForm.phone}
                            onChange={(e) => setEditForm((prev: any) => ({ ...prev, phone: e.target.value }))}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={userData?.email || "No email"} disabled className="bg-gray-50" />
                        <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                      </div>

                      {isEditing && (
                        <>
                          <Separator />
                          <div className="space-y-4">
                            <h4 className="font-medium">Đổi mật khẩu (tùy chọn)</h4>
                            <div>
                              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                              <Input
                                id="currentPassword"
                                type="password"
                                value={editForm.currentPassword}
                                onChange={(e) => setEditForm((prev: any) => ({ ...prev, currentPassword: e.target.value }))}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                <Input
                                  id="newPassword"
                                  type="password"
                                  value={editForm.newPassword}
                                  onChange={(e) => setEditForm((prev: any) => ({ ...prev, newPassword: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                <Input
                                  id="confirmPassword"
                                  type="password"
                                  value={editForm.confirmPassword}
                                  onChange={(e) =>
                                    setEditForm((prev: any) => ({ ...prev, confirmPassword: e.target.value }))
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between pt-4">
                        <div>
                          {isEditing ? (
                            <div className="space-x-2">
                              <Button onClick={handleUpdateProfile} disabled={isLoading}>
                                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                              </Button>
                              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                                Hủy
                              </Button>
                            </div>
                          ) : (
                            <Button onClick={() => setIsEditing(true)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </Button>
                          )}
                        </div>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa tài khoản
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này không thể hoàn tác. Tài khoản và tất cả dữ liệu của bạn sẽ bị xóa vĩnh
                                viễn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                                Xóa tài khoản
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
