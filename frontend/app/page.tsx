"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, ArrowRight, RefreshCw } from "lucide-react"
import Link from "next/link"
import { ClubPreviewCard } from "@/components/club-preview-card"
import { ActivityFeedItem } from "@/components/activity-feed-item"
import { useFeaturedClubsStore } from "@/stores/featured-clubs-store"
import { eventService } from "@/services/event.service"

interface EventData {
  event_id: string
  title: string
  start_time: string
  club_name: string
  status: string
  fee: number
  location: string
  event_logo_url?: string
  event_image_url?: string
}

export default function HomePage() {
  const [eventsLoading, setEventsLoading] = useState(true)
  const [recentLoading, setRecentLoading] = useState(false)
  const [recentAndUpcomingEvents, setRecentAndUpcomingEvents] = useState<{
    upcoming: EventData[]
    recent: EventData[]
  }>({
    upcoming: [],
    recent: []
  })
  
  // Featured clubs store
  const { cache, loadFeaturedClubs, resetRetry } = useFeaturedClubsStore()

  useEffect(() => {
    // Load featured clubs if not already loaded
    if (!cache.isLoaded && !cache.isLoading) {
      loadFeaturedClubs()
    }
  }, [cache.isLoaded, cache.isLoading, loadFeaturedClubs])

  useEffect(() => {
    // Fetch upcoming events only on initial load
    const fetchUpcomingEvents = async () => {
      setEventsLoading(true)
      try {
        const upcomingResponse = await eventService.getEvents({
          limit: 3,
          filter: 'upcoming',
          status: 'published'
        })

        const upcoming = upcomingResponse.success ? upcomingResponse.data?.events || [] : []

        setRecentAndUpcomingEvents(prev => ({
          ...prev,
          upcoming: upcoming.map((event: any) => ({
            event_id: event.id,
            title: event.title,
            start_time: event.start_date,
            club_name: event.club?.name || 'Unknown Club',
            status: 'upcoming',
            fee: event.participation_fee || 0,
            location: event.location?.address || event.location?.room || 
                     (event.location?.location_type === 'virtual' ? 'Online' : 'TBA'),
            event_logo_url: event.event_logo_url,
            event_image_url: event.event_image_url
          }))
        }))
      } catch (error) {
        console.error('Failed to fetch upcoming events:', error)
        setRecentAndUpcomingEvents(prev => ({
          ...prev,
          upcoming: []
        }))
      } finally {
        setEventsLoading(false)
      }
    }

    fetchUpcomingEvents()
  }, [])

  // Function to fetch recent events
  const fetchRecentEvents = async () => {
    if (recentAndUpcomingEvents.recent.length > 0) return // Already loaded
    
    setRecentLoading(true)
    try {
      const recentResponse = await eventService.getEvents({
        limit: 2,
        status: 'completed'
      })

      const recent = recentResponse.success ? recentResponse.data?.events || [] : []

      setRecentAndUpcomingEvents(prev => ({
        ...prev,
        recent: recent.map((event: any) => ({
          event_id: event.id,
          title: event.title,
          start_time: event.start_date,
          club_name: event.club?.name || 'Unknown Club',
          status: 'ended',
          fee: event.participation_fee || 0,
          location: event.location?.address || event.location?.room || 
                   (event.location?.location_type === 'virtual' ? 'Online' : 'TBA'),
          event_logo_url: event.event_logo_url,
          event_image_url: event.event_image_url
        }))
      }))
    } catch (error) {
      console.error('Failed to fetch recent events:', error)
      setRecentAndUpcomingEvents(prev => ({
        ...prev,
        recent: []
      }))
    } finally {
      setRecentLoading(false)
    }
  }

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

          {cache.isLoading ? (
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
          ) : cache.error ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <p className="text-red-600 mb-4">{cache.error}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => {
                      resetRetry()
                      loadFeaturedClubs()
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Thử lại ({cache.retryCount}/3)
                  </Button>
                  <Button asChild variant="default">
                    <Link href="/clubs">Xem tất cả câu lạc bộ</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : cache.featuredClubs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Hiện tại chưa có câu lạc bộ nào.</p>
              <Button asChild variant="outline">
                <Link href="/clubs">Khám phá câu lạc bộ</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {cache.featuredClubs.map((club) => (
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

          <Tabs defaultValue="upcoming" className="w-full" onValueChange={(value) => {
            if (value === 'recent') {
              fetchRecentEvents()
            }
          }}>
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="upcoming">Sắp diễn ra</TabsTrigger>
              <TabsTrigger value="recent">Gần đây</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {eventsLoading ? (
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
              {recentLoading ? (
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
                  {recentAndUpcomingEvents.recent.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Không có sự kiện gần đây.</p>
                    </div>
                  ) : (
                    recentAndUpcomingEvents.recent.map((event) => (
                      <ActivityFeedItem key={event.event_id} event={event} />
                    ))
                  )}
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
