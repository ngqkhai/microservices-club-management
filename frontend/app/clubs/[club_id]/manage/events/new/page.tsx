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
import { eventService, CreateEventRequest } from "@/services/event.service"
import { imageService } from "@/services/image.service"
import { useAuthStore } from "@/stores/auth-store"

export default function CreateEventPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const clubId = params.club_id as string
  const { user } = useAuthStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  // Use hardcoded valid categories from backend schema
  const categories = ['Workshop', 'Seminar', 'Competition', 'Social', 'Fundraiser', 'Meeting', 'Other']
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    category: "",
    start_date: "",
    end_date: "",
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



  const handleAgendaChange = (index: number, field: 'time' | 'activity', value: string) => {
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const addAgendaItem = () => {
    setFormData((prev) => ({
      ...prev,
      agenda: [...prev.agenda, { time: "", activity: "" }],
    }))
  }

  const removeAgendaItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index),
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

  const handleOrganizerChange = (index: number, field: 'id' | 'name' | 'role', value: string) => {
    setFormData((prev) => ({
      ...prev,
      organizers: prev.organizers.map((organizer, i) =>
        i === index ? { ...organizer, [field]: value } : organizer
      ),
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

  // Helper function to convert file to base64 for attachments
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Function to upload all images to Image Service
  const uploadImages = async (): Promise<{
    event_logo_url?: string;
    event_image_url?: string;
    image_urls?: string[];
  }> => {
    const results: any = {}
    
    try {
      // Upload event logo
      if (formData.event_logo) {
        const logoResponse = await imageService.uploadSingleImage({
          imageFile: formData.event_logo,
          type: 'event_logo',
          entityId: clubId, // We'll use clubId as temp entity_id, later can be updated with eventId
          entityType: 'event',
          folder: 'club_management/events'
        })
        
        if (logoResponse.success) {
          results.event_logo_url = logoResponse.data.url
        } else {
          throw new Error(`Failed to upload event logo: ${logoResponse.message}`)
        }
      }

      // Upload event image (main image)
      if (formData.event_image) {
        const imageResponse = await imageService.uploadSingleImage({
          imageFile: formData.event_image,
          type: 'event_image',
          entityId: clubId,
          entityType: 'event',
          folder: 'club_management/events'
        })
        
        if (imageResponse.success) {
          results.event_image_url = imageResponse.data.url
        } else {
          throw new Error(`Failed to upload event image: ${imageResponse.message}`)
        }
      }

      // Upload gallery images (bulk upload)
      if (formData.images.length > 0) {
        const imagesResponse = await imageService.uploadMultipleImages({
          imageFiles: formData.images,
          type: 'event',
          entityId: clubId,
          entityType: 'event',
          folder: 'club_management/events'
        })
        
        if (imagesResponse.success) {
          results.image_urls = imagesResponse.data.map(img => img.url)
        } else {
          throw new Error(`Failed to upload gallery images: ${imagesResponse.message}`)
        }
      }

      return results
    } catch (error: any) {
      throw new Error(`Image upload failed: ${error.message}`)
    }
  }

  // Function to process attachments (convert to base64)
  const processAttachments = async (): Promise<Array<{ name: string; url: string; type: string; size: number }>> => {
    if (formData.attachments.length === 0) return []

    try {
      const attachmentPromises = formData.attachments.map(async (file) => {
        const base64 = await fileToBase64(file)
        return {
          name: file.name,
          url: base64,
          type: file.type,
          size: file.size,
        }
      })

      return await Promise.all(attachmentPromises)
    } catch (error: any) {
      throw new Error(`Failed to process attachments: ${error.message}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Enhanced validation
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

    // Validate dates
    if (formData.end_date && formData.start_date > formData.end_date) {
      toast({
        title: "Thời gian không hợp lệ",
        description: "Ngày kết thúc phải sau ngày bắt đầu",
        variant: "destructive",
      })
      return
    }

    // Validate registration deadline
    if (formData.registration_deadline && formData.registration_deadline > formData.start_date) {
      toast({
        title: "Hạn đăng ký không hợp lệ",
        description: "Hạn đăng ký phải trước ngày bắt đầu sự kiện",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setIsUploadingImages(true)

    try {
      // Step 1: Upload images to Image Service
      let imageResults = {}
      if (formData.event_logo || formData.event_image || formData.images.length > 0) {
        try {
          imageResults = await uploadImages()
          toast({
            title: "Upload ảnh thành công",
            description: "Các hình ảnh đã được upload thành công",
          })
        } catch (error: any) {
          throw new Error(`Upload hình ảnh thất bại: ${error.message}`)
        }
      }
      setIsUploadingImages(false)

      // Step 2: Process attachments (convert to base64)
      let attachmentData: Array<{ name: string; url: string; type: string; size: number }> = []
      if (formData.attachments.length > 0) {
        try {
          attachmentData = await processAttachments()
        } catch (error: any) {
          throw new Error(`Xử lý tài liệu đính kèm thất bại: ${error.message}`)
        }
      }

      // Step 3: Prepare data for API according to Event Management API Documentation
      const eventData: CreateEventRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        short_description: formData.short_description?.trim() || undefined,
        category: formData.category || undefined,
        // Location object according to API spec
        location: {
          location_type: formData.location_type,
          address: formData.location_type === 'physical' || formData.location_type === 'hybrid' ? formData.location.trim() : undefined,
          room: formData.detailed_location?.trim() || undefined,
          virtual_link: formData.location_type === 'virtual' ? formData.location.trim() : 
                       formData.location_type === 'hybrid' ? formData.virtual_link?.trim() : undefined,
          platform: formData.location_type === 'virtual' ? formData.platform : undefined,
        },
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
        participation_fee: formData.participation_fee ? parseFloat(formData.participation_fee) : 0,
        currency: formData.currency,
        registration_deadline: formData.registration_deadline || undefined,
        requirements: formData.requirements.filter(req => req.trim() !== ""),
        tags: formData.tags.filter(tag => tag.trim() !== ""),
        organizers: formData.organizers
          .filter(org => org.name.trim() !== "" || org.id.trim() !== "")
          .map((org, index) => ({
            user_id: org.id || (index === 0 ? (user?.id || 'unknown') : `${user?.id || 'unknown'}_${index}`), // Use id from form if available
            user_full_name: org.name.trim(),
            role: org.role || 'organizer',
            joined_at: new Date().toISOString()
          })),
        agenda: formData.agenda.filter(item => item.time.trim() !== "" || item.activity.trim() !== ""),
        contact_info: {
          email: formData.contact_info.email || undefined,
          phone: formData.contact_info.phone || undefined,
          website: formData.contact_info.website || undefined,
        },
        social_links: {
          facebook: formData.social_links.facebook || undefined,
          instagram: formData.social_links.instagram || undefined,
          discord: formData.social_links.discord || undefined,
        },
        visibility: formData.visibility as 'public' | 'club_members',
        status: formData.status as 'draft' | 'published' | 'cancelled' | 'completed',
        // Image URLs from Image Service
        event_image_url: (imageResults as any).event_image_url,
        event_logo_url: (imageResults as any).event_logo_url,
        images: (imageResults as any).image_urls || [],
        // Attachments as data
        attachments: attachmentData,
        created_by: user?.id || 'unknown', // Add created_by field
        club_id: clubId,
      }

      console.log('Creating event with data:', eventData)

      // Step 4: Create event via API
      const response = await eventService.createEvent(eventData)

      if (response.success) {
        toast({
          title: "Tạo sự kiện thành công",
          description: "Sự kiện đã được tạo thành công",
        })

        // Redirect to club management page
        router.push(`/clubs/${clubId}/manage`)
      } else {
        throw new Error(response.message || 'Failed to create event')
      }
    } catch (error: any) {
      console.error('Error creating event:', error)
      
      // Handle specific error types
      let errorMessage = "Không thể tạo sự kiện. Vui lòng thử lại."
      
      if (error.status === 401) {
        errorMessage = "Bạn không có quyền tạo sự kiện. Vui lòng đăng nhập lại."
      } else if (error.status === 403) {
        errorMessage = "Bạn không có quyền tạo sự kiện cho câu lạc bộ này."
      } else if (error.status === 400) {
        errorMessage = error.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsUploadingImages(false)
    }
  }



  const statusOptions = [
    { value: "draft", label: "Bản nháp" },
    { value: "published", label: "Đã xuất bản" },
    { value: "cancelled", label: "Đã hủy" },
    { value: "completed", label: "Đã hoàn thành" },
  ]

  const visibilityOptions = [
    { value: "public", label: "Công khai" },
    { value: "members_only", label: "Chỉ thành viên câu lạc bộ" },
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
              <BreadcrumbPage>Tạo sự kiện</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tạo sự kiện mới</h1>
              <p className="mt-2 text-gray-600">Thêm sự kiện mới cho câu lạc bộ</p>
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
                  <Label htmlFor="end_date">Ngày kết thúc</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange("end_date", e.target.value)}
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
                    value={formData.virtual_link}
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
                  type="date"
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
              </div>
            </CardContent>
          </Card>

          {/* Event Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Logo sự kiện
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="event_logo">Tải lên logo sự kiện</Label>
                <div className="mt-2">
                  <Input
                    id="event_logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleEventLogoUpload(e.target.files)}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Logo sẽ được hiển thị như hình ảnh chính của sự kiện (JPG, PNG, GIF)
                  </p>
                </div>
              </div>

              {formData.event_logo && (
                <div className="space-y-2">
                  <Label>Logo đã chọn:</Label>
                  <div className="relative inline-block">
                    <img
                      src={URL.createObjectURL(formData.event_logo)}
                      alt="Event logo preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={removeEventLogo}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Main Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Hình ảnh chính sự kiện
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="event_image">Tải lên hình ảnh chính</Label>
                <div className="mt-2">
                  <Input
                    id="event_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleEventImageUpload(e.target.files)}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Hình ảnh chính sẽ hiển thị trên card sự kiện (JPG, PNG, GIF)
                  </p>
                </div>
              </div>

              {formData.event_image && (
                <div className="space-y-2">
                  <Label>Hình ảnh đã chọn:</Label>
                  <div className="relative inline-block">
                    <img
                      src={URL.createObjectURL(formData.event_image)}
                      alt="Event image preview"
                      className="w-48 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={removeEventImage}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gallery Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Thư viện hình ảnh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="images">Tải lên hình ảnh bổ sung</Label>
                <div className="mt-2">
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload("images", e.target.files)}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Chọn nhiều hình ảnh để tạo thư viện ảnh cho sự kiện (JPG, PNG, GIF, WebP)
                  </p>
                </div>
              </div>

              {formData.images.length > 0 && (
                <div className="space-y-2">
                  <Label>Hình ảnh đã chọn ({formData.images.length}):</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile("images", index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      <strong>✓ Sẽ upload qua Image Service:</strong> Các hình ảnh sẽ được upload an toàn 
                      qua dịch vụ chuyên dụng và tối ưu hóa cho hiển thị web.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Tài liệu đính kèm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="attachments">Tải lên tài liệu</Label>
                <div className="mt-2">
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={(e) => handleFileUpload("attachments", e.target.files)}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Chọn nhiều tài liệu (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT). 
                    <span className="text-amber-600 font-medium"> Tài liệu sẽ được lưu trong database.</span>
                  </p>
                </div>
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>Tài liệu đã chọn:</Label>
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile("attachments", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {formData.attachments.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        <strong>Lưu ý:</strong> Tài liệu đính kèm sẽ được chuyển đổi và lưu trữ trong database. 
                        Khuyến nghị sử dụng files có kích thước nhỏ (dưới 5MB) để đảm bảo hiệu suất tốt.
                      </p>
                    </div>
                  )}
                </div>
              )}
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
              <CardTitle>Ban tổ chức</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.organizers.map((organizer, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Người tổ chức {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem("organizers", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`organizer-name-${index}`}>Tên người tổ chức</Label>
                      <Input
                        id={`organizer-name-${index}`}
                        value={organizer.name}
                        onChange={(e) => handleOrganizerChange(index, "name", e.target.value)}
                        placeholder="Nhập tên người tổ chức"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`organizer-role-${index}`}>Vai trò</Label>
                      <Select 
                        value={organizer.role} 
                        onValueChange={(value) => handleOrganizerChange(index, "role", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizerOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem("organizers")}
              >
                + Thêm người tổ chức
              </Button>
            </CardContent>
          </Card>

          {/* Agenda */}
          <Card>
            <CardHeader>
              <CardTitle>Chương trình sự kiện</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.agenda.map((item, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Mục {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem("agenda", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`agenda-time-${index}`}>Thời gian bắt đầu</Label>
                      <Input
                        id={`agenda-time-${index}`}
                        type="time"
                        value={item.time}
                        onChange={(e) => handleAgendaChange(index, "time", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`agenda-activity-${index}`}>Hoạt động</Label>
                      <Input
                        id={`agenda-activity-${index}`}
                        value={item.activity}
                        onChange={(e) => handleAgendaChange(index, "activity", e.target.value)}
                        placeholder="Nhập tên hoạt động"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem("agenda")}
              >
                + Thêm mục chương trình
              </Button>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={formData.contact_info.email}
                    onChange={(e) => handleContactInfoChange("email", e.target.value)}
                    placeholder="Nhập email liên hệ"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Số điện thoại</Label>
                  <Input
                    id="contact-phone"
                    value={formData.contact_info.phone}
                    onChange={(e) => handleContactInfoChange("phone", e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contact-website">Website</Label>
                <Input
                  id="contact-website"
                  value={formData.contact_info.website}
                  onChange={(e) => handleContactInfoChange("website", e.target.value)}
                  placeholder="https://website.com"
                />
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

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Liên kết mạng xã hội</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="social-facebook">Facebook</Label>
                <Input
                  id="social-facebook"
                  value={formData.social_links.facebook}
                  onChange={(e) => handleSocialLinksChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <Label htmlFor="social-instagram">Instagram</Label>
                <Input
                  id="social-instagram"
                  value={formData.social_links.instagram}
                  onChange={(e) => handleSocialLinksChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <Label htmlFor="social-discord">Discord</Label>
                <Input
                  id="social-discord"
                  value={formData.social_links.discord}
                  onChange={(e) => handleSocialLinksChange("discord", e.target.value)}
                  placeholder="https://discord.gg/..."
                />
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
                  {isUploadingImages ? (
                    <>
                      <Loader2 className="animate-spin rounded-full h-4 w-4 mr-2" />
                      Đang upload ảnh...
                    </>
                  ) : (
                    <>
                      <Loader2 className="animate-spin rounded-full h-4 w-4 mr-2" />
                      Đang tạo sự kiện...
                    </>
                  )}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Tạo sự kiện
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 