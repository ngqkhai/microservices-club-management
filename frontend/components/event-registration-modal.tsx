"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, DollarSign, User, Phone, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Event {
  event_id: string
  title: string
  description: string
  date: string
  start_time: string
  end_time?: string
  location: string
  detailed_location: string
  club: {
    id: string
    name: string
    logo_url: string
  }
  organizer: {
    name: string
    role: string
    email: string
    phone: string
  }
  fee: number
  max_participants: number
  current_participants: number
  registration_deadline: string
  status: string
  category: string
  event_type: string
  tags: string[]
  requirements: string[]
}

interface EventRegistrationModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EventRegistrationModal({ event, isOpen, onClose, onSuccess }: EventRegistrationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    email: "",
    phone: "",
    studentId: "",
    faculty: "",
    year: "",

    // Emergency Contact
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",

    // Event Specific
    dietaryRequirements: "",
    specialNeeds: "",
    tshirtSize: "",

    // Team Registration (for hackathons)
    teamName: "",
    teamMembers: "",
    isTeamLeader: false,

    // Agreements
    agreeTerms: false,
    agreePrivacy: false,
    agreePhotos: false,
  })

  const { toast } = useToast()

  if (!event) return null

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      return
    }

    if (!formData.agreeTerms) {
      toast({
        title: "Chưa đồng ý điều khoản",
        description: "Vui lòng đồng ý với điều khoản và điều kiện",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      onSuccess()

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        studentId: "",
        faculty: "",
        year: "",
        emergencyName: "",
        emergencyPhone: "",
        emergencyRelation: "",
        dietaryRequirements: "",
        specialNeeds: "",
        tshirtSize: "",
        teamName: "",
        teamMembers: "",
        isTeamLeader: false,
        agreeTerms: false,
        agreePrivacy: false,
        agreePhotos: false,
      })
    } catch (error) {
      toast({
        title: "Đăng ký thất bại",
        description: "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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

  const isHackathon = event.event_type === "Competition" || event.tags.includes("Hackathon")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Đăng ký tham gia sự kiện</DialogTitle>
          <DialogDescription>
            Vui lòng điền đầy đủ thông tin để đăng ký tham gia sự kiện "{event.title}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin sự kiện</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>
                    {formatTime(event.start_time)} - {event.end_time ? formatTime(event.end_time) : "Kết thúc"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span>{event.fee === 0 ? "Miễn phí" : `${event.fee.toLocaleString("vi-VN")} VNĐ`}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">{event.category}</Badge>
                <Badge variant="outline">{event.event_type}</Badge>
                {event.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Nhập họ và tên đầy đủ"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="example@student.edu.vn"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="0987654321"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="studentId">Mã số sinh viên</Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange("studentId", e.target.value)}
                    placeholder="20210001"
                  />
                </div>

                <div>
                  <Label htmlFor="faculty">Khoa/Viện</Label>
                  <Select value={formData.faculty} onValueChange={(value) => handleInputChange("faculty", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khoa/viện" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cntt">Công nghệ thông tin</SelectItem>
                      <SelectItem value="dtvt">Điện tử viễn thông</SelectItem>
                      <SelectItem value="co-khi">Cơ khí</SelectItem>
                      <SelectItem value="kinh-te">Kinh tế</SelectItem>
                      <SelectItem value="ngoai-ngu">Ngoại ngữ</SelectItem>
                      <SelectItem value="khac">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year">Năm học</Label>
                  <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn năm học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Năm 1</SelectItem>
                      <SelectItem value="2">Năm 2</SelectItem>
                      <SelectItem value="3">Năm 3</SelectItem>
                      <SelectItem value="4">Năm 4</SelectItem>
                      <SelectItem value="5">Năm 5</SelectItem>
                      <SelectItem value="thac-si">Thạc sĩ</SelectItem>
                      <SelectItem value="tien-si">Tiến sĩ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Liên hệ khẩn cấp
              </CardTitle>
              <CardDescription>Thông tin người liên hệ trong trường hợp khẩn cấp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Họ tên người liên hệ</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyName}
                    onChange={(e) => handleInputChange("emergencyName", e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyPhone">Số điện thoại</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                    placeholder="0987654321"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyRelation">Mối quan hệ</Label>
                  <Select
                    value={formData.emergencyRelation}
                    onValueChange={(value) => handleInputChange("emergencyRelation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mối quan hệ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cha">Cha</SelectItem>
                      <SelectItem value="me">Mẹ</SelectItem>
                      <SelectItem value="anh-chi">Anh/Chị</SelectItem>
                      <SelectItem value="ban">Bạn</SelectItem>
                      <SelectItem value="khac">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Registration for Hackathons */}
          {isHackathon && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Thông tin nhóm
                </CardTitle>
                <CardDescription>Thông tin về nhóm tham gia (2-4 người/nhóm)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Tên nhóm</Label>
                  <Input
                    id="teamName"
                    value={formData.teamName}
                    onChange={(e) => handleInputChange("teamName", e.target.value)}
                    placeholder="Nhập tên nhóm"
                  />
                </div>

                <div>
                  <Label htmlFor="teamMembers">Thành viên nhóm</Label>
                  <Textarea
                    id="teamMembers"
                    value={formData.teamMembers}
                    onChange={(e) => handleInputChange("teamMembers", e.target.value)}
                    placeholder="Danh sách thành viên (tên, email, số điện thoại)"
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isTeamLeader"
                    checked={formData.isTeamLeader}
                    onCheckedChange={(checked) => handleInputChange("isTeamLeader", checked)}
                  />
                  <Label htmlFor="isTeamLeader">Tôi là trưởng nhóm</Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin bổ sung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tshirtSize">Kích cỡ áo</Label>
                  <Select value={formData.tshirtSize} onValueChange={(value) => handleInputChange("tshirtSize", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kích cỡ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dietaryRequirements">Yêu cầu ăn uống</Label>
                  <Input
                    id="dietaryRequirements"
                    value={formData.dietaryRequirements}
                    onChange={(e) => handleInputChange("dietaryRequirements", e.target.value)}
                    placeholder="Chay, không ăn hải sản, v.v."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specialNeeds">Yêu cầu hỗ trợ đặc biệt</Label>
                <Textarea
                  id="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={(e) => handleInputChange("specialNeeds", e.target.value)}
                  placeholder="Hỗ trợ di chuyển, thiết bị đặc biệt, v.v."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Điều khoản và điều kiện
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeTerms", checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                    Tôi đồng ý với{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      điều khoản và điều kiện
                    </a>{" "}
                    của sự kiện. Tôi hiểu rằng việc đăng ký này có tính ràng buộc và tôi cam kết tham gia đầy đủ sự
                    kiện. *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreePrivacy"
                    checked={formData.agreePrivacy}
                    onCheckedChange={(checked) => handleInputChange("agreePrivacy", checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="agreePrivacy" className="text-sm leading-relaxed">
                    Tôi đồng ý cho phép ban tổ chức sử dụng thông tin cá nhân của tôi cho mục đích tổ chức sự kiện và
                    liên lạc theo{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      chính sách bảo mật
                    </a>
                    .
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreePhotos"
                    checked={formData.agreePhotos}
                    onCheckedChange={(checked) => handleInputChange("agreePhotos", checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="agreePhotos" className="text-sm leading-relaxed">
                    Tôi đồng ý cho phép ban tổ chức chụp ảnh, quay video và sử dụng hình ảnh của tôi trong các hoạt động
                    truyền thông của sự kiện.
                  </Label>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Vui lòng đến đúng giờ theo lịch trình đã thông báo</li>
                      <li>Mang theo giấy tờ tùy thân và thẻ sinh viên</li>
                      <li>Tuân thủ quy định về trang phục và hành vi</li>
                      <li>Thông báo sớm nếu không thể tham gia</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Đang đăng ký..." : "Đăng ký tham gia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
