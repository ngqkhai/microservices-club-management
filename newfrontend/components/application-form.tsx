"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, FileText } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"

interface ApplicationFormProps {
  clubId: string
  clubName: string
  onClose: () => void
}

// Mock dynamic questions
const mockQuestions = [
  {
    type: "text",
    question: "Tại sao bạn muốn tham gia câu lạc bộ này?",
    required: true,
  },
  {
    type: "multiple-choice",
    question: "Kinh nghiệm của bạn trong lĩnh vực này?",
    options: ["Người mới bắt đầu", "Trung bình", "Nâng cao"],
    required: true,
  },
  {
    type: "file",
    question: "Tải lên CV của bạn",
    accept: ".pdf",
    maxSizeMB: 5,
    required: false,
  },
]

export function ApplicationForm({ clubId, clubName, onClose }: ApplicationFormProps) {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    answers: {} as { [key: number]: string },
    file: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc"
    }

    mockQuestions.forEach((question, index) => {
      if (question.required) {
        if (question.type === "file") {
          // File validation would go here if required
        } else if (!formData.answers[index]?.trim()) {
          newErrors[`question_${index}`] = "Câu hỏi này là bắt buộc"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionIndex]: value,
      },
    }))

    // Clear error when user starts typing
    if (errors[`question_${questionIndex}`]) {
      setErrors((prev) => ({ ...prev, [`question_${questionIndex}`]: "" }))
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, file: "Kích thước file không được vượt quá 5MB" }))
        return
      }
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setErrors((prev) => ({ ...prev, file: "Chỉ chấp nhận file PDF" }))
        return
      }
      setFormData((prev) => ({ ...prev, file }))
      setErrors((prev) => ({ ...prev, file: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Đơn ứng tuyển đã được gửi!",
        description: "Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.",
      })
      router.push("/profile")
    }, 2000)
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Đơn ứng tuyển</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">{clubName}</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin cá nhân</CardTitle>
              <CardDescription>Thông tin cơ bản về bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input id="name" value={formData.name} disabled className="bg-gray-50" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={formData.email} disabled className="bg-gray-50" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    if (errors.phone) {
                      setErrors((prev) => ({ ...prev, phone: "" }))
                    }
                  }}
                  className={errors.phone ? "border-red-500" : ""}
                  placeholder="Nhập số điện thoại của bạn"
                />
                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Câu hỏi ứng tuyển</CardTitle>
              <CardDescription>Vui lòng trả lời các câu hỏi dưới đây</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockQuestions.map((question, index) => (
                <div key={index}>
                  <Label className="text-sm font-medium">
                    {question.question}
                    {question.required && <span className="text-red-500"> *</span>}
                  </Label>

                  {question.type === "text" && (
                    <Textarea
                      value={formData.answers[index] || ""}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      className={errors[`question_${index}`] ? "border-red-500" : ""}
                      placeholder="Nhập câu trả lời của bạn..."
                      rows={4}
                    />
                  )}

                  {question.type === "multiple-choice" && (
                    <RadioGroup
                      value={formData.answers[index] || ""}
                      onValueChange={(value) => handleAnswerChange(index, value)}
                      className="mt-2"
                    >
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`q${index}_${optionIndex}`} />
                          <Label htmlFor={`q${index}_${optionIndex}`} className="font-normal">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === "file" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor={`file_${index}`}
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Nhấp để tải lên</span> hoặc kéo thả file
                            </p>
                            <p className="text-xs text-gray-500">PDF (MAX. 5MB)</p>
                          </div>
                          <input
                            id={`file_${index}`}
                            type="file"
                            className="hidden"
                            accept={question.accept}
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      {formData.file && (
                        <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-600">{formData.file.name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {errors[`question_${index}`] && (
                    <p className="text-sm text-red-600 mt-1">{errors[`question_${index}`]}</p>
                  )}
                  {errors.file && question.type === "file" && (
                    <p className="text-sm text-red-600 mt-1">{errors.file}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Đang gửi..." : "Gửi đơn ứng tuyển"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
