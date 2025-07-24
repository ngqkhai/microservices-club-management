import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Club, ClubDetail  } from "@/services/club.service"

interface ClubHeaderProps {
  club: Club | ClubDetail
}

export function ClubHeader({ club }: ClubHeaderProps) {
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

      {/* Club Logo and Name */}
      <div className="absolute inset-0 flex items-center justify-center">
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
    </div>
  )
}
