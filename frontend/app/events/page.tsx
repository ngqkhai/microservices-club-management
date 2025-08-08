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
import { Search, Calendar, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
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
  club: string
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
    club: anyEvent.club?.name || "",
    fee: anyEvent.participation_fee ?? anyEvent.fee ?? 0,
    description: anyEvent.description,
    category: anyEvent.category || "General",
  }
}

const DEFAULT_CATEGORIES = ["All"]
const DEFAULT_LOCATIONS = ["All"]
const DEFAULT_CLUBS = ["All"]

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<UiEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<UiEvent[]>([])
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
  const eventsPerPage = 6

  const loadEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const requestId = ++latestRequestIdRef.current
      const effectiveSearch = debouncedSearchTerm && debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined
      const response = await eventService.getEvents({
        // Fetch a reasonable batch; local filters and pagination will apply
        page: 1,
        limit: 100,
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
        } else {
          setEvents([])
        }
      }
    } catch (e) {
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearchTerm, selectedDate, selectedCategory, selectedLocation, selectedClub])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Load filter facets (categories, locations, clubs)
  useEffect(() => {
    (async () => {
      try {
        const [catRes, locRes, clubRes] = await Promise.all([
          eventService.getEventCategories(),
          eventService.getEventLocations(),
          clubService.getClubs({ page: 1, limit: 100 })
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

  useEffect(() => {
    filterEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, selectedCategory, selectedLocation, selectedClub])

  const filterEvents = () => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      // Server already applied category, location, club and date filters via loadEvents()
      // Keep only client-side text search here to refine results locally.
      let filtered = events
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        filtered = filtered.filter(
          (event) =>
            event.title.toLowerCase().includes(q) ||
            event.description.toLowerCase().includes(q) ||
            event.club.toLowerCase().includes(q),
        )
      }

      setFilteredEvents(filtered)
      setCurrentPage(1) // Reset to first page when filters change
      setIsLoading(false)
    }, 300)
  }

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)
  const startIndex = (currentPage - 1) * eventsPerPage
  const endIndex = startIndex + eventsPerPage
  const currentEvents = filteredEvents.slice(startIndex, endIndex)

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
                  {isLoading ? "Searching..." : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredEvents.length)} of ${filteredEvents.length} events`}
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
            ) : currentEvents.length > 0 ? (
              <div className="space-y-4">
                {currentEvents.map((event) => (
                  <Card key={event.event_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Event Image Placeholder */}
                        <div className="w-32 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-gray-400" />
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
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <span className="font-medium">{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <span className="truncate">{event.location}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <span className="truncate">{event.club}</span>
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
            {filteredEvents.length > 0 && !isLoading && totalPages > 1 && (
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
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
