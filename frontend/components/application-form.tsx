"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { CalendarIcon, ClockIcon, UsersIcon, UploadIcon, FileIcon, XIcon } from "lucide-react"
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
  console.log('📋 ApplicationForm received campaign:', campaign);
  console.log('📋 Campaign application_questions:', {
    count: campaign?.application_questions?.length || 0,
    questions: campaign?.application_questions
  });
  
  const { user } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()
  const { applyToCampaign, updateApplication } = useUserApplications(user?.id || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    application_message: existingApplication?.application_message || "",
    application_answers: existingApplication?.application_answers || {} as Record<string, string>,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [uploadedCV, setUploadedCV] = useState<File | null>(null)

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

  const handleCVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Lỗi định dạng file",
          description: "Chỉ chấp nhận file PDF, DOC, hoặc DOCX",
          variant: "destructive",
        })
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File quá lớn",
          description: "Kích thước file không được vượt quá 5MB",
          variant: "destructive",
        })
        return
      }

      setUploadedCV(file)
      setErrors((prev) => ({ ...prev, cv_file: "" }))
    }
  }

  const handleRemoveCV = () => {
    setUploadedCV(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if user is authenticated
    if (!user?.id) {
      toast({
        title: "Lỗi xác thực",
        description: "Bạn cần đăng nhập để gửi đơn ứng tuyển.",
        variant: "destructive",
      });
      return;
    }

    // Check if campaign is valid
    if (!campaign?.id) {
      toast({
        title: "Lỗi",
        description: "Thông tin chiến dịch không hợp lệ.",
        variant: "destructive",
      });
      console.error('Invalid campaign object:', campaign);
      return;
    }

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
      // Debug authentication
      console.log('🔐 Auth debug:', {
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        token: localStorage.getItem('club_management_token') ? 'Token exists' : 'No token'
      });

      // Prepare submit data - temporarily not including CV file
      const submitData = {
        ...formData
        // TODO: Add cv_file: uploadedCV when backend supports file upload
      }

      console.log('📋 Submitting application data:', submitData);
      console.log('📋 CV file selected (not sent):', uploadedCV?.name);
      console.log('📋 Campaign ID:', campaign.id);

      if (isEditing && existingApplication) {
        // Update existing application
        await updateApplication(campaign.id, existingApplication.id, submitData)
      } else {
        // Create new application
        await applyToCampaign(campaign.id, submitData)
      }
      
      onSuccess?.()
      onClose()
    } catch (error: any) {
      // Enhanced error logging for debugging
      console.error('Application submission failed:', {
        error,
        errorMessage: error?.message,
        errorStatus: error?.status,
        errorStack: error?.stack,
        campaignId: campaign.id,
        formData: formData,
        isEditing,
        userId: user?.id,
        errorType: typeof error,
        errorKeys: Object.keys(error || {})
      });
      
      // Show user-friendly error message
      toast({
        title: 'Lỗi gửi đơn ứng tuyển',
        description: error?.message || 'Có lỗi xảy ra khi gửi đơn ứng tuyển. Vui lòng thử lại.',
        variant: 'destructive',
      });
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

      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={(val) => handleAnswerChange(question.id, val)}>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option} 
                  id={`${question.id}_${index}`}
                  className={hasError ? "border-red-500" : ""}
                />
                <Label htmlFor={`${question.id}_${index}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        const selectedOptions = value ? value.split(',').filter((opt: string) => opt.trim() !== '') : []
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}_${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => {
                    let newSelected = [...selectedOptions]
                    if (checked) {
                      if (!newSelected.includes(option)) {
                        newSelected.push(option)
                      }
                    } else {
                      newSelected = newSelected.filter(item => item !== option)
                    }
                    handleAnswerChange(question.id, newSelected.join(','))
                  }}
                />
                <Label htmlFor={`${question.id}_${index}`} className="font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
            {selectedOptions.length > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                Đã chọn: {selectedOptions.join(', ')}
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="text-sm text-gray-500 italic">
            Loại câu hỏi không được hỗ trợ: {question.type}
          </div>
        )
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
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
          {/* CV Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileIcon className="h-5 w-5" />
                Upload CV
              </CardTitle>
              <CardDescription>
                Tải lên CV của bạn (PDF, DOC, DOCX - tối đa 5MB)
                <br />
                <span className="text-amber-600 text-sm">
                  📋 Tính năng này đang trong quá trình phát triển. CV sẽ được lưu cục bộ và không gửi đến server.
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!uploadedCV ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2"
                    >
                      <UploadIcon className="h-4 w-4" />
                      Chọn file CV
                    </Button>
                    <p className="text-sm text-gray-500">
                      Kéo thả hoặc click để chọn file
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCVUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{uploadedCV.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(uploadedCV.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCV}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {errors.cv_file && (
                <p className="text-sm text-red-600 mt-2">{errors.cv_file}</p>
              )}
            </CardContent>
          </Card>

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
                {campaign.application_questions.map((question, index) => {
                  console.log(`🔍 Rendering question ${index + 1}:`, question);
                  return (
                    <div key={question.id} className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-gray-500 mt-1">
                          {index + 1}.
                        </span>
                        <div className="flex-1">
                          <Label className="text-sm font-medium">
                            {question.question}
                            {question.required && <span className="text-red-500"> *</span>}
                          </Label>
                          {question.max_length && (
                            <p className="text-xs text-gray-500 mt-1">
                              Tối đa {question.max_length} ký tự
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-6">
                        {renderQuestion(question)}
                        {errors[`question_${question.id}`] && (
                          <p className="text-sm text-red-600 mt-1">{errors[`question_${question.id}`]}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
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
