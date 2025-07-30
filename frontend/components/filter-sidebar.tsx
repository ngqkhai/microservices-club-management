"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, MapPin, Users, Tag, X } from "lucide-react"

interface FilterSidebarProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  selectedCategory: string
  setSelectedCategory: (value: string) => void
  selectedLocation: string
  setSelectedLocation: (value: string) => void
  selectedClub: string
  setSelectedClub: (value: string) => void
  selectedDate: string
  setSelectedDate: (value: string) => void
  categories: string[]
  locations: string[]
  clubs: string[]
  onClearFilters: () => void
  activeFiltersCount: number
  isMobile?: boolean
}

export function FilterSidebar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  selectedClub,
  setSelectedClub,
  selectedDate,
  setSelectedDate,
  categories,
  locations,
  clubs,
  onClearFilters,
  activeFiltersCount,
  isMobile = false,
}: FilterSidebarProps) {
  return (
    <div className={`space-y-6 ${isMobile ? "" : "sticky top-8"}`}>
      {!isMobile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Search & Filter
              </span>
              {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Events</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by title, description, or club..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Club Filter */}
          <div className="space-y-2">
            <Label>Club</Label>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger>
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select club" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="date">From Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="w-full flex items-center justify-center gap-2 bg-transparent"
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </Button>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
