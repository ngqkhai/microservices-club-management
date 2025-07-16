import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Club {
  club_id: string
  name: string
  description: string
  category: string
  members: number
  logo_url?: string
}

interface ClubCardProps {
  club: Club
}

export function ClubCard({ club }: ClubCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Arts: "bg-pink-100 text-pink-800",
      Technology: "bg-blue-100 text-blue-800",
      Sports: "bg-green-100 text-green-800",
      Academic: "bg-purple-100 text-purple-800",
      Service: "bg-orange-100 text-orange-800",
      Business: "bg-yellow-100 text-yellow-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      Arts: "Nghệ thuật",
      Technology: "Công nghệ",
      Sports: "Thể thao",
      Academic: "Học thuật",
      Service: "Tình nguyện",
      Business: "Kinh doanh",
    }
    return labels[category as keyof typeof labels] || category
  }

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4 mb-3">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={club.logo_url || "/assets/default-club-logo.png"}
              alt={club.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-600 text-white font-semibold text-lg">
              {getInitials(club.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className={getCategoryColor(club.category)}>
                {getCategoryLabel(club.category)}
              </Badge>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                {club.members}
              </div>
            </div>
            <CardTitle className="text-lg line-clamp-1">{club.name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="line-clamp-3 mb-4 text-sm leading-relaxed">{club.description}</CardDescription>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
            <Link href={`/clubs/${club.club_id}`}>
              Chi tiết
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            Tham gia
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
