"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ClubPreviewCard } from "@/components/club-preview-card"
import { ActivityFeedItem } from "@/components/activity-feed-item"

// Mock data for featured clubs
const featuredClubs = [
  {
    club_id: "music-club",
    name: "CLB Âm nhạc",
    description:
      "Câu lạc bộ về nghệ thuật biểu diễn và âm nhạc, nơi các thành viên có thể phát triển tài năng và đam mê âm nhạc",
    logo_url: "/placeholder.svg?height=80&width=80",
    members: 45,
    category: "Arts",
  },
  {
    club_id: "tech-club",
    name: "CLB Công nghệ thông tin",
    description: "Khám phá thế giới công nghệ, lập trình và đổi mới sáng tạo cùng những người bạn cùng chí hướng",
    logo_url: "/placeholder.svg?height=80&width=80",
    members: 78,
    category: "Technology",
  },
  {
    club_id: "sports-club",
    name: "CLB Thể thao",
    description: "Duy trì sức khỏe và tinh thần thể thao thông qua các hoạt động thể dục thể thao đa dạng",
    logo_url: "/placeholder.svg?height=80&width=80",
    members: 92,
    category: "Sports",
  },
  {
    club_id: "debate-club",
    name: "CLB Tranh luận",
    description: "Phát triển kỹ năng tư duy phản biện và khả năng diễn đạt thông qua các cuộc tranh luận",
    logo_url: "/placeholder.svg?height=80&width=80",
    members: 34,
    category: "Academic",
  },
  {
    club_id: "volunteer-club",
    name: "CLB Tình nguyện",
    description: "Góp phần xây dựng cộng đồng tốt đẹp thông qua các hoạt động tình nguyện ý nghĩa",
    logo_url: "/placeholder.svg?height=80&width=80",
    members: 67,
    category: "Service",
  },
  {
    club_id: "art-club",
    name: "CLB Nghệ thuật",
    description: "Thể hiện sự sáng tạo qua hội họa, điêu khắc và các hình thức nghệ thuật thị giác",
    logo_url: "/placeholder.svg?height=80&width=80",
    members: 56,
    category: "Arts",
  },
]

// Mock data for recent and upcoming events
const recentAndUpcomingEvents = {
  upcoming: [
    {
      event_id: "workshop-git",
      title: "Workshop Git & GitHub",
      start_time: "2024-07-18T13:00:00",
      club_name: "CLB Công nghệ thông tin",
      status: "upcoming",
      fee: 0,
      location: "Phòng máy tính 201",
    },
    {
      event_id: "music-concert",
      title: "Đêm nhạc mùa xuân 2024",
      start_time: "2024-07-20T19:00:00",
      club_name: "CLB Âm nhạc",
      status: "upcoming",
      fee: 50000,
      location: "Hội trường lớn",
    },
    {
      event_id: "sports-tournament",
      title: "Giải bóng đá liên câu lạc bộ",
      start_time: "2024-07-22T16:00:00",
      club_name: "CLB Thể thao",
      status: "upcoming",
      fee: 0,
      location: "Sân bóng đá trường",
    },
  ],
  recent: [
    {
      event_id: "soft-skills-seminar",
      title: "Seminar Kỹ năng mềm",
      start_time: "2024-07-10T09:00:00",
      club_name: "CLB Kỹ năng sống",
      status: "ended",
      fee: 30000,
      location: "Hội trường nhỏ",
    },
    {
      event_id: "art-exhibition",
      title: "Triển lãm nghệ thuật sinh viên",
      start_time: "2024-07-12T17:00:00",
      club_name: "CLB Nghệ thuật",
      status: "ended",
      fee: 0,
      location: "Phòng triển lãm",
    },
  ],
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Khám phá
            <span className="text-blue-600"> Cộng đồng</span> của bạn
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tham gia các câu lạc bộ, sự kiện và kết nối với những sinh viên cùng sở thích tại trường đại học. Hành trình
            khám phá bản thân bắt đầu từ đây.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/clubs">
                <Users className="mr-2 h-5 w-5" />
                Tham gia câu lạc bộ
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/events">
                <Calendar className="mr-2 h-5 w-5" />
                Khám phá sự kiện
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-lg bg-blue-50">
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Câu lạc bộ hoạt động</div>
            </div>
            <div className="p-6 rounded-lg bg-green-50">
              <div className="text-3xl font-bold text-green-600 mb-2">200+</div>
              <div className="text-gray-600">Sự kiện hàng tháng</div>
            </div>
            <div className="p-6 rounded-lg bg-purple-50">
              <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
              <div className="text-gray-600">Thành viên tích cực</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clubs Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Câu lạc bộ nổi bật</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá những câu lạc bộ phổ biến và năng động nhất. Tìm đam mê của bạn và kết nối với những người có
              cùng sở thích.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredClubs.map((club) => (
                <ClubPreviewCard key={club.club_id} club={club} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/clubs">
                Xem tất cả câu lạc bộ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Activities Feed */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hoạt động gần đây</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cập nhật những sự kiện mới nhất và sắp diễn ra từ các câu lạc bộ
            </p>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="upcoming">Sắp diễn ra</TabsTrigger>
              <TabsTrigger value="recent">Gần đây</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                          <div className="h-8 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAndUpcomingEvents.upcoming.map((event) => (
                    <ActivityFeedItem key={event.event_id} event={event} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                          <div className="h-8 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAndUpcomingEvents.recent.map((event) => (
                    <ActivityFeedItem key={event.event_id} event={event} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/events">
                Xem tất cả sự kiện
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Tham gia cùng hàng nghìn sinh viên đã tìm thấy cộng đồng của mình thông qua các câu lạc bộ và sự kiện.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/signup">Tạo tài khoản</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
