import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Banknote, Heart, Eye } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { eventService } from "@/services/event.service"

interface Event {
  event_id: string
  title: string
  date: string
  time: string
  location: string
  club: string
  fee: number
  fee_display?: string
  currency?: string
  description: string
  is_favorited?: boolean
}

interface EventCardProps {
  event: Event
  showClub?: boolean
  onFavoriteChange?: (eventId: string, isFavorited: boolean) => void
}

export function EventCard({ event, showClub = true, onFavoriteChange }: EventCardProps) {
  const { toast } = useToast()
  const [favorited, setFavorited] = useState(event.is_favorited || false)

  // Function to get appropriate currency icon
  const getCurrencyIcon = (currency?: string) => {
    return <Banknote className="h-3 w-3 text-green-600" />
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            {showClub && <CardDescription className="mt-1">Organized by {event.club}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {event.fee > 0 ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                {getCurrencyIcon(event.currency)}
                {event.fee_display || `${event.fee.toLocaleString("vi-VN")} VNĐ`}
              </Badge>
            ) : (
              <Badge variant="outline">Miễn phí</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {formatTime(event.time)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {event.location}
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{event.description}</p>

        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Link href={`/events/${event.event_id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          <Button
            size="sm"
            variant={favorited ? "default" : "outline"}
            onClick={async () => {
              try {
                const res = await eventService.toggleFavorite(event.event_id)
                if (res.success) {
                  const newFavoriteState = res.data?.is_favorited ?? !favorited
                  setFavorited(newFavoriteState)
                  onFavoriteChange?.(event.event_id, newFavoriteState)
                  toast({
                    title: newFavoriteState ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích",
                  })
                }
              } catch {
                toast({ title: "Lỗi", description: "Không thể cập nhật yêu thích", variant: "destructive" })
              }
            }}
          >
            <Heart className={`h-4 w-4 mr-2 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
            {favorited ? "Đã yêu thích" : "Yêu thích"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
