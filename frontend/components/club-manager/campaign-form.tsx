"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, X, FileText, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Question {
  id: string
  question: string
  type: "text" | "multiple-choice" | "file"
  options?: string[]
  is_required: boolean
}

interface CampaignFormProps {
  initialData?: any
  onSaveDraft: (data: any) => Promise<void>
  onPublish: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function CampaignForm({ initialData, onSaveDraft, onPublish, onCancel, isLoading: externalLoading }: CampaignFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Use external loading state if provided, otherwise use internal state
  const isLoading = externalLoading || isSubmitting

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    start_date: initialData?.start_date ? new Date(initialData.start_date).toISOString().split("T")[0] : "",
    end_date: initialData?.end_date ? new Date(initialData.end_date).toISOString().split("T")[0] : "",
    max_applications: initialData?.max_applications || "",
  })

  const [requirements, setRequirements] = useState<string[]>(initialData?.requirements || [])
  const [questions, setQuestions] = useState<Question[]>(initialData?.application_questions || [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addRequirement = () => {
    setRequirements((prev) => [...prev, ""])
  }

  const updateRequirement = (index: number, value: string) => {
    setRequirements((prev) => prev.map((req, i) => (i === index ? value : req)))
  }

  const removeRequirement = (index: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index))
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      type: "text",
      is_required: false,
    }
    setQuestions((prev) => [...prev, newQuestion])
  }

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const addOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [...(q.options || []), ""],
          }
        }
        return q
      }),
    )
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...(q.options || [])]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...(q.options || [])]
          newOptions.splice(optionIndex, 1)
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const validateForm = () => {
    // Validation
    if (!formData.title || !formData.description || !formData.start_date || !formData.end_date) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc.",
        variant: "destructive",
      })
      return false
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast({
        title: "Lỗi",
        description: "Ngày kết thúc phải sau ngày bắt đầu.",
        variant: "destructive",
      })
      return false
    }

    // Validate questions
    const validQuestions = questions.filter((q) => q.question.trim() !== "")
    for (const question of validQuestions) {
      if (question.type === "multiple-choice" && (!question.options || question.options.filter(opt => opt.trim() !== "").length < 2)) {
        toast({
          title: "Lỗi",
          description: "Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn.",
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }

  const prepareCampaignData = () => {
    const validQuestions = questions.filter((q) => q.question.trim() !== "")
    return {
      ...formData,
      requirements: requirements.filter((req) => req.trim() !== ""),
      application_questions: validQuestions.map(q => ({
        ...q,
        options: q.type === "multiple-choice" ? q.options?.filter(opt => opt.trim() !== "") : undefined
      })),
      max_applications: formData.max_applications ? Number.parseInt(formData.max_applications) : undefined,
    }
  }

  const handleSaveDraft = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const campaignData = prepareCampaignData()
      await onSaveDraft(campaignData)
    } catch (error) {
      console.error("Campaign draft save error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const campaignData = prepareCampaignData()
      await onPublish(campaignData)
    } catch (error) {
      console.error("Campaign publish error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Default to draft when form is submitted via Enter key
    await handleSaveDraft()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Tiêu đề chiến dịch *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Ví dụ: Tuyển thành viên mùa xuân 2024"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Mô tả chi tiết về chiến dịch tuyển dụng..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Yêu cầu</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequirement}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm yêu cầu
              </Button>
            </div>
            {requirements.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                <p className="text-sm">Chưa có yêu cầu nào</p>
                <p className="text-xs">Thêm yêu cầu để mô tả điều kiện cần thiết cho ứng viên</p>
              </div>
            ) : (
              <div className="space-y-2">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder={`Yêu cầu ${index + 1}`}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Ngày bắt đầu *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Ngày kết thúc *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="max_applications">Số lượng đơn tối đa (tùy chọn)</Label>
            <Input
              id="max_applications"
              type="number"
              value={formData.max_applications}
              onChange={(e) => handleInputChange("max_applications", e.target.value)}
              placeholder="Để trống nếu không giới hạn"
              min="1"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Application Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Câu hỏi ứng tuyển
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addQuestion} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm câu hỏi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Chưa có câu hỏi nào</p>
              <p className="text-sm">Thêm câu hỏi để thu thập thông tin từ ứng viên</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">Câu {index + 1}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label>Câu hỏi</Label>
                        <Input
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                          placeholder="Nhập câu hỏi..."
                          disabled={isLoading}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Loại câu hỏi</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) => updateQuestion(question.id, "type", value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Văn bản</SelectItem>
                              <SelectItem value="multiple-choice">Trắc nghiệm</SelectItem>
                              <SelectItem value="file">Tệp đính kèm</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center pt-6">
                          <input
                            type="checkbox"
                            id={`required-${question.id}`}
                            checked={question.is_required}
                            onChange={(e) => updateQuestion(question.id, "is_required", e.target.checked)}
                            className="mr-2"
                            disabled={isLoading}
                          />
                          <Label htmlFor={`required-${question.id}`}>Bắt buộc</Label>
                        </div>
                      </div>

                      {question.type === "multiple-choice" && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Các lựa chọn</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(question.id)}
                              disabled={isLoading}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Thêm lựa chọn
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {(question.options || []).map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                  placeholder={`Lựa chọn ${optionIndex + 1}`}
                                  disabled={isLoading}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(question.id, optionIndex)}
                                  disabled={isLoading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Hủy
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleSaveDraft} 
          disabled={isLoading}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          {isLoading ? "Đang lưu..." : "Lưu bản nháp"}
        </Button>
        <Button 
          type="button" 
          onClick={handlePublish} 
          disabled={isLoading} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? "Đang xuất bản..." : "Xuất bản chiến dịch"}
        </Button>
      </div>
    </form>
  )
}
