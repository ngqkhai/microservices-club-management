"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Calendar, ArrowRight, RefreshCw, TrendingUp, UserPlus, LogIn, Heart, Clock, MapPin, Star } from "lucide-react"
import Link from "next/link"
import { ClubPreviewCard } from "@/components/club-preview-card"
import { ActivityFeedItem } from "@/components/activity-feed-item"
import { ImageWithFallback } from "@/components/figma/ImageWithFallback"
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

  // Helper functions for club display
  const getClubImage = (clubName: string) => {
    const imageMap: { [key: string]: string } = {
      "CLB Tranh luận": "https://images.unsplash.com/photo-1614793319738-bde496bbe85e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZGViYXRlJTIwY2x1YnxlbnwxfHx8fDE3NTUxNjY1NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "CLB Nhiếp ảnh": "https://images.unsplash.com/photo-1566439934134-6e1aafac9750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMGNsdWIlMjBzdHVkZW50c3xlbnwxfHx8fDE3NTUxNjY1NTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "CLB Hoạt động xã hội": "https://images.unsplash.com/photo-1663478595761-26d99b2e29f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBncm91cCUyMGFjdGl2aXRpZXN8ZW58MXx8fHwxNzU1MTY2NTUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
    }
    
    // Generate image based on category for unknown clubs
    if (!imageMap[clubName]) {
      const categoryImages = [
        "https://images.unsplash.com/photo-1614793319738-bde496bbe85e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZGViYXRlJTIwY2x1YnxlbnwxfHx8fDE3NTUxNjY1NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1566439934134-6e1aafac9750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMGNsdWIlMjBzdHVkZW50c3xlbnwxfHx8fDE3NTUxNjY1NTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1663478595761-26d99b2e29f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBncm91cCUyMGFjdGl2aXRpZXN8ZW58MXx8fHwxNzU1MTY2NTUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
      ];
      return categoryImages[Math.abs(clubName.length) % categoryImages.length];
    }
    
    return imageMap[clubName];
  }

  const isPopularClub = (clubName: string) => {
    const popularClubs = ["CLB Tranh luận", "CLB Hoạt động xã hội"]
    return popularClubs.includes(clubName)
  }

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-100/40 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Khám phá{" "}
              <span className="text-primary">Cộng đồng</span>{" "}
              của bạn
          </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Kết nối với những người bạn cùng sở thích, tham gia các câu lạc bộ thú vị 
              và khám phá những trải nghiệm đáng nhớ trong cuộc sống đại học của bạn.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg">
              <Link href="/clubs">
                <Users className="mr-2 h-5 w-5" />
                Tham gia câu lạc bộ
                  <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
              <Button 
                asChild
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg"
              >
              <Link href="/events">
                <Calendar className="mr-2 h-5 w-5" />
                Khám phá sự kiện
              </Link>
            </Button>
            </div>

            {/* Hero Image - Community Illustration */}
            <div className="relative max-w-4xl mx-auto">
              <div className="aspect-video rounded-2xl shadow-2xl overflow-hidden">
                <ImageWithFallback
                  src="/Illustration.jpg"
                  alt="Hình ảnh minh họa cộng đồng sinh viên - Ngày hội việc làm MY JOBS"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-200 rounded-full opacity-60 animate-bounce delay-1000"></div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-green-200 rounded-full opacity-60 animate-bounce delay-500"></div>
              <div className="absolute top-1/2 -right-8 w-12 h-12 bg-purple-200 rounded-full opacity-60 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cộng đồng UniVibe trong con số
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn sinh viên khác trong những hoạt động ý nghĩa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "50+",
                subtitle: "Câu lạc bộ",
                description: "Đa dạng lĩnh vực và sở thích",
                icon: Users,
                color: "text-blue-600",
                bgColor: "bg-blue-100",
              },
              {
                title: "200+",
                subtitle: "Sự kiện/tháng",
                description: "Hoạt động phong phú và bổ ích",
                icon: Calendar,
                color: "text-green-600",
                bgColor: "bg-green-100",
              },
              {
                title: "1000+",
                subtitle: "Thành viên",
                description: "Cộng đồng sinh viên sôi động",
                icon: TrendingUp,
                color: "text-purple-600",
                bgColor: "bg-purple-100",
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20"
                >
                  <CardContent className="p-8 text-center">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} rounded-full mb-6`}>
                      <Icon className={`w-8 h-8 ${stat.color}`} />
            </div>

                    {/* Number */}
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {stat.title}
            </div>

                    {/* Subtitle */}
                    <div className="text-xl font-semibold text-gray-700 mb-2">
                      {stat.subtitle}
            </div>

                    {/* Description */}
                    <p className="text-gray-600">
                      {stat.description}
                    </p>

                    {/* Background decoration */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full"></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Clubs Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Câu lạc bộ nổi bật
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Khám phá những câu lạc bộ được yêu thích nhất tại trường đại học
            </p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Xem tất cả câu lạc bộ
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cache.featuredClubs.length > 0 ? (
                cache.featuredClubs.map((club) => (
                  <ClubPreviewCard 
                    key={club.club_id} 
                    club={{
                      ...club,
                      image: getClubImage(club.name),
                      isPopular: isPopularClub(club.name)
                    }} 
                  />
                ))
              ) : (
                // Fallback mock data when no clubs available
                [
                  {
                    club_id: "1",
                    name: "CLB Tranh luận",
                    category: "Học thuật",
                    members: 156,
                    description: "Phát triển kỹ năng thuyết trình và tư duy phản biện thông qua các cuộc tranh luận sôi nổi.",
                    logo_url: "",
                    image: "https://images.unsplash.com/photo-1614793319738-bde496bbe85e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZGViYXRlJTIwY2x1YnxlbnwxfHx8fDE3NTUxNjY1NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
                    isPopular: true,
                  },
                  {
                    club_id: "2", 
                    name: "CLB Nhiếp ảnh",
                    category: "Nghệ thuật",
                    members: 89,
                    description: "Khám phá thế giới qua ống kính, học hỏi kỹ thuật chụp ảnh và chia sẻ những khoảnh khắc đẹp.",
                    logo_url: "",
                    image: "https://images.unsplash.com/photo-1566439934134-6e1aafac9750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMGNsdWIlMjBzdHVkZW50c3xlbnwxfHx8fDE3NTUxNjY1NTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
                    isPopular: false,
                  },
                  {
                    club_id: "3",
                    name: "CLB Hoạt động xã hội", 
                    category: "Cộng đồng",
                    members: 234,
                    description: "Tham gia các hoạt động thiện nguyện, góp phần xây dựng cộng đồng tốt đẹp hơn.",
                    logo_url: "",
                    image: "https://images.unsplash.com/photo-1663478595761-26d99b2e29f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBncm91cCUyMGFjdGl2aXRpZXN8ZW58MXx8fHwxNzU1MTY2NTUyfDA&ixlib=rb-4.1.0&q=80&w=1080",
                    isPopular: true,
                  },
                ].map((club) => (
                <ClubPreviewCard key={club.club_id} club={club} />
                ))
              )}
            </div>
          )}

        </div>
      </section>

      {/* Recent Activities Feed */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hoạt động cộng đồng
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Theo dõi các sự kiện sắp diễn ra và những hoạt động đã diễn ra gần đây
            </p>
          </div>

          <Tabs defaultValue="upcoming" className="w-full" onValueChange={(value) => {
            if (value === 'recent') {
              fetchRecentEvents()
            }
          }}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="upcoming">Sắp diễn ra</TabsTrigger>
              <TabsTrigger value="recent">Gần đây</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              {eventsLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-60 aspect-video sm:aspect-square bg-gray-200"></div>
                        <CardContent className="flex-1 p-6">
                          <div className="h-4 bg-gray-200 rounded mb-4 w-24"></div>
                          <div className="h-6 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-4 w-32"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-40"></div>
                            <div className="h-3 bg-gray-200 rounded w-36"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                        </CardContent>
                        </div>
                    </Card>
                  ))}
                </div>
              ) : recentAndUpcomingEvents.upcoming.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Không có sự kiện sắp diễn ra</p>
                  <p>Hãy kiểm tra lại sau để cập nhật những hoạt động mới nhất.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Mock data events với thiết kế giống Figma */}
                  {[
                    {
                      event_id: "mock-1",
                      title: "Ngày hội Văn hóa quốc tế",
                      club_name: "CLB Văn hóa đa quốc gia",
                      date: "12 Tháng 8",
                      time: "09:00 - 17:00",
                      location: "Sân trường",
                      participants: 320,
                      rating: 4.8,
                      image: "https://images.unsplash.com/photo-1614793319738-bde496bbe85e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZXZlbnQlMjBjdWx0dXJhbHxlbnwxfHx8fDE3NTUxNjY2MjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
                      type: "Sự kiện",
                      category: "Cultural"
                    },
                    {
                      event_id: "mock-2",
                      title: "Triển lãm Nhiếp ảnh sinh viên",
                      club_name: "CLB Nhiếp ảnh",
                      date: "10 Tháng 8",
                      time: "10:00 - 18:00",
                      location: "Thư viện trung tâm",
                      participants: 156,
                      rating: 4.5,
                      image: "https://images.unsplash.com/photo-1566439934134-6e1aafac9750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMGV4aGliaXRpb258ZW58MXx8fHwxNzU1MTY2NjI0fDA&ixlib=rb-4.1.0&q=80&w=1080",
                      type: "Triển lãm",
                      category: "Exhibition"
                    }
                  ].map((event) => (
                    <Card key={event.event_id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex flex-col sm:flex-row">
                        {/* Event Image */}
                        <div className="sm:w-60 aspect-video sm:aspect-square overflow-hidden">
                          <ImageWithFallback
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Event Content */}
                        <CardContent className="flex-1 p-6">
                          <div className="flex flex-col h-full">
                            {/* Header with badges and rating */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex gap-2">
                                <Badge 
                                  variant="default"
                                  className="bg-primary text-white"
                                >
                                  {event.type}
                                </Badge>
                                {event.type === "Triển lãm" && (
                                  <Badge 
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-800"
                                  >
                                    Triển lãm
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center text-yellow-500">
                                <Star className="w-4 h-4 mr-1 fill-current" />
                                <span className="text-sm font-medium">{event.rating}</span>
                              </div>
                            </div>

                            {/* Title and Club */}
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                              {event.title}
                            </h3>
                            <p className="text-sm text-primary font-medium mb-4">
                              {event.club_name}
                            </p>

                            {/* Event Details */}
                            <div className="space-y-2 mb-6 flex-1">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                                <span className="text-sm">{event.date}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="w-4 h-4 mr-3 text-gray-400" />
                                <span className="text-sm">{event.time}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                                <span className="text-sm">{event.location}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Users className="w-4 h-4 mr-3 text-gray-400" />
                                <span className="text-sm">{event.participants} người tham gia</span>
                              </div>
                            </div>

                            {/* Action Button */}
                            <Button 
                              asChild
                              size="sm" 
                              className="bg-primary hover:bg-primary/90 text-white self-start group-hover:shadow-md transition-all"
                            >
                              <Link href={`/events/${event.event_id}`}>
                                Xem chi tiết
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              {recentLoading ? (
                <div className="space-y-6">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-60 aspect-video sm:aspect-square bg-gray-200"></div>
                        <CardContent className="flex-1 p-6">
                          <div className="h-4 bg-gray-200 rounded mb-4 w-24"></div>
                          <div className="h-6 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-4 w-32"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-40"></div>
                            <div className="h-3 bg-gray-200 rounded w-36"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                        </CardContent>
                        </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {recentAndUpcomingEvents.recent.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Không có sự kiện gần đây</p>
                      <p>Hãy tham gia các hoạt động để tạo nên những kỷ niệm đẹp.</p>
                    </div>
                  ) : (
                    recentAndUpcomingEvents.recent.map((event) => (
                      <Card key={event.event_id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="flex flex-col sm:flex-row">
                          {/* Event Image */}
                          <div className="sm:w-60 aspect-video sm:aspect-square overflow-hidden">
                            <ImageWithFallback
                              src={(event as any).image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMGNvbW11bml0eXxlbnwxfHx8fDE3NTUxNjY2Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080"}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Event Content */}
                          <CardContent className="flex-1 p-6">
                            <div className="flex flex-col h-full">
                              {/* Header with badges and rating */}
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <Badge variant="secondary">
                                    Đã diễn ra
                                  </Badge>
                                </div>
                                <div className="flex items-center text-yellow-500">
                                  <Star className="w-4 h-4 mr-1 fill-current" />
                                  <span className="text-sm font-medium">4.2</span>
                                </div>
                              </div>

                              {/* Title and Club */}
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                {event.title}
                              </h3>
                              <p className="text-sm text-primary font-medium mb-4">
                                {(event as any).club?.name || "Câu lạc bộ"}
                              </p>

                              {/* Event Details */}
                              <div className="space-y-2 mb-6 flex-1">
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                                  <span className="text-sm">{new Date(event.start_time).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Clock className="w-4 h-4 mr-3 text-gray-400" />
                                  <span className="text-sm">
                                    {new Date(event.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - 
                                    {new Date((event as any).end_time || event.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                                  <span className="text-sm">{event.location}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Users className="w-4 h-4 mr-3 text-gray-400" />
                                  <span className="text-sm">
                                    {(event as any).registrations?.length || 0} người đã tham gia
                                  </span>
                                </div>
                              </div>

                              {/* Action Button */}
                              <Button 
                                asChild
                                size="sm" 
                                className="bg-primary hover:bg-primary/90 text-white self-start group-hover:shadow-md transition-all"
                              >
                                <Link href={`/events/${event.event_id}`}>
                                  Xem chi tiết
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* View More Button */}
          <div className="text-center mt-12">
            <Button 
              asChild
              variant="outline" 
              size="lg" 
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Link href="/events">
                Xem tất cả hoạt động
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="relative py-16 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full" style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "20px 20px"
            }}></div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-8 left-8 w-16 h-16 bg-white/10 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-8 right-8 w-12 h-12 bg-white/10 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full animate-bounce"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            {/* Main CTA Content */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Sẵn sàng tham gia{" "}
              <span className="text-yellow-300">UniVibe</span>?
            </h2>
            
            <p className="text-lg sm:text-xl text-blue-50 mb-8 max-w-3xl mx-auto leading-relaxed">
              Hãy bắt đầu hành trình khám phá cộng đồng sinh viên tuyệt vời của chúng tôi. 
              Kết nối, học hỏi và tạo nên những kỷ niệm đáng nhớ!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
                className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg"
              >
                <Link href="/signup">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Tạo tài khoản
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                asChild
              variant="outline"
                size="lg" 
                className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold"
            >
                <Link href="/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Đăng nhập
                </Link>
            </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-blue-50">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">100% Miễn phí</div>
                <p className="text-sm">Tham gia hoàn toàn miễn phí</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">24/7 Hỗ trợ</div>
                <p className="text-sm">Đội ngũ hỗ trợ luôn sẵn sàng</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">An toàn</div>
                <p className="text-sm">Dữ liệu được bảo mật tuyệt đối</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
