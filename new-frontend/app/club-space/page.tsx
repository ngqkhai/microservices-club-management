"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ClubSpaceEmptyState } from "./empty-state"

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
]

export default function ClubSpacePage() {
  const router = useRouter()
  const [userClubs] = useState(mockUserClubs)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to check user's clubs
    setTimeout(() => {
      setIsLoading(false)
      if (userClubs.length > 0) {
        // Redirect to first club
        router.replace(`/club-space/${userClubs[0].club_id}`)
      }
    }, 1000)
  }, [router, userClubs])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải Club Space...</p>
        </div>
      </div>
    )
  }

  // Show empty state if no clubs joined
  if (userClubs.length === 0) {
    return <ClubSpaceEmptyState />
  }

  return null // This should not render as we redirect above
}
