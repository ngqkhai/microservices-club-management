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
  logo_url: string
  members: number
  category: string
}

interface ClubPreviewCardProps {
  club: Club
}

export function ClubPreviewCard({ club }: ClubPreviewCardProps) {
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
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <Avatar className="h-12 w-12 mr-4">
          <AvatarImage src={club.logo_url || "/placeholder.svg"} alt={club.name} />
          <AvatarFallback className="bg-blue-600 text-white font-semibold">{getInitials(club.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg line-clamp-1">{club.name}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className={getCategoryColor(club.category)}>
              {club.category}
            </Badge>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-3 w-3 mr-1" />
              {club.members}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3 mb-4 text-sm leading-relaxed">{club.description}</CardDescription>
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
          <Link href={`/clubs/${club.club_id}`}>
            Xem chi tiết
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
