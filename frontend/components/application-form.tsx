"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClockIcon, UsersIcon } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { useUserApplications } from "@/hooks/use-campaigns"
import { Campaign, ApplicationQuestion } from "@/services/campaign.service"

interface ApplicationFormProps {
  campaign: Campaign
  onClose: () => void
  onSuccess?: () => void
  existingApplication?: any // If editing existing application
  isEditing?: boolean
}

export function ApplicationForm({ 
  campaign, 
  onClose, 
  onSuccess, 
  existingApplication, 
  isEditing = false 
}: ApplicationFormProps) {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()
  const { applyToCampaign, updateApplication } = useUserApplications(user?.id || '')

  const [formData, setFormData] = useState({
    application_message: existingApplication?.application_message || "",
    application_answers: existingApplication?.application_answers || {} as Record<string, string>,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Validate required questions
    campaign.application_questions?.forEach((question) => {
      if (question.required) {
        const answer = formData.application_answers[question.id]
        if (!answer || answer.trim() === '') {
          newErrors[`question_${question.id}`] = "Câu hỏi này là bắt buộc"
        } else if (question.max_length && answer.length > question.max_length) {
          newErrors[`question_${question.id}`] = `Câu trả lời không được vượt quá ${question.max_length} ký tự`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      application_answers: {
        ...prev.application_answers,
        [questionId]: value,
      },
    }))

    // Clear error when user starts typing
    if (errors[`question_${questionId}`]) {
      setErrors((prev) => ({ ...prev, [`question_${questionId}`]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng kiểm tra và điền đầy đủ thông tin bắt buộc.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditing && existingApplication) {
        // Update existing application
        await updateApplication(campaign.id, existingApplication.id, formData)
      } else {
        // Create new application
        await applyToCampaign(campaign.id, formData)
      }
      
      onSuccess?.()
      onClose()
    } catch (error: any) {
      // Error handling is done in the hook
      console.error('Application submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = (question: ApplicationQuestion) => {
    const value = formData.application_answers[question.id] || ""
    const hasError = errors[`question_${question.id}`]

    switch (question.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className={hasError ? "border-red-500" : ""}
            placeholder="Nhập câu trả lời của bạn..."
            maxLength={question.max_length}
          />
        )

      case 'textarea':
        return (
          <div className="space-y-2">
            <Textarea
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className={hasError ? "border-red-500" : ""}
              placeholder="Nhập câu trả lời của bạn..."
              rows={4}
              maxLength={question.max_length}
            />
            {question.max_length && (
              <p className="text-xs text-gray-500 text-right">
                {value.length}/{question.max_length} ký tự
              </p>
            )}
          </div>
        )

      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleAnswerChange(question.id, val)}>
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue placeholder="Chọn một lựa chọn..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'checkbox':
        const selectedOptions = value ? value.split(',') : []
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}_${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => {
                    let newSelected = [...selectedOptions]
                    if (checked) {
                      newSelected.push(option)
                    } else {
                      newSelected = newSelected.filter(item => item !== option)
                    }
                    handleAnswerChange(question.id, newSelected.join(','))
                  }}
                />
                <Label htmlFor={`${question.id}_${index}`} className="font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isDeadlineSoon = () => {
    const deadline = new Date(campaign.end_date)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3
  }

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => document.removeEventListener("keydown", handleEscKey)
  }, [onClose])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {isEditing ? "Chỉnh sửa đơn ứng tuyển" : "Đơn ứng tuyển"}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">{campaign.title}</p>
            </div>
            <Badge
              variant={campaign.status === "published" ? "default" : "secondary"}
              className={campaign.status === "published" ? "bg-green-600" : ""}
            >
              {campaign.status === "published" ? "Đang mở" : "Đã đóng"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Campaign Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              {campaign.club_name}
            </CardTitle>
            <CardDescription>{campaign.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span>Bắt đầu: {formatDate(campaign.start_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className={isDeadlineSoon() ? "text-red-600 font-medium" : ""}>
                  Kết thúc: {formatDate(campaign.end_date)}
                  {isDeadlineSoon() && <Badge variant="destructive" className="ml-2 text-xs">Sớm hết hạn</Badge>}
                </span>
              </div>
              {campaign.max_applications && (
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-gray-500" />
                  <span>
                    Số lượng: {campaign.statistics?.total_applications || 0}/{campaign.max_applications}
                  </span>
                </div>
              )}
            </div>

            {campaign.requirements && campaign.requirements.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2">Yêu cầu:</h4>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  {campaign.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông điệp ứng tuyển</CardTitle>
              <CardDescription>Chia sẻ lý do tại sao bạn muốn tham gia câu lạc bộ này</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.application_message}
                onChange={(e) => setFormData(prev => ({ ...prev, application_message: e.target.value }))}
                placeholder="Viết về động lực, mục tiêu và những gì bạn có thể đóng góp cho câu lạc bộ..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 text-right mt-1">
                {formData.application_message.length}/1000 ký tự
              </p>
            </CardContent>
          </Card>

          {/* Custom Questions */}
          {campaign.application_questions && campaign.application_questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Câu hỏi ứng tuyển</CardTitle>
                <CardDescription>Vui lòng trả lời các câu hỏi dưới đây</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {campaign.application_questions.map((question) => (
                  <div key={question.id}>
                    <Label className="text-sm font-medium">
                      {question.question}
                      {question.required && <span className="text-red-500"> *</span>}
                    </Label>
                    <div className="mt-2">
                      {renderQuestion(question)}
                    </div>
                    {errors[`question_${question.id}`] && (
                      <p className="text-sm text-red-600 mt-1">{errors[`question_${question.id}`]}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting 
                ? (isEditing ? "Đang cập nhật..." : "Đang gửi...") 
                : (isEditing ? "Cập nhật đơn" : "Gửi đơn ứng tuyển")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
