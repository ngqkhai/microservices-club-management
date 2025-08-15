import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  category: string
  members: number
  logo_url?: string
  cover_url?: string
  isPopular?: boolean
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
      "Học thuật": "bg-blue-100 text-blue-800",
      "Nghệ thuật": "bg-purple-100 text-purple-800", 
      "Cộng đồng": "bg-green-100 text-green-800",
      "Thể thao": "bg-green-100 text-green-800",
      "Công nghệ": "bg-blue-100 text-blue-800",
      "Tình nguyện": "bg-orange-100 text-orange-800",
      "Kinh doanh": "bg-yellow-100 text-yellow-800",
      // English versions for backward compatibility
      Arts: "bg-purple-100 text-purple-800",
      Technology: "bg-blue-100 text-blue-800",
      Sports: "bg-green-100 text-green-800",
      Academic: "bg-blue-100 text-blue-800",
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

  const getAvatarColor = (category: string) => {
    const colors = {
      "Học thuật": "bg-blue-500",
      "Nghệ thuật": "bg-purple-500",
      "Cộng đồng": "bg-green-500",
      "Thể thao": "bg-green-500",
      "Công nghệ": "bg-blue-500",
      "Tình nguyện": "bg-orange-500",
      "Kinh doanh": "bg-yellow-500",
      // English versions for backward compatibility
      Arts: "bg-purple-500",
      Technology: "bg-blue-500",
      Sports: "bg-green-500",
      Academic: "bg-blue-500",
      Service: "bg-orange-500",
      Business: "bg-yellow-500",
    }
    return colors[category as keyof typeof colors] || "bg-blue-500"
  }

  // Get cover image URL with fallback to category-based placeholder
  const getCoverImageUrl = () => {
    // First priority: use cover_url if available
    if (club.cover_url) return club.cover_url
    
    // Fallback: Generate a placeholder based on club category
    const imageMap = {
      "Học thuật": "https://images.unsplash.com/photo-1614793319738-bde496bbe85e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
      "Nghệ thuật": "https://images.unsplash.com/photo-1566439934134-6e1aafac9750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300", 
      "Cộng đồng": "https://images.unsplash.com/photo-1663478595761-26d99b2e29f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
      "Thể thao": "https://images.unsplash.com/photo-1571019613540-b866c46ba65d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
      "Công nghệ": "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
      "Tình nguyện": "https://images.unsplash.com/photo-1663478595761-26d99b2e29f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
      "Kinh doanh": "https://images.unsplash.com/photo-1556761175-b413da4baf72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
      // English versions for backward compatibility
      Arts: "https://images.unsplash.com/photo-1566439934134-6e1aafac9750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
      Technology: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
      Sports: "https://images.unsplash.com/photo-1571019613540-b866c46ba65d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
      Academic: "https://images.unsplash.com/photo-1614793319738-bde496bbe85e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
      Service: "https://images.unsplash.com/photo-1663478595761-26d99b2e29f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
      Business: "https://images.unsplash.com/photo-1556761175-b413da4baf72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300",
    }
    
    return imageMap[club.category as keyof typeof imageMap] || "https://images.unsplash.com/photo-1562774053-701939374585?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&h=300"
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
            src={getCoverImageUrl()}
            alt={club.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Overlay content */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Badge className={getCategoryColor(club.category)}>
            {getCategoryLabel(club.category)}
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
            <AvatarImage 
              src={club.logo_url || "/assets/default-club-logo.png"} 
              alt={club.name}
              className="object-cover"
            />
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
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
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
