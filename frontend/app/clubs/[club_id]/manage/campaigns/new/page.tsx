"use client"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CampaignForm } from "@/components/club-manager/campaign-form"
import { campaignService, type ApplicationQuestion } from "@/services/campaign.service"

interface CampaignFormData {
  title: string
  description: string
  requirements: string[]
  application_questions: {
    id: string
    question: string
    type: "text" | "multiple-choice" | "file"
    options?: string[]
    is_required: boolean
  }[]
  start_date: string
  end_date: string
  max_applications?: number
}

/**
 * New Campaign Page
 * 
 * This page allows club managers to create new recruitment campaigns.
 * When the "Tạo chiến dịch" (Create Campaign) button is clicked, it calls the
 * POST /api/clubs/{clubId}/campaigns endpoint following the API documentation.
 * 
 * Features:
 * - Form validation before submission
 * - Loading states during API calls
 * - Error handling with user-friendly messages
 * - Automatic redirect to campaign management after success
 * - Data transformation to match API expectations
 */

export default function NewCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const clubId = params.club_id as string
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async (campaignData: CampaignFormData) => {
    setIsLoading(true)
    
    try {
      console.log("Creating campaign for club:", clubId, "with data:", campaignData)
      
      // Transform the form data to match API expectations
      const apiData = {
        title: campaignData.title,
        description: campaignData.description,
        requirements: campaignData.requirements || [],
        application_questions: (campaignData.application_questions || []).map((q): ApplicationQuestion => ({
          id: q.id,
          question: q.question,
          type: q.type === 'multiple-choice' ? 'select' : 
                q.type === 'file' ? 'textarea' : 'text', // Transform type to match API
          required: q.is_required,
          options: q.type === 'multiple-choice' ? q.options : undefined
        })),
        start_date: new Date(campaignData.start_date).toISOString(),
        end_date: new Date(campaignData.end_date).toISOString(),
        max_applications: campaignData.max_applications || undefined,
        status: 'draft' as const
      }

      console.log("Transformed API data:", apiData)

      const response = await campaignService.createCampaign(clubId, apiData)
      
      if (response.success && response.data) {
        toast({
          title: "Thành công",
          description: `Chiến dịch "${response.data.title}" đã được tạo thành công.`,
        })
        router.push(`/clubs/${clubId}/manage?tab=campaigns`)
      } else {
        throw new Error(response.message || "Không thể tạo chiến dịch")
      }
    } catch (error: any) {
      console.error("Error creating campaign:", error)
      
      let errorMessage = "Không thể tạo chiến dịch."
      
      // Handle validation errors
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.join(", ")
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
              <BreadcrumbLink href={`/clubs/${clubId}/manage`}>Quản lý</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Tạo chiến dịch</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tạo chiến dịch mới</h1>
          <p className="mt-2 text-gray-600">Tạo một chiến dịch tuyển dụng mới cho câu lạc bộ của bạn.</p>
        </div>

        {/* Campaign Form */}
        <CampaignForm 
          onSave={handleSave} 
          onCancel={() => router.push(`/clubs/${clubId}/manage?tab=campaigns`)}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
