"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter } from "lucide-react"
import { ClubCard } from "@/components/club-card"
import { Pagination } from "@/components/pagination"
import { RecruitmentBanner } from "@/components/recruitment-banner"
import { useClubsStore } from "@/stores/clubs-store"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Mock active recruitment campaigns
const mockActiveRecruitments = [
  {
    campaign_id: "music-spring-2024",
    club_id: "music-club",
    club_name: "CLB Âm nhạc",
    title: "Tuyển thành viên mùa xuân 2024",
    deadline: "2024-03-30T23:59:59",
    logo_url: "/placeholder.svg?height=60&width=60",
  },
  {
    campaign_id: "tech-leadership-2024",
    club_id: "tech-club",
    club_name: "CLB Công nghệ thông tin",
    title: "Tuyển ban lãnh đạo 2024",
    deadline: "2024-03-25T18:00:00",
    logo_url: "/placeholder.svg?height=60&width=60",
  },
  {
    campaign_id: "volunteer-coordinator",
    club_id: "volunteer-club",
    club_name: "CLB Tình nguyện",
    title: "Tuyển điều phối viên hoạt động",
    deadline: "2024-04-01T12:00:00",
    logo_url: "/placeholder.svg?height=60&width=60",
  },
]

const categories = ["All", "academic", "sports", "arts", "technology", "social", "volunteer", "cultural", "other"]

export default function ClubsPage() {
  // Use the clubs store
  const {
    cache,
    filters,
    pagination,
    displayedClubs,
    loadAllClubs,
    resetRetry,
    setFilters,
    setPage
  } = useClubsStore()

  // Local state for form inputs
  const [searchInput, setSearchInput] = useState("")
  const [categoryInput, setCategoryInput] = useState("All")

  // Load clubs on component mount
  useEffect(() => {
    if (!cache.isLoaded && !cache.isLoading) {
      loadAllClubs()
    }
  }, [cache.isLoaded, cache.isLoading, loadAllClubs])

  // Update filters when inputs change (with debouncing for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({
        search: searchInput,
        category: categoryInput === "All" ? "" : categoryInput
      })
    }, 300) // 300ms debounce for search

    return () => clearTimeout(timeoutId)
  }, [searchInput, categoryInput, setFilters])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handleCategoryChange = (value: string) => {
    setCategoryInput(value)
  }

  const handlePageChange = (page: number) => {
    setPage(page)
  }

  // Transform club data for ClubCard component
  const transformedClubs = displayedClubs.map(club => ({
    club_id: club.id,
    name: club.name,
    description: club.description || '',
    category: club.category,
    members: club.member_count,
    logo_url: club.logo_url || "/placeholder.svg?height=100&width=100"
  }))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Câu lạc bộ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Khám phá câu lạc bộ</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tìm hiểu các câu lạc bộ phù hợp với sở thích và kết nối với những sinh viên cùng đam mê.
          </p>
        </div>

        {/* Active Recruitment Banner */}
        <RecruitmentBanner campaigns={mockActiveRecruitments} />

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm câu lạc bộ theo tên hoặc mô tả..."
                value={searchInput}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryInput} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "All" ? "Tất cả" : 
                       category === "academic" ? "Học thuật" :
                       category === "sports" ? "Thể thao" :
                       category === "arts" ? "Nghệ thuật" :
                       category === "technology" ? "Công nghệ" :
                       category === "social" ? "Xã hội" :
                       category === "volunteer" ? "Tình nguyện" :
                       category === "cultural" ? "Văn hóa" :
                       category === "other" ? "Khác" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {cache.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="text-red-800">
              <h3 className="font-medium">Có lỗi xảy ra</h3>
              <p className="mt-2">{cache.error}</p>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => {
                    resetRetry();
                    loadAllClubs();
                  }}
                  disabled={cache.isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cache.isLoading ? "Đang tải..." : "Thử lại"}
                </button>
                {cache.retryCount > 0 && (
                  <span className="px-3 py-2 text-sm text-red-600">
                    Lần thử: {cache.retryCount}/3
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {cache.isLoading ? "Đang tải..." : 
             !cache.isLoaded ? "Chưa tải dữ liệu" :
             `Tìm thấy ${pagination.total} câu lạc bộ`}
          </p>
          {pagination.totalPages > 0 && (
            <p className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.totalPages}
            </p>
          )}
        </div>

        {/* Clubs Grid */}
        {cache.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : transformedClubs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {transformedClubs.map((club) => (
                <ClubCard key={club.club_id} club={club} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination 
                currentPage={pagination.page} 
                totalPages={pagination.totalPages} 
                onPageChange={handlePageChange} 
              />
            )}
          </>
        ) : cache.isLoaded ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy câu lạc bộ</h3>
            <p className="text-gray-600">Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc để tìm thêm câu lạc bộ.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
