"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ClubSwitcher } from "@/components/club-space/club-switcher"
import { ClubSpace } from "@/components/club-space/club-space"

// Mock user clubs data
const mockUserClubs = [
  {
    club_id: "tech-club",
    name: "CLB Công nghệ thông tin",
    logo_url: "/placeholder.svg?height=64&width=64",
    members: 78,
    role: "member",
  },
  {
    club_id: "music-club",
    name: "CLB Âm nhạc",
    logo_url: "/placeholder.svg?height=64&width=64",
    members: 45,
    role: "member",
  },
  {
    club_id: "volunteer-club",
    name: "CLB Tình nguyện",
    logo_url: "/placeholder.svg?height=64&width=64",
    members: 67,
    role: "manager",
  },
]

export default function ClubSpaceDetailPage() {
  const params = useParams()
  const clubId = params.club_id as string
  const tab = (params.tab as string[])?.[0] || "discussion"

  const [userClubs, setUserClubs] = useState(mockUserClubs)
  const [selectedClub, setSelectedClub] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to get user's clubs
    setTimeout(() => {
      const club = userClubs.find((c) => c.club_id === clubId)
      setSelectedClub(club)
      setIsLoading(false)
    }, 500)
  }, [clubId, userClubs])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!selectedClub) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy câu lạc bộ</h1>
          <p className="text-gray-600">Bạn chưa tham gia câu lạc bộ này hoặc câu lạc bộ không tồn tại.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Discord-style Club Switcher */}
      <ClubSwitcher clubs={userClubs} selectedClubId={clubId} />

      {/* Main Club Space */}
      <ClubSpace club={selectedClub} activeTab={tab} />
    </div>
  )
}
