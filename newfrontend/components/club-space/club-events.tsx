"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Users, Camera } from "lucide-react"

interface ClubEventsProps {
  clubId: string
}

// Mock events data
const mockEvents = {
  upcoming: [
    {
      id: "1",
      title: "Workshop React Advanced",
      date: "2024-03-25",
      time: "14:00",
      location: "Phòng máy tính 201",
      description: "Học các kỹ thuật React nâng cao và best practices",
      attendees: 25,
      maxAttendees: 30,
      isRegistered: false,
    },
    {
      id: "2",
      title: "Hackathon 2024",
      date: "2024-04-01",
      time: "09:00",
      location: "Tech Hub",
      description: "Cuộc thi lập trình 48 giờ với giải thưởng hấp dẫn",
      attendees: 45,
      maxAttendees: 50,
      isRegistered: true,
    },
  ],
  past: [
    {
      id: "3",
      title: "Git & GitHub Workshop",
      date: "2024-03-10",
      time: "18:00",
      location: "Phòng máy tính 101",
      description: "Học cách sử dụng Git và GitHub hiệu quả",
      attendees: 35,
      photos: [
        "/placeholder.svg?height=150&width=200",
        "/placeholder.svg?height=150&width=200",
        "/placeholder.svg?height=150&width=200",
      ],
    },
  ],
}

export function ClubEvents({ clubId }: ClubEventsProps) {
  const [events] = useState(mockEvents)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    return `${hours}:${minutes}`
  }

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Sự kiện
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Sắp tới ({events.upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Đã qua ({events.past.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-4">
            {events.upcoming.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="mt-2">{event.description}</CardDescription>
                    </div>
                    <Badge variant={event.isRegistered ? "default" : "outline"}>
                      {event.isRegistered ? "Đã đăng ký" : "Chưa đăng ký"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
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
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {event.attendees}/{event.maxAttendees} người tham gia
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {event.isRegistered ? (
                      <Button variant="outline" size="sm">
                        Hủy đăng ký
                      </Button>
                    ) : (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Đăng ký tham gia
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 mt-4">
            {events.past.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
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
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {event.attendees} người đã tham gia
                    </div>
                  </div>

                  {event.photos && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <Camera className="h-4 w-4 mr-2" />
                        Hình ảnh sự kiện
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {event.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo || "/placeholder.svg"}
                            alt={`Event photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
