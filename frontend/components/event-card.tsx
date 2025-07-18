import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, DollarSign, Heart, Eye } from "lucide-react"
import Link from "next/link"

interface Event {
  event_id: string
  title: string
  date: string
  time: string
  location: string
  club: string
  fee: number
  description: string
}

interface EventCardProps {
  event: Event
  showClub?: boolean
}

export function EventCard({ event, showClub = true }: EventCardProps) {
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
                <DollarSign className="h-3 w-3" />${event.fee}
              </Badge>
            ) : (
              <Badge variant="outline">Free</Badge>
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
          <Button size="sm" variant="outline">
            <Heart className="h-4 w-4 mr-2" />
            Interested
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
