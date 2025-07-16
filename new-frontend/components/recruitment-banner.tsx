"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

interface RecruitmentCampaign {
  campaign_id: string
  club_id: string
  club_name: string
  title: string
  deadline: string
  logo_url: string
}

interface RecruitmentBannerProps {
  campaigns: RecruitmentCampaign[]
}

export function RecruitmentBanner({ campaigns }: RecruitmentBannerProps) {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const updateCountdowns = () => {
      const newTimeLeft: { [key: string]: string } = {}

      campaigns.forEach((campaign) => {
        const deadline = new Date(campaign.deadline)
        const now = new Date()
        const difference = deadline.getTime() - now.getTime()

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24))
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

          if (days > 0) {
            newTimeLeft[campaign.campaign_id] = `${days}d ${hours}h ${minutes}m`
          } else {
            newTimeLeft[campaign.campaign_id] = `${hours}h ${minutes}m`
          }
        } else {
          newTimeLeft[campaign.campaign_id] = "Đã hết hạn"
        }
      })

      setTimeLeft(newTimeLeft)
    }

    updateCountdowns()
    const interval = setInterval(updateCountdowns, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [campaigns])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (campaigns.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="h-6 w-6 mr-2 text-blue-600" />
          Tuyển thành viên
        </h2>
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Đang mở
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.campaign_id} className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={campaign.logo_url || "/placeholder.svg"} alt={campaign.club_name} />
                  <AvatarFallback className="bg-blue-600 text-white">{getInitials(campaign.club_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{campaign.club_name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{campaign.title}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1 text-red-500" />
                      <span
                        className={`font-medium ${timeLeft[campaign.campaign_id] === "Đã hết hạn" ? "text-red-600" : "text-red-500"}`}
                      >
                        {timeLeft[campaign.campaign_id] || "Đang tính..."}
                      </span>
                    </div>

                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Link href={`/clubs/${campaign.club_id}?apply=true`}>
                        Ứng tuyển
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
