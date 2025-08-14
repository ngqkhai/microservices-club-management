"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Club, ClubDetail  } from "@/services/club.service"

interface ClubHeaderProps {
  club: Club | ClubDetail
}

export function ClubHeader({ club }: ClubHeaderProps) {
  const router = useRouter()
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative h-64 md:h-80 w-full overflow-hidden">
      {/* Cover Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${club.cover_url || "/assets/default-cover.png"})`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Breadcrumb and Navigation Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {/* Top Section - Navigation */}
        <div className="bg-gradient-to-b from-black/60 via-black/30 to-transparent pt-6 pb-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Back Button */}
              <Button 
                variant="ghost" 
                onClick={() => router.back()} 
                className="text-white hover:bg-white/20 p-2 h-auto w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              {/* Breadcrumb */}
              <Breadcrumb className="text-white">
                <BreadcrumbList className="text-sm">
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="text-white/90 hover:text-white">
                      Trang chủ
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-white/60" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/clubs" className="text-white/90 hover:text-white">
                      Câu lạc bộ
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-white/60" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white font-medium">
                      {club.name.length > 30 ? club.name.substring(0, 30) + '...' : club.name}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </div>

        {/* Center Section - Club Logo and Name */}
        <div className="flex items-center justify-center flex-1">
          <div className="text-center text-white">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 mx-auto mb-4 border-4 border-white shadow-lg">
              <AvatarImage
                src={club.logo_url || "/assets/default-club-logo.png"}
                alt={club.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-blue-600 text-white text-2xl md:text-3xl font-bold">
                {getInitials(club.name)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl md:text-4xl font-bold drop-shadow-lg">{club.name}</h1>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-6"></div>
      </div>
    </div>
  )
}
