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
import { Search, Calendar, SlidersHorizontal, ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react"
import { EventCard } from "@/components/event-card"
import { FilterSidebar } from "@/components/filter-sidebar"
import { eventService, type Event as ApiEvent } from "@/services/event.service"
import { clubService } from "@/services/club.service"

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
  }
  fee: number
  description: string
  category: string
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
    if (locationType === "online") {
      locationText = loc.platform ? `${loc.platform} (Online)` : "Online"
    } else {
      const parts = [loc.address, loc.room, anyEvent.detailed_location].filter(Boolean)
      if (parts.length > 0) {
        locationText = parts.join(" - ")
      }
    }
  } else if (anyEvent.detailed_location) {
    locationText = anyEvent.detailed_location
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
    fee: anyEvent.participation_fee ?? anyEvent.fee ?? 0,
    description: anyEvent.description || anyEvent.short_description || "",
    category: anyEvent.category || "General",
  }
}

const DEFAULT_CATEGORIES = ["All"]
const DEFAULT_LOCATIONS = ["All"]
const DEFAULT_CLUBS = ["All"]

export default function EventsPage() {
  const router = useRouter()
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
  const eventsPerPage = 3

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
          const mapped = data.map(transformEventForUI)
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
  }, [debouncedSearchTerm, selectedDate, selectedCategory, selectedLocation, selectedClub, eventsPerPage])

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Events</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover exciting events happening across all university clubs. Join activities that match your interests
            and connect with fellow students.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-80">
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
            <div className="lg:hidden mb-6">
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Mobile Filter Panel */}
              {showFilters && (
                <Card className="mb-6">
                  <CardContent className="p-4">
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-600">
                  {isLoading ? "Searching..." : `Showing ${startIndex + 1}-${endIndex} of ${totalEvents} events`}
                </p>
                {activeFiltersCount > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    <Badge variant="secondary">{activeFiltersCount}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Events Grid */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-32 h-24 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-8 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-4" data-testid="events-list">
                {events.map((event) => (
                  <Card key={event.event_id} className="hover:shadow-md transition-shadow" data-testid="event-card">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Event Image Placeholder */}
                        <div 
                          className="w-32 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => router.push(`/clubs/${event.club.id}`)}
                          title={`Xem thông tin ${event.club.name}`}
                        >
                          {event.club.logo ? (
                            <img 
                              src={event.club.logo} 
                              alt={event.club.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Calendar className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        
                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                                {event.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {event.description}
                              </p>
                            </div>
                          </div>
                          
                          {/* Event Info */}
                          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span className="truncate">{event.club.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                          
                          {/* Category and Fee */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {event.category}
                              </Badge>
                              {event.fee > 0 ? (
                                <Badge variant="outline" className="text-xs">
                                  ${event.fee}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  Free
                                </Badge>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => router.push(`/events/${event.event_id}`)}>
                                View Details
                              </Button>
                              <Button size="sm">
                                Interested
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search terms or filters to find more events.</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalEvents > 0 && !isLoading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
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
                            className="w-8 h-8 p-0"
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
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
