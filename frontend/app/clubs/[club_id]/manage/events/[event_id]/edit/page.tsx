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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const clubId = params.club_id as string
  const eventId = params.event_id as string

  const [isLoading, setIsLoading] = useState(true)
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
    requirements: [""],
    tags: [""],
    is_public: true,
    allow_registration: true,
    registration_deadline: "",
  })

  useEffect(() => {
    loadEventData()
  }, [eventId])

  const loadEventData = async () => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock event data
      const mockEvent = {
        title: "Spring Concert 2024",
        description: "Đêm nhạc mùa xuân với các tiết mục đa dạng",
        short_description: "Đêm nhạc mùa xuân",
        category: "Arts & Culture",
        event_type: "Concert",
        start_date: "2024-04-15",
        start_time: "19:00",
        end_date: "2024-04-15",
        end_time: "21:30",
        location: "University Auditorium",
        detailed_location: "Hội trường lớn, Tòa nhà A",
        max_participants: "300",
        participation_fee: "0",
        currency: "VND",
        requirements: ["Không yêu cầu đặc biệt"],
        tags: ["Âm nhạc", "Văn hóa"],
        is_public: true,
        allow_registration: true,
        registration_deadline: "2024-04-14T23:59:00",
      }

      setFormData(mockEvent)
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

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].map((item: string, i: number) =>
        i === index ? value : item
      ),
    }))
  }

  const addArrayItem = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev], ""],
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].filter((_: string, i: number) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title || !formData.description || !formData.start_date || !formData.location) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 2000))

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
    "Arts & Culture",
    "Technology",
    "Sports",
    "Academic",
    "Social",
    "Business",
    "Health & Wellness",
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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