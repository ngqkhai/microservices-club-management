import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageWithFallback } from "@/components/figma/ImageWithFallback"
import { Users, ArrowRight, Heart } from "lucide-react"
import Link from "next/link"

interface Club {
  club_id: string
  name: string
  description: string
  logo_url: string
  cover_url?: string
  members: number
  category: string
  image?: string
  isPopular?: boolean
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
      "Học thuật": "bg-blue-100 text-blue-800",
      "Nghệ thuật": "bg-purple-100 text-purple-800", 
      "Cộng đồng": "bg-green-100 text-green-800",
      Arts: "bg-purple-100 text-purple-800",
      Technology: "bg-blue-100 text-blue-800",
      Sports: "bg-green-100 text-green-800",
      Academic: "bg-blue-100 text-blue-800",
      Service: "bg-green-100 text-green-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getAvatarColor = (category: string) => {
    const colors = {
      "Học thuật": "bg-blue-500",
      "Nghệ thuật": "bg-purple-500",
      "Cộng đồng": "bg-green-500",
      Arts: "bg-purple-500",
      Technology: "bg-blue-500",
      Sports: "bg-green-500", 
      Academic: "bg-blue-500",
      Service: "bg-green-500",
    }
    return colors[category as keyof typeof colors] || "bg-primary"
  }

  return (
    <Link href={`/clubs/${club.club_id}`}>
      <Card 
        className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20 cursor-pointer" 
        data-testid="club-card"
      >
      {/* Card Header with Image */}
      <CardHeader className="p-0 relative">
        <div className="aspect-video overflow-hidden">
          <ImageWithFallback
            src={club.image || club.cover_url || "https://images.unsplash.com/photo-1614793319738-bde496bbe85e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZGViYXRlJTIwY2x1YnxlbnwxfHx8fDE3NTUxNjY1NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"}
            alt={club.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Overlay content */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Badge className={getCategoryColor(club.category)}>
            {club.category}
          </Badge>
          {club.isPopular && (
            <Badge variant="destructive" className="bg-red-500">
              <Heart className="w-3 h-3 mr-1" />
              Phổ biến
            </Badge>
          )}
        </div>

        {/* Club Avatar */}
        <div className="absolute -bottom-6 left-6">
          <Avatar className="h-12 w-12 border-4 border-white shadow-lg">
            <AvatarImage src={club.logo_url || club.cover_url || "/placeholder.svg"} alt={club.name} />
            <AvatarFallback className={`${getAvatarColor(club.category)} text-white font-bold`}>
              {getInitials(club.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>

      {/* Card Content */}
      <CardContent className="pt-8 pb-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
            {club.name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {club.description}
          </p>
        </div>

        {/* Members count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500">
            <Users className="h-4 w-4 mr-2" />
            <span className="text-sm">{club.members} thành viên</span>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}
