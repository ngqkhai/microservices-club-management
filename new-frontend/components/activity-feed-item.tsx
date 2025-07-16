import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, DollarSign, Eye } from "lucide-react"
import Link from "next/link"

interface Event {
  event_id: string
  title: string
  start_time: string
  club_name: string
  status: string
  fee: number
  location: string
}

interface ActivityFeedItemProps {
  event: Event
}

export function ActivityFeedItem({ event }: ActivityFeedItemProps) {
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      }),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { label: "Sắp diễn ra", className: "bg-blue-100 text-blue-800" },
      ongoing: { label: "Đang diễn ra", className: "bg-green-100 text-green-800" },
      ended: { label: "Đã kết thúc", className: "bg-gray-100 text-gray-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const { date, time } = formatDateTime(event.start_time)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Date/Time Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>

            {/* Event Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{event.club_name}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {date} • {time}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {event.location}
                </div>
                {event.fee > 0 && (
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {event.fee.toLocaleString("vi-VN")}đ
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status and Action */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {getStatusBadge(event.status)}
            <Button asChild size="sm" variant="outline">
              <Link href={`/events/${event.event_id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Chi tiết
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
