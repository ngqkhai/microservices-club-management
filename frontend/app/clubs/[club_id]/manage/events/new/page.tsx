"use client"

import { useState } from "react"
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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { eventService, CreateEventRequest } from "@/services/event.service"

export default function CreateEventPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const clubId = params.club_id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    category: "",
    event_type: "",
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
    is_public: true,
    allow_registration: true,
    registration_deadline: "",
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

  const addArrayItem = (field: 'requirements' | 'tags') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }

  const removeArrayItem = (field: 'requirements' | 'tags', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Enhanced validation
    const requiredFields = {
      title: "Tên sự kiện",
      description: "Mô tả",
      start_date: "Ngày bắt đầu",
      location: "Địa điểm"
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

    try {
      // Prepare data for API
      const eventData: CreateEventRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        short_description: formData.short_description?.trim() || undefined,
        category: formData.category || undefined,
        event_type: formData.event_type || undefined,
        start_date: formData.start_date,
        start_time: formData.start_time || undefined,
        end_date: formData.end_date || undefined,
        end_time: formData.end_time || undefined,
        location: formData.location.trim(),
        detailed_location: formData.detailed_location?.trim() || undefined,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : undefined,
        participation_fee: formData.participation_fee ? parseFloat(formData.participation_fee) : 0,
        currency: formData.currency,
        registration_deadline: formData.registration_deadline || undefined,
        requirements: formData.requirements.filter(req => req.trim() !== ""),
        tags: formData.tags.filter(tag => tag.trim() !== ""),
        visibility: formData.is_public ? 'public' : 'club_members',
        allow_registration: formData.allow_registration,
        club_id: clubId,
      }

      console.log('Creating event with data:', eventData)

      // Create event via API
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

  const eventTypes = [
    "Workshop",
    "Seminar",
    "Conference",
    "Concert",
    "Exhibition",
    "Competition",
    "Tournament",
    "Meeting",
    "Social Event",
    "Other",
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="event_type">Loại sự kiện</Label>
                  <Select value={formData.event_type} onValueChange={(value) => handleInputChange("event_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại sự kiện" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
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

              <div>
                <Label htmlFor="location">Địa điểm *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Ví dụ: Hội trường lớn, Tòa nhà A"
                  required
                />
              </div>

              <div>
                <Label htmlFor="detailed_location">Địa chỉ chi tiết</Label>
                <Textarea
                  id="detailed_location"
                  value={formData.detailed_location}
                  onChange={(e) => handleInputChange("detailed_location", e.target.value)}
                  placeholder="Địa chỉ chi tiết, hướng dẫn đường đi..."
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
                        <SelectItem value="VND">VND</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
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

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo...
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