"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecruitmentBanner } from "@/components/recruitment-banner"
import { RecruitmentCard } from "@/components/recruitment-card"
import { ApplicationForm } from "@/components/application-form"
import { UserApplications } from "@/components/user-applications"
import { useCampaigns } from "@/hooks/use-campaigns"
import { Campaign } from "@/services/campaign.service"
import { useAuthStore } from "@/stores/auth-store"
import { Users, PlusCircle } from "lucide-react"

export default function RecruitmentPage() {
  const { user } = useAuthStore()
  const isAuthenticated = !!user
  const { campaigns, loading, error, loadPublishedCampaigns } = useCampaigns()
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'browse' | 'my-applications'>('browse')

  useEffect(() => {
    loadPublishedCampaigns({ limit: 20 })
  }, [loadPublishedCampaigns])

  const handleApplyCampaign = (campaign: Campaign) => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      console.log("Please login to apply")
      return
    }
    
    setSelectedCampaign(campaign)
    setShowApplicationForm(true)
  }

  const handleCloseApplicationForm = () => {
    setShowApplicationForm(false)
    setSelectedCampaign(null)
  }

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false)
    setSelectedCampaign(null)
    // Optionally switch to my applications tab
    setActiveTab('my-applications')
  }

  if (loading && !campaigns.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Tuyển thành viên câu lạc bộ</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Khám phá các câu lạc bộ thú vị và tham gia vào cộng đồng sinh viên sôi động. 
          Tìm kiếm những cơ hội phát triển bản thân và kết nối với những người có cùng đam mê.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center space-x-1 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
        <Button
          variant={activeTab === 'browse' ? 'default' : 'ghost'}
          className="flex-1"
          onClick={() => setActiveTab('browse')}
        >
          <Users className="h-4 w-4 mr-2" />
          Duyệt chiến dịch
        </Button>
        {isAuthenticated && (
          <Button
            variant={activeTab === 'my-applications' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('my-applications')}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Đơn của tôi
          </Button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'browse' && (
        <div className="space-y-8">
          {/* Featured Campaigns Banner */}
          {campaigns.length > 0 && (
            <RecruitmentBanner 
              campaigns={campaigns.slice(0, 6)} 
              onApply={handleApplyCampaign}
            />
          )}

          {/* All Campaigns Grid */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Tất cả chiến dịch tuyển thành viên</h2>
              {campaigns.length > 0 && (
                <span className="text-gray-600">{campaigns.length} chiến dịch</span>
              )}
            </div>

            {error && (
              <Card className="border-red-200">
                <CardContent className="p-6 text-center">
                  <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải chiến dịch tuyển thành viên</p>
                  <Button 
                    onClick={() => loadPublishedCampaigns({ limit: 20 })} 
                    variant="outline"
                  >
                    Thử lại
                  </Button>
                </CardContent>
              </Card>
            )}

            {campaigns.length === 0 && !loading && !error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có chiến dịch tuyển thành viên nào
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Hiện tại chưa có câu lạc bộ nào đang tuyển thành viên. 
                    Hãy quay lại sau để khám phá các cơ hội mới!
                  </p>
                  <Button onClick={() => loadPublishedCampaigns({ limit: 20 })} variant="outline">
                    Tải lại
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <RecruitmentCard
                    key={campaign.id}
                    campaign={campaign}
                    onApply={handleApplyCampaign}
                    showClubName={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'my-applications' && isAuthenticated && (
        <UserApplications />
      )}

      {/* Login prompt for unauthenticated users */}
      {activeTab === 'my-applications' && !isAuthenticated && (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Đăng nhập để xem đơn ứng tuyển
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn cần đăng nhập để xem và quản lý các đơn ứng tuyển của mình.
            </p>
            <Button asChild>
              <a href="/login">Đăng nhập</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Application Form Modal */}
      {showApplicationForm && selectedCampaign && (
        <ApplicationForm
          campaign={selectedCampaign}
          onClose={handleCloseApplicationForm}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  )
}
