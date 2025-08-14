"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Search, Calendar, SlidersHorizontal, ChevronLeft, ChevronRight, Clock, MapPin, Users, Banknote, Heart, Grid3X3, List } from "lucide-react"
import { EventCard } from "@/components/event-card"
import { FilterSidebar } from "@/components/filter-sidebar"
import { eventService, type Event as ApiEvent } from "@/services/event.service"
import { clubService } from "@/services/club.service"
import { useAuthStore } from "@/stores/auth-store"

type UiEvent = {
  event_id: string
  title: string
  date: string
  time: string
  location: string
  club: {
    id: string
    name: string
    logo?: string
  },
  event_image_url?: string,
  event_logo_url?: string,
  fee: number
  fee_display?: string
  currency?: string
  description: string
  category: string
  tags: string[]
  max_participants?: number
  is_favorited?: boolean
}

function transformEventForUI(event: ApiEvent): UiEvent {
  const anyEvent: any = event as any
  const startRaw = anyEvent.start_date || anyEvent.startDate
  const start = startRaw ? new Date(startRaw) : undefined
  const dateStr = start ? start.toISOString().slice(0, 10) : ""
  const timeStr = start ? start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""

  // Normalize location to a human-readable string
  const loc = anyEvent.location
  let locationText = "TBA"
  if (typeof loc === "string" && loc.trim().length > 0) {
    locationText = loc
  } else if (loc && typeof loc === "object") {
    const locationType = loc.location_type || loc.type
    if (locationType === "virtual" || locationType === "online") {
      // Online event - chỉ hiển thị platform
      locationText = loc.platform || "Online"
    } else if (locationType === "physical" || locationType === "offline") {
      // Offline event - chỉ hiển thị address
      locationText = loc.address || "TBA"
    } else {
      // Fallback cho các loại location khác
      const parts = [loc.address, loc.room, anyEvent.detailed_location].filter(Boolean)
      if (parts.length > 0) {
        locationText = parts.join(" - ")
      }
    }
  } else if (anyEvent.detailed_location) {
    locationText = anyEvent.detailed_location
  }

  // Normalize fee and currency
  const fee = anyEvent.participation_fee ?? anyEvent.fee ?? 0;
  const currency = anyEvent.currency || "VND";
  
  // Format fee display
  let feeDisplay = "";
  if (fee === 0) {
    feeDisplay = "Miễn phí";
  } else {
    switch (currency.toUpperCase()) {
      case "USD":
        feeDisplay = `$${fee.toLocaleString()}`;
        break;
      case "EUR":
        feeDisplay = `€${fee.toLocaleString()}`;
        break;
      case "JPY":
        feeDisplay = `¥${fee.toLocaleString()}`;
        break;
      case "KRW":
        feeDisplay = `₩${fee.toLocaleString()}`;
        break;
      case "CNY":
        feeDisplay = `¥${fee.toLocaleString()}`;
        break;
      case "VND":
      default:
        feeDisplay = `${fee.toLocaleString("vi-VN")} VNĐ`;
        break;
    }
  }

  return {
    event_id: anyEvent.id || anyEvent._id,
    title: anyEvent.title,
    date: dateStr,
    time: timeStr,
    location: locationText,
    club: {
      id: anyEvent.club?.id || "",
      name: anyEvent.club?.name || "Câu lạc bộ",
      logo: anyEvent.club?.logo || anyEvent.club?.logo_url || "",
    },
    event_image_url: anyEvent.event_image_url,
    event_logo_url: anyEvent.event_logo_url,
    fee: fee,
    fee_display: feeDisplay,
    currency: currency,
    description: anyEvent.description || anyEvent.short_description || "",
    category: anyEvent.category || "General",
    tags: anyEvent.tags || [],
    max_participants: anyEvent.max_participants,
  }
}

const DEFAULT_CATEGORIES = ["All"]
const DEFAULT_LOCATIONS = ["All"]
const DEFAULT_CLUBS = ["All"]

export default function EventsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [events, setEvents] = useState<UiEvent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [selectedClub, setSelectedClub] = useState("All")
  const [selectedDate, setSelectedDate] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [locations, setLocations] = useState<string[]>(DEFAULT_LOCATIONS)
  const [clubs, setClubs] = useState<{ label: string; value: string }[]>([{ label: 'All', value: 'All' }])
  const [favoriteEventIds, setFavoriteEventIds] = useState<Set<string>>(new Set())
  
  // Debounced search state to avoid firing requests on every keystroke
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 400)
    return () => clearTimeout(timerId)
  }, [searchTerm])
  
  // Guard against race conditions from slow responses
  const latestRequestIdRef = useRef(0)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const eventsPerPage = 6

  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Function to get appropriate currency icon
  const getCurrencyIcon = (currency?: string) => {
    return <Banknote className="h-4 w-4 text-green-600" />
  }

  // Load user's favorite events
  const loadUserFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteEventIds(new Set())
      return
    }

    try {
      const response = await eventService.getUserFavoriteEvents({ limit: 100 })
      if (response.success && response.data?.events) {
        const favoriteIds = new Set(response.data.events.map((event: any) => event.id || event._id))
        setFavoriteEventIds(favoriteIds)
      }
    } catch (error) {
      console.error('Failed to load user favorites:', error)
      setFavoriteEventIds(new Set())
    }
  }, [user])

  // Load favorites when user changes
  useEffect(() => {
    loadUserFavorites()
  }, [loadUserFavorites])

  const loadEvents = useCallback(async (page: number = 1) => {
    setIsLoading(true)
    try {
      const requestId = ++latestRequestIdRef.current
      const effectiveSearch = debouncedSearchTerm && debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined
      const response = await eventService.getEvents({
        page: page,
        limit: eventsPerPage,
        search: effectiveSearch,
        start_from: selectedDate || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        location: selectedLocation !== 'All' ? selectedLocation : undefined,
        club_id: selectedClub !== 'All' ? selectedClub : undefined,
        filter: 'all',
      })

      // Ignore stale responses
      if (requestId === latestRequestIdRef.current) {
        if (response.success && response.data) {
          const data = response.data.events || []
          const mapped = data.map((event: any) => {
            const uiEvent = transformEventForUI(event)
            // Apply favorite status from user's favorites
            uiEvent.is_favorited = favoriteEventIds.has(uiEvent.event_id)
            return uiEvent
          })
          setEvents(mapped)
          
          // Extract pagination info from meta or pagination object
          const meta = response.data.meta
          const pagination = response.data.pagination
          
          if (meta) {
            setTotalEvents(meta.total || 0)
            setTotalPages(meta.total_pages || Math.ceil((meta.total || 0) / eventsPerPage))
          } else if (pagination) {
            setTotalEvents(pagination.total_items || 0)
            setTotalPages(pagination.total_pages || Math.ceil((pagination.total_items || 0) / eventsPerPage))
          } else {
            setTotalEvents(0)
            setTotalPages(0)
          }
        } else {
          setEvents([])
          setTotalEvents(0)
          setTotalPages(0)
        }
      }
    } catch (e) {
      setEvents([])
      setTotalEvents(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearchTerm, selectedDate, selectedCategory, selectedLocation, selectedClub, eventsPerPage, favoriteEventIds])

  useEffect(() => {
    loadEvents(currentPage)
  }, [loadEvents, currentPage])

  // Load filter facets (categories, locations, clubs)
  useEffect(() => {
    (async () => {
      try {
        const [catRes, locRes, clubRes] = await Promise.all([
          eventService.getEventCategories(),
          eventService.getEventLocations(),
          clubService.getClubs({ page: 1, limit: 3 })
        ])
        if (catRes.success && Array.isArray(catRes.data)) {
          setCategories(["All", ...catRes.data])
        }
        if (locRes.success && Array.isArray(locRes.data)) {
          setLocations(["All", ...locRes.data])
        }
        if (clubRes.success && clubRes.data?.results) {
          setClubs([
            { label: 'All', value: 'All' },
            ...clubRes.data.results.map((c: any) => ({ label: c.name, value: c.id }))
          ])
        }
      } catch (_) {
        // keep defaults on failure
      }
    })()
  }, [])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("All")
    setSelectedLocation("All")
    setSelectedClub("All")
    setSelectedDate("")
  }

  const activeFiltersCount = [
    selectedCategory !== "All",
    selectedLocation !== "All",
    selectedClub !== "All",
    selectedDate !== "",
    searchTerm !== "",
  ].filter(Boolean).length

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Calculate display info
  const startIndex = (currentPage - 1) * eventsPerPage
  const endIndex = startIndex + events.length

  const handleFavoriteChange = (eventId: string, isFavorited: boolean) => {
    setFavoriteEventIds(prev => {
      const newSet = new Set(prev)
      if (isFavorited) {
        newSet.add(eventId)
      } else {
        newSet.delete(eventId)
      }
      return newSet
    })

    // Update the events array to reflect the change immediately
    setEvents(prev => prev.map(event => 
      event.event_id === eventId 
        ? { ...event, is_favorited: isFavorited }
        : event
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Sự kiện</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Danh sách Sự kiện</h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Khám phá và tham gia các sự kiện thú vị tại UniVibe
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-64">
            <FilterSidebar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              selectedClub={selectedClub}
              setSelectedClub={setSelectedClub}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              categories={categories}
              locations={locations}
              clubs={clubs}
              onClearFilters={clearFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full">
            {/* Mobile Search and Filter Toggle */}
            <div className="lg:hidden mb-4">
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                  <Input
                    placeholder="Tìm kiếm sự kiện..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1.5 h-9"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span className="text-sm">Lọc</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0.5">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Mobile Filter Panel */}
              {showFilters && (
                <Card className="mb-4">
                  <CardContent className="p-3">
                    <FilterSidebar
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      selectedLocation={selectedLocation}
                      setSelectedLocation={setSelectedLocation}
                      selectedClub={selectedClub}
                      setSelectedClub={setSelectedClub}
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      categories={categories}
                      locations={locations}
                      clubs={clubs}
                      onClearFilters={clearFilters}
                      activeFiltersCount={activeFiltersCount}
                      isMobile={true}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  {isLoading ? "Đang tìm kiếm..." : `Hiển thị ${startIndex + 1}-${endIndex} trong tổng số ${totalEvents} sự kiện`}
                </p>
                {activeFiltersCount > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Bộ lọc:</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{activeFiltersCount}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-blue-600 hover:text-blue-700 text-xs h-6 px-2"
                    >
                      Xóa tất cả
                    </Button>
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Kiểu hiển thị:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`h-7 px-2 text-xs ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' : 'hover:bg-gray-200'}`}
                  >
                    <Grid3X3 className="h-3 w-3 mr-1" />
                    Lưới
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-7 px-2 text-xs ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' : 'hover:bg-gray-200'}`}
                  >
                    <List className="h-3 w-3 mr-1" />
                    Danh sách
                  </Button>
                </div>
              </div>
            </div>

            {/* Events Grid/List */}
            {isLoading ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" 
                : "space-y-3"
              }>
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gray-200"></div>
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                          <div className="h-8 bg-gray-200 rounded w-8"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" 
                : "space-y-3"
              } data-testid="events-list">
                {events.map((event) => (
                  <Card 
                    key={event.event_id} 
                    className={`group overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer ${
                      viewMode === 'grid' ? 'hover:-translate-y-2' : 'flex'
                    }`}
                    data-testid="event-card"
                    onClick={() => router.push(`/events/${event.event_id}`)}
                  >
                    {/* Event Image */}
                    <CardHeader className="p-0 relative">
                      <div className={viewMode === 'grid' ? "aspect-video overflow-hidden" : "h-48 overflow-hidden"}>
                        {event.event_image_url ? (
                          <img 
                            src={event.event_image_url} 
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <Calendar className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Overlay content - Swapped positions */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        {/* Fee/Price badge is now on the left */}
                        {event.fee > 0 ? (
                          <Badge variant="destructive" className="bg-green-500">
                            <Banknote className="w-3 h-3 mr-1" />
                            {event.fee_display || `${event.fee.toLocaleString("vi-VN")} VNĐ`}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-green-500">
                            <Banknote className="w-3 h-3 mr-1" />
                            Miễn phí
                          </Badge>
                        )}

                        {/* Favorite Button */}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={async (e) => {
                            e.stopPropagation() // Prevent card click
                            if (!user) {
                              router.push('/login')
                              return
                            }
                            try {
                              const res = await eventService.toggleFavorite(event.event_id)
                              if (res.success) {
                                const newFavoriteState = res.data?.is_favorited ?? !event.is_favorited
                                handleFavoriteChange(event.event_id, newFavoriteState)
                              }
                            } catch (error) {
                              console.error('Error toggling favorite:', error)
                            }
                          }}
                          disabled={!user}
                          className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white"
                          title={event.is_favorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                        >
                          <Heart className={`h-4 w-4 ${event.is_favorited ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                        </Button>
                      </div>
                    </CardHeader>

                    {/* Event Content */}
                    <CardContent className={viewMode === 'grid' ? "p-4" : "p-4 flex-1"}>
                      {/* Category above title */}
                      <div className="mb-2">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                          {event.category}
                        </Badge>
                      </div>

                      <div className="mb-3">
                        {/* Title with reduced font-weight */}
                        <h3 className={`font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors line-clamp-2 ${
                          viewMode === 'grid' ? 'text-lg' : 'text-xl'
                        }`}>
                          {event.title}
                        </h3>
                        <p className={`text-gray-600 leading-relaxed line-clamp-2 mb-2 ${
                          viewMode === 'grid' ? 'text-xs' : 'text-sm'
                        }`}>
                          {event.description}
                        </p>
                      </div>

                      {/* Event Meta Info */}
                      <div className={`space-y-1 mb-3 ${
                        viewMode === 'list' ? 'grid grid-cols-2 gap-2' : ''
                      }`}>
                        <div className="flex items-center text-gray-500">
                          <Users className="h-3 w-3 mr-1.5" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/clubs/${event.club.id}`)
                            }}
                            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                          >
                            {event.club.name}
                          </button>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-3 w-3 mr-1.5" />
                          <span className="text-xs">{event.date}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-3 w-3 mr-1.5" />
                          <span className="text-xs">{event.time}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-3 w-3 mr-1.5" />
                          <span className="text-xs line-clamp-1">{event.location}</span>
                        </div>
                        {viewMode === 'list' && (
                          <div className="flex items-center text-gray-500 col-span-2">
                            <Users className="h-3 w-3 mr-1.5" />
                            <span className="text-xs">0/{event.max_participants || 100} người tham gia</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {event.tags.slice(0, viewMode === 'grid' ? 3 : event.tags.length).map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="text-xs px-1.5 py-0.5 text-blue-600 border-blue-200 bg-blue-50"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {viewMode === 'grid' && event.tags.length > 3 && (
                              <Badge 
                                variant="outline" 
                                className="text-xs px-1.5 py-0.5 text-gray-500 border-gray-200"
                              >
                                +{event.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sự kiện</h3>
                <p className="text-gray-600 mb-4">Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc để tìm thêm sự kiện.</p>
                <Button onClick={clearFilters} variant="outline">
                  Xóa bộ lọc
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalEvents > 0 && !isLoading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 text-xs h-8"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Trước
                </Button>
                
                <div className="flex items-center gap-1">
                  {(() => {
                    const maxVisible = 5;
                    const pages = [];
                    
                    if (totalPages <= maxVisible) {
                      // Hiển thị tất cả trang nếu tổng số trang <= maxVisible
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Logic hiển thị 5 trang với ellipsis
                      if (currentPage <= 3) {
                        // Trang đầu: 1, 2, 3, 4, 5, ..., totalPages
                        for (let i = 1; i <= 5; i++) {
                          pages.push(i);
                        }
                        if (totalPages > 5) {
                          pages.push('...');
                          pages.push(totalPages);
                        }
                      } else if (currentPage >= totalPages - 2) {
                        // Trang cuối: 1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
                        pages.push(1);
                        pages.push('...');
                        for (let i = totalPages - 4; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Trang giữa: 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
                        pages.push(1);
                        pages.push('...');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          pages.push(i);
                        }
                        pages.push('...');
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((page, index) => (
                      <div key={index}>
                        {page === '...' ? (
                          <span className="px-2 text-gray-500">...</span>
                        ) : (
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page as number)}
                            className="w-7 h-7 p-0 text-xs"
                          >
                            {page}
                          </Button>
                        )}
                      </div>
                    ));
                  })()}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 text-xs h-8"
                >
                  Sau
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
