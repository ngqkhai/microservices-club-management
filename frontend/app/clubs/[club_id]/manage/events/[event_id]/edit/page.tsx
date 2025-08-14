"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Tag,
  ImageIcon,
  FileText,
  Save,
  X,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { eventService, type UpdateEventRequest } from "@/services/event.service"
import { imageService } from "@/services/image.service"

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const clubId = params.club_id as string
  const eventId = params.event_id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    category: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    location: "",
    detailed_location: "",
    max_participants: "",
    participation_fee: "",
    currency: "VND",
    requirements: [""] as string[],
    tags: [""] as string[],
    organizers: [{ id: "", name: "", role: "organizer" }] as Array<{ id: string; name: string; role: string }>,
    agenda: [{ time: "", activity: "" }] as Array<{ time: string; activity: string }>,
    contact_info: { email: "", phone: "", website: "" },
    social_links: { facebook: "", instagram: "", discord: "" },
    is_public: true,
    allow_registration: true,
    registration_deadline: "",
    status: "draft" as 'draft' | 'published' | 'cancelled' | 'completed',
    visibility: "public" as 'public' | 'club_members',
    location_type: "physical" as 'physical' | 'virtual' | 'hybrid',
    virtual_link: "",
    platform: "",
    // File handling
    event_logo: null as File | null,
    event_image: null as File | null,
    images: [] as File[],
    attachments: [] as File[],
    // URLs from uploaded files
    event_logo_url: "",
    event_image_url: "",
    image_urls: [] as string[],
    attachment_data: [] as Array<{ name: string; url: string; type: string; size: number }>,
  })

  useEffect(() => {
    loadEventData()
  }, [eventId])

  const loadEventData = async () => {
    setIsLoading(true)
    try {
      const res = await eventService.getEvent(eventId)
      if (res.success && res.data) {
        const e: any = res.data
        const startRaw = e.start_date || e.startDate
        const endRaw = e.end_date || e.endDate
        const start = startRaw ? new Date(startRaw) : null
        const end = endRaw ? new Date(endRaw) : null
        const toDateInput = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "")
        const toTimeInput = (d: Date | null) => (d ? d.toISOString().slice(11, 16) : "")

        setFormData({
          title: e.title || "",
          description: e.description || "",
          short_description: e.short_description || "",
          category: e.category || "",
          start_date: toDateInput(start),
          start_time: toTimeInput(start),
          end_date: toDateInput(end),
          end_time: toTimeInput(end),
          // Xử lý location dựa trên location_type
          location: e.location?.location_type === 'virtual' ? e.location?.virtual_link || '' :
                   e.location?.location_type === 'hybrid' ? e.location?.address || '' :
                   typeof e.location === 'string' ? e.location : (e.location?.address || ''),
          detailed_location: e.location?.room || e.detailed_location || "",
          max_participants: String(e.max_participants ?? e.max_attendees ?? ""),
          participation_fee: String(e.participation_fee ?? e.fee ?? ""),
          currency: e.currency || "VND",
          requirements: Array.isArray(e.requirements) && e.requirements.length ? e.requirements : [""],
          tags: Array.isArray(e.tags) && e.tags.length ? e.tags : [""],
          organizers: Array.isArray(e.organizers) && e.organizers.length ? 
            e.organizers.map((org: any) => ({ 
              id: org.user_id || org.id || "", 
              name: org.user_full_name || org.name || "", 
              role: org.role || "organizer" 
            })) : [{ id: "", name: "", role: "organizer" }],
          agenda: Array.isArray(e.agenda) && e.agenda.length ? e.agenda : [{ time: "", activity: "" }],
          contact_info: e.contact_info || { email: "", phone: "", website: "" },
          social_links: e.social_links || { facebook: "", instagram: "", discord: "" },
          is_public: e.visibility ? e.visibility === 'public' : true,
          allow_registration: e.allow_registration ?? true,
          registration_deadline: e.registration_deadline ? new Date(e.registration_deadline).toISOString().slice(0,16) : "",
          status: e.status || "draft",
          visibility: e.visibility || "public",
          location_type: e.location?.location_type || "physical",
          virtual_link: e.location?.location_type === 'hybrid' ? e.location?.virtual_link || "" : "",
          platform: e.location?.platform || "",
          // File handling
          event_logo: null,
          event_image: null,
          images: [],
          attachments: [],
          // URLs from uploaded files
          event_logo_url: e.event_logo_url || "",
          event_image_url: e.event_image_url || "",
          image_urls: Array.isArray(e.images) ? e.images : [],
          attachment_data: Array.isArray(e.attachments) ? e.attachments : [],
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin sự kiện.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleArrayChange = (field: 'requirements' | 'tags', index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) =>
        i === index ? value : item
      ),
    }))
  }

  const addArrayItem = (field: 'requirements' | 'tags' | 'organizers' | 'agenda') => {
    setFormData((prev) => {
      if (field === 'organizers') {
        return {
          ...prev,
          organizers: [...prev.organizers, { id: "", name: "", role: "organizer" }],
        }
      } else if (field === 'agenda') {
        return {
          ...prev,
          agenda: [...prev.agenda, { time: "", activity: "" }],
        }
      } else {
        return {
          ...prev,
          [field]: [...prev[field], ""],
        }
      }
    })
  }

  const removeArrayItem = (field: 'requirements' | 'tags' | 'organizers' | 'agenda', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }))
  }

  const handleOrganizerChange = (index: number, field: 'id' | 'name' | 'role', value: string) => {
    setFormData((prev) => ({
      ...prev,
      organizers: prev.organizers.map((organizer, i) =>
        i === index ? { ...organizer, [field]: value } : organizer
      ),
    }))
  }

  const handleAgendaChange = (index: number, field: 'time' | 'activity', value: string) => {
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const handleContactInfoChange = (field: 'email' | 'phone' | 'website', value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact_info: { ...prev.contact_info, [field]: value },
    }))
  }

  const handleSocialLinksChange = (field: 'facebook' | 'instagram' | 'discord', value: string) => {
    setFormData((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [field]: value },
    }))
  }

  const handleFileUpload = (field: 'images' | 'attachments', files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ...fileArray],
    }))
  }

  const handleEventImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    setFormData((prev) => ({
      ...prev,
      event_image: file,
    }))
  }

  const handleEventLogoUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    setFormData((prev) => ({
      ...prev,
      event_logo: file,
    }))
  }

  const removeEventImage = () => {
    setFormData((prev) => ({
      ...prev,
      event_image: null,
      event_image_url: "",
    }))
  }

  const removeEventLogo = () => {
    setFormData((prev) => ({
      ...prev,
      event_logo: null,
      event_logo_url: "",
    }))
  }

  const removeFile = (field: 'images' | 'attachments', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_: File, i: number) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const requiredFields: Record<string, string> = {
      title: "Tên sự kiện",
      description: "Mô tả",
      start_date: "Ngày bắt đầu"
    }

    // Bắt buộc location cho physical events
    if (formData.location_type === 'physical' && !formData.location) {
      requiredFields.location = "Địa điểm"
    }

    // Bắt buộc location cho virtual events
    if (formData.location_type === 'virtual' && !formData.location) {
      requiredFields.location = "Link trực tuyến"
    }

    // Bắt buộc location cho hybrid events
    if (formData.location_type === 'hybrid' && !formData.location) {
      requiredFields.location = "Địa điểm chính"
    }

    const missingFields = Object.entries(requiredFields).filter(
      ([field, _]) => !formData[field as keyof typeof formData]
    )

    if (missingFields.length > 0) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: `Vui lòng điền: ${missingFields.map(([_, label]) => label).join(", ")}`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Upload images if any
      let eventImageUrl = formData.event_image_url
      let eventLogoUrl = formData.event_logo_url

      if (formData.event_image) {
        setIsUploadingImages(true)
        try {
          const uploadRes = await imageService.uploadSingleImage({
            imageFile: formData.event_image,
            type: 'event_image',
            entityId: eventId,
            entityType: 'event',
            folder: 'club_management/events'
          })
          if (uploadRes.success) {
            eventImageUrl = uploadRes.data.url
          }
        } catch (error) {
          console.error('Failed to upload event image:', error)
        }
        setIsUploadingImages(false)
      }

      if (formData.event_logo) {
        setIsUploadingImages(true)
        try {
          const uploadRes = await imageService.uploadSingleImage({
            imageFile: formData.event_logo,
            type: 'event_logo',
            entityId: eventId,
            entityType: 'event',
            folder: 'club_management/events'
          })
          if (uploadRes.success) {
            eventLogoUrl = uploadRes.data.url
          }
        } catch (error) {
          console.error('Failed to upload event logo:', error)
        }
        setIsUploadingImages(false)
      }

      const payload: UpdateEventRequest = {
        title: formData.title,
        description: formData.description,
        short_description: formData.short_description,
        category: formData.category,
        start_date: formData.start_date,
        end_date: formData.end_date,
        location: {
          location_type: formData.location_type,
          address: formData.location_type === 'physical' || formData.location_type === 'hybrid' ? formData.location : undefined,
          room: formData.detailed_location || undefined,
          virtual_link: formData.location_type === 'virtual' ? formData.location : 
                       formData.location_type === 'hybrid' ? formData.virtual_link : undefined,
          platform: formData.location_type === 'virtual' ? formData.platform : undefined,
        },
        max_participants: Number(formData.max_participants) || undefined,
        participation_fee: Number(formData.participation_fee) || 0,
        currency: formData.currency,
        requirements: formData.requirements.filter(Boolean),
        tags: formData.tags.filter(Boolean),
        organizers: formData.organizers.filter(org => org.name.trim() || org.id.trim()).map(org => ({
          user_id: org.id || "", // Use id from form if available
          user_full_name: org.name,
          role: org.role,
          joined_at: new Date().toISOString()
        })),
        agenda: formData.agenda.filter(item => item.time.trim() && item.activity.trim()),
        contact_info: formData.contact_info,
        social_links: formData.social_links,
        visibility: formData.is_public ? 'public' : 'club_members',
        status: formData.status,
        registration_deadline: formData.registration_deadline || undefined,
        event_image_url: eventImageUrl,
        event_logo_url: eventLogoUrl,
        images: formData.image_urls,
        attachments: formData.attachment_data,
      }

      const res = await eventService.updateEvent(eventId, payload)
      if (!res.success) {
        throw new Error(res.message || 'Update failed')
      }

      toast({
        title: "Cập nhật sự kiện thành công",
        description: "Thông tin sự kiện đã được cập nhật",
      })

      router.push(`/clubs/${clubId}/manage`)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật sự kiện. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    "Workshop",
    "Seminar", 
    "Competition",
    "Social",
    "Fundraiser",
    "Meeting",
    "Other",
  ]

  const statusOptions = [
    { value: "draft", label: "Bản nháp" },
    { value: "published", label: "Đã xuất bản" },
    { value: "cancelled", label: "Đã hủy" },
    { value: "completed", label: "Đã hoàn thành" },
  ]

  const visibilityOptions = [
    { value: "public", label: "Công khai" },
    { value: "club_members", label: "Chỉ thành viên câu lạc bộ" },
  ]

  const locationTypeOptions = [
    { value: "physical", label: "Tại địa điểm" },
    { value: "virtual", label: "Trực tuyến" },
    { value: "hybrid", label: "Kết hợp" },
  ]

  const currencyOptions = [
    { value: "VND", label: "VND" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "JPY", label: "JPY" },
    { value: "KRW", label: "KRW" },
    { value: "CNY", label: "CNY" },
  ]

  const organizerOptions = [
    { value: "organizer", label: "Người tổ chức" },
    { value: "lead_organizer", label: "Trưởng ban tổ chức" },
  ]



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8 w-64"></div>
            <div className="h-12 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
              <BreadcrumbLink href={`/clubs/${clubId}`}>Club Detail</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/clubs/${clubId}/manage`}>Quản lý</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chỉnh sửa sự kiện</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sự kiện</h1>
              <p className="mt-2 text-gray-600">Cập nhật thông tin sự kiện</p>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Tên sự kiện *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Nhập tên sự kiện"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả chi tiết *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Mô tả chi tiết về sự kiện..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="short_description">Mô tả ngắn</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => handleInputChange("short_description", e.target.value)}
                  placeholder="Mô tả ngắn gọn (tối đa 200 ký tự)"
                  rows={2}
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="category">Danh mục</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Status & Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Trạng thái và hiển thị
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visibility">Hiển thị sự kiện</Label>
                  <Select value={formData.visibility} onValueChange={(value) => handleInputChange("visibility", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mức độ hiển thị" />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Thời gian và địa điểm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Ngày bắt đầu *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange("start_date", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="start_time">Giờ bắt đầu *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange("start_time", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">Ngày kết thúc</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange("end_date", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="end_time">Giờ kết thúc</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange("end_time", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location_type">Loại địa điểm</Label>
                  <Select value={formData.location_type} onValueChange={(value) => handleInputChange("location_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">
                    {formData.location_type === 'virtual' ? 'Link/Platform' : 
                     formData.location_type === 'hybrid' ? 'Địa điểm chính' : 'Địa điểm'}
                    {formData.location_type === 'physical' ? ' *' : ''}
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder={
                      formData.location_type === 'virtual' 
                        ? "Ví dụ: https://zoom.us/j/123456789"
                        : formData.location_type === 'hybrid'
                        ? "Ví dụ: Hội trường lớn, Tòa nhà A"
                        : "Ví dụ: Hội trường lớn, Tòa nhà A"
                    }
                    required={formData.location_type === 'physical'}
                  />
                </div>
              </div>

              {formData.location_type === 'virtual' && (
                <div>
                  <Label htmlFor="platform">Nền tảng</Label>
                  <Select value={formData.platform} onValueChange={(value) => handleInputChange("platform", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nền tảng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                      <SelectItem value="Discord">Discord</SelectItem>
                      <SelectItem value="Skype">Skype</SelectItem>
                      <SelectItem value="Other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.location_type === 'hybrid' && (
                <div>
                  <Label htmlFor="virtual_link">Link trực tuyến</Label>
                  <Input
                    id="virtual_link"
                    value={formData.virtual_link || ""}
                    onChange={(e) => handleInputChange("virtual_link", e.target.value)}
                    placeholder="https://zoom.us/j/123456789"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="detailed_location">
                  {formData.location_type === 'virtual' ? 'Hướng dẫn tham gia' : 
                   formData.location_type === 'hybrid' ? 'Thông tin bổ sung' : 'Địa chỉ chi tiết'}
                </Label>
                <Textarea
                  id="detailed_location"
                  value={formData.detailed_location}
                  onChange={(e) => handleInputChange("detailed_location", e.target.value)}
                  placeholder={
                    formData.location_type === 'virtual'
                      ? "Meeting ID, password, hướng dẫn tham gia trực tuyến..."
                      : formData.location_type === 'hybrid'
                      ? "Địa chỉ chi tiết, hướng dẫn tham gia, thông tin bổ sung..."
                      : "Địa chỉ chi tiết, hướng dẫn đường đi, phòng số..."
                  }
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Registration & Capacity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Đăng ký và sức chứa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_participants">Số lượng tối đa</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => handleInputChange("max_participants", e.target.value)}
                    placeholder="0 = không giới hạn"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="participation_fee">Phí tham gia</Label>
                  <div className="flex gap-2">
                    <Input
                      id="participation_fee"
                      type="number"
                      value={formData.participation_fee}
                      onChange={(e) => handleInputChange("participation_fee", e.target.value)}
                      placeholder="0 = miễn phí"
                      min="0"
                    />
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="registration_deadline">Hạn đăng ký</Label>
                <Input
                  id="registration_deadline"
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) => handleInputChange("registration_deadline", e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow_registration"
                    checked={formData.allow_registration}
                    onCheckedChange={(checked) => handleInputChange("allow_registration", checked)}
                  />
                  <Label htmlFor="allow_registration">Cho phép đăng ký tham gia</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => handleInputChange("is_public", checked)}
                  />
                  <Label htmlFor="is_public">Sự kiện công khai</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements & Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Yêu cầu và thẻ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Yêu cầu tham gia</Label>
                <div className="space-y-2">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={req}
                        onChange={(e) => handleArrayChange("requirements", index, e.target.value)}
                        placeholder="Nhập yêu cầu tham gia"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem("requirements", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("requirements")}
                  >
                    + Thêm yêu cầu
                  </Button>
                </div>
              </div>

              <div>
                <Label>Thẻ (Tags)</Label>
                <div className="space-y-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={tag}
                        onChange={(e) => handleArrayChange("tags", index, e.target.value)}
                        placeholder="Nhập thẻ"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem("tags", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("tags")}
                  >
                    + Thêm thẻ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Organizers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Organizers</Label>
                <div className="space-y-2">
                  {formData.organizers.map((organizer, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={organizer.id}
                        onChange={(e) => handleOrganizerChange(index, 'id', e.target.value)}
                        placeholder="User ID"
                        className="w-32"
                      />
                      <Input
                        value={organizer.name}
                        onChange={(e) => handleOrganizerChange(index, 'name', e.target.value)}
                        placeholder="Organizer Name"
                      />
                      <Select value={organizer.role} onValueChange={(value) => handleOrganizerChange(index, 'role', value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizerOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem("organizers", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("organizers")}
                  >
                    + Add Organizer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agenda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Agenda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Agenda</Label>
                <div className="space-y-2">
                  {formData.agenda.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item.time}
                        onChange={(e) => handleAgendaChange(index, 'time', e.target.value)}
                        placeholder="Time (e.g., 10:00 AM)"
                      />
                      <Input
                        value={item.activity}
                        onChange={(e) => handleAgendaChange(index, 'activity', e.target.value)}
                        placeholder="Activity"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem("agenda", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("agenda")}
                  >
                    + Add Agenda Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.contact_info.email}
                  onChange={(e) => handleContactInfoChange("email", e.target.value)}
                  placeholder="Email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.contact_info.phone}
                  onChange={(e) => handleContactInfoChange("phone", e.target.value)}
                  placeholder="Phone"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.contact_info.website}
                  onChange={(e) => handleContactInfoChange("website", e.target.value)}
                  placeholder="Website"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={formData.social_links.facebook}
                  onChange={(e) => handleSocialLinksChange("facebook", e.target.value)}
                  placeholder="Facebook URL"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.social_links.instagram}
                  onChange={(e) => handleSocialLinksChange("instagram", e.target.value)}
                  placeholder="Instagram URL"
                />
              </div>
              <div>
                <Label htmlFor="discord">Discord</Label>
                <Input
                  id="discord"
                  value={formData.social_links.discord}
                  onChange={(e) => handleSocialLinksChange("discord", e.target.value)}
                  placeholder="Discord URL"
                />
              </div>
            </CardContent>
          </Card>

          {/* File Handling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="event_logo">Event Logo</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="event_logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleEventLogoUpload(e.target.files)}
                    disabled={isUploadingImages}
                  />
                  {formData.event_logo && (
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-green-500" />
                      <span className="text-sm text-gray-700">{formData.event_logo.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeEventLogo}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Hiển thị logo hiện tại nếu có */}
                {formData.event_logo_url && !formData.event_logo && (
                  <div className="mt-2">
                    <Label>Logo hiện tại:</Label>
                    <div className="relative inline-block mt-1">
                      <img
                        src={formData.event_logo_url}
                        alt="Current event logo"
                        className="w-32 h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-logo.png'
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange("event_logo_url", "")}
                        className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="event_image">Event Image</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="event_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleEventImageUpload(e.target.files)}
                    disabled={isUploadingImages}
                  />
                  {formData.event_image && (
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-green-500" />
                      <span className="text-sm text-gray-700">{formData.event_image.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeEventImage}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Hiển thị ảnh chính hiện tại nếu có */}
                {formData.event_image_url && !formData.event_image && (
                  <div className="mt-2">
                    <Label>Ảnh chính hiện tại:</Label>
                    <div className="relative inline-block mt-1">
                      <img
                        src={formData.event_image_url}
                        alt="Current event image"
                        className="w-48 h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-logo.png'
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange("event_image_url", "")}
                        className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label>Gallery Images</Label>
                <div className="space-y-2">
                  {/* Hiển thị gallery images hiện tại */}
                  {formData.image_urls.length > 0 && (
                    <div className="mt-2">
                      <Label>Ảnh gallery hiện tại ({formData.image_urls.length}):</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-1">
                        {formData.image_urls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-logo.png'
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newUrls = formData.image_urls.filter((_, i) => i !== index)
                                handleInputChange("image_urls", newUrls)
                              }}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Upload gallery images mới */}
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload("images", e.target.files)}
                    disabled={isUploadingImages}
                  />
                  
                  {/* Hiển thị files mới được chọn */}
                  {formData.images.length > 0 && (
                    <div className="mt-2">
                      <Label>Ảnh mới được chọn ({formData.images.length}):</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-1">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFile("images", index)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <div className="absolute bottom-1 left-1 bg-green-600 bg-opacity-50 text-white text-xs px-1 rounded">
                              New
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Attachments</Label>
                <div className="space-y-2">
                  {/* Hiển thị attachments hiện tại */}
                  {formData.attachment_data.length > 0 && (
                    <div className="mt-2">
                      <Label>Tài liệu hiện tại ({formData.attachment_data.length}):</Label>
                      <div className="space-y-2">
                        {formData.attachment_data.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{attachment.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newAttachments = formData.attachment_data.filter((_, i) => i !== index)
                                handleInputChange("attachment_data", newAttachments)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Upload attachments mới */}
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile("attachments", index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z"
                    onChange={(e) => handleFileUpload("attachments", e.target.files)}
                    disabled={isUploadingImages}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Cập nhật sự kiện
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 