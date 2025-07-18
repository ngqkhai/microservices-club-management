"use client"

import { useState, useEffect } from "react"
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
import { Search, Calendar, SlidersHorizontal } from "lucide-react"
import { EventCard } from "@/components/event-card"
import { FilterSidebar } from "@/components/filter-sidebar"

// Mock events data
const mockEvents = [
  {
    event_id: "spring-concert-2024",
    title: "Spring Concert 2024",
    date: "2024-04-15",
    time: "19:00",
    location: "University Auditorium",
    club: "CLB Âm nhạc",
    fee: 0,
    description:
      "Annual spring concert featuring performances by music club members across various genres including classical, jazz, and contemporary music.",
    category: "Arts",
  },
  {
    event_id: "hackathon-2024",
    title: "Innovation Hackathon 2024",
    date: "2024-04-01",
    time: "09:00",
    location: "Tech Hub",
    club: "Tech Innovation Club",
    fee: 0,
    description:
      "48-hour hackathon where teams compete to build innovative solutions to real-world problems. Prizes and networking opportunities available.",
    category: "Technology",
  },
  {
    event_id: "jazz-workshop",
    title: "Jazz Improvisation Workshop",
    date: "2024-03-20",
    time: "18:00",
    location: "Music Room",
    club: "CLB Âm nhạc",
    fee: 15,
    description:
      "Learn jazz improvisation techniques from professional musicians. Suitable for intermediate to advanced players.",
    category: "Arts",
  },
  {
    event_id: "ai-workshop",
    title: "Introduction to Machine Learning",
    date: "2024-03-25",
    time: "14:00",
    location: "Computer Lab 201",
    club: "Tech Innovation Club",
    fee: 20,
    description:
      "Hands-on workshop covering machine learning fundamentals and practical applications using Python and popular ML libraries.",
    category: "Technology",
  },
  {
    event_id: "basketball-tournament",
    title: "Inter-Club Basketball Tournament",
    date: "2024-04-10",
    time: "16:00",
    location: "Sports Complex",
    club: "Sports & Fitness Club",
    fee: 5,
    description: "Annual basketball tournament featuring teams from different clubs. Come support your favorite club!",
    category: "Sports",
  },
  {
    event_id: "debate-championship",
    title: "University Debate Championship",
    date: "2024-04-05",
    time: "13:00",
    location: "Main Auditorium",
    club: "Debate Society",
    fee: 0,
    description:
      "Final round of the university debate championship. Watch the best debaters compete on current social issues.",
    category: "Academic",
  },
  {
    event_id: "art-exhibition",
    title: "Student Art Exhibition",
    date: "2024-03-30",
    time: "17:00",
    location: "Art Gallery",
    club: "Creative Arts Club",
    fee: 0,
    description:
      "Showcase of student artwork including paintings, sculptures, and digital art. Meet the artists and enjoy refreshments.",
    category: "Arts",
  },
  {
    event_id: "volunteer-cleanup",
    title: "Community Beach Cleanup",
    date: "2024-03-28",
    time: "08:00",
    location: "Sunset Beach",
    club: "Community Service Club",
    fee: 0,
    description:
      "Join us for a morning of environmental service. Help clean up the beach and protect marine life. Transportation provided.",
    category: "Service",
  },
]

const categories = ["All", "Arts", "Technology", "Sports", "Academic", "Service"]
const locations = [
  "All",
  "University Auditorium",
  "Tech Hub",
  "Music Room",
  "Computer Lab 201",
  "Sports Complex",
  "Main Auditorium",
  "Art Gallery",
  "Sunset Beach",
]
const clubs = [
  "All",
  "CLB Âm nhạc",
  "Tech Innovation Club",
  "Sports & Fitness Club",
  "Debate Society",
  "Creative Arts Club",
  "Community Service Club",
]

export default function EventsPage() {
  const [events, setEvents] = useState(mockEvents)
  const [filteredEvents, setFilteredEvents] = useState(mockEvents)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [selectedClub, setSelectedClub] = useState("All")
  const [selectedDate, setSelectedDate] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    filterEvents()
  }, [searchTerm, selectedCategory, selectedLocation, selectedClub, selectedDate])

  const filterEvents = () => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      let filtered = mockEvents

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (event) =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.club.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      // Category filter
      if (selectedCategory !== "All") {
        filtered = filtered.filter((event) => event.category === selectedCategory)
      }

      // Location filter
      if (selectedLocation !== "All") {
        filtered = filtered.filter((event) => event.location === selectedLocation)
      }

      // Club filter
      if (selectedClub !== "All") {
        filtered = filtered.filter((event) => event.club === selectedClub)
      }

      // Date filter
      if (selectedDate) {
        filtered = filtered.filter((event) => event.date >= selectedDate)
      }

      setFilteredEvents(filtered)
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
          <div className="flex-1">
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
                <p className="text-gray-600">{isLoading ? "Searching..." : `Found ${filteredEvents.length} events`}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.event_id} event={event} showClub={true} />
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

            {/* Load More Button (for pagination) */}
            {filteredEvents.length > 0 && !isLoading && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Load More Events
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
