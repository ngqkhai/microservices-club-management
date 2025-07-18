"use client"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus } from "lucide-react"

interface Club {
  club_id: string
  name: string
  logo_url: string
  members: number
  role: string
}

interface ClubSwitcherProps {
  clubs: Club[]
  selectedClubId: string
}

export function ClubSwitcher({ clubs, selectedClubId }: ClubSwitcherProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="w-20 bg-gray-800 flex flex-col items-center py-4 space-y-3">
      <TooltipProvider>
        {clubs.map((club) => (
          <Tooltip key={club.club_id}>
            <TooltipTrigger asChild>
              <Link href={`/club-space/${club.club_id}`}>
                <div
                  className={`relative group cursor-pointer transition-all duration-200 ${
                    selectedClubId === club.club_id ? "rounded-2xl" : "rounded-full hover:rounded-2xl"
                  }`}
                >
                  <Avatar className="h-12 w-12 transition-all duration-200">
                    <AvatarImage src={club.logo_url || "/placeholder.svg"} alt={club.name} />
                    <AvatarFallback className="bg-blue-600 text-white font-semibold">
                      {getInitials(club.name)}
                    </AvatarFallback>
                  </Avatar>
                  {selectedClubId === club.club_id && (
                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>{club.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Add Club Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-gray-700 hover:bg-green-600 hover:rounded-2xl transition-all duration-200 text-green-400 hover:text-white"
              asChild
            >
              <Link href="/clubs">
                <Plus className="h-6 w-6" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            <p>Tham gia câu lạc bộ mới</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
