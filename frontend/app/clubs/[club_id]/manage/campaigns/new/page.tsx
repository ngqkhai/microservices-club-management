"use client"
import { useParams, useRouter } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CampaignForm } from "@/components/club-manager/campaign-form"

export default function NewCampaignPage() {
  const params = useParams()
  const router = useRouter()
  const clubId = params.club_id as string

  const handleSave = async (campaignData: any) => {
    // Simulate API call to create campaign
    console.log("Creating campaign:", campaignData)

    // In a real app, you would:
    // await fetch(`/api/clubs/${clubId}/campaigns`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(campaignData)
    // })

    router.push(`/clubs/${clubId}/manage?tab=campaigns`)
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
        <CampaignForm onSave={handleSave} onCancel={() => router.push(`/clubs/${clubId}/manage?tab=campaigns`)} />
      </div>
    </div>
  )
}
