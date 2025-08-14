"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter } from "lucide-react"
import { ClubCard } from "@/components/club-card"
import { Pagination } from "@/components/pagination"
import { RecruitmentBanner } from "@/components/recruitment-banner"
import { useCallback } from "react"
import { useClubsStore } from "@/stores/clubs-store"
import { clubService } from "@/services/club.service"
import { useCampaigns } from "@/hooks/use-campaigns"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

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

  // Local state for form inputs and categories
  const [searchInput, setSearchInput] = useState("")
  const [categoryInput, setCategoryInput] = useState("All")
  const [categories, setCategories] = useState<string[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [recruitmentPage, setRecruitmentPage] = useState(1);
  
  // Ref to store scroll position during pagination
  const scrollPositionRef = useRef<number>(0)
  const isPaginationRef = useRef<boolean>(false)

  // Use campaigns hook for recruitment data
  const { campaigns: activeRecruitments, pagination: recruitmentPagination, loading: recruitmentsLoading, error: recruitmentsError, loadPublishedCampaigns } = useCampaigns();

  // Load campaigns on mount with pagination
  useEffect(() => {
    loadPublishedCampaigns({ 
      page: recruitmentPage, 
      limit: 3 
    });
  }, [loadPublishedCampaigns, recruitmentPage]);

  // Load clubs on component mount hoặc khi filter/page đổi
  useEffect(() => {
    loadAllClubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  // Prevent scroll to top during pagination using useLayoutEffect
  useLayoutEffect(() => {
    if (isPaginationRef.current) {
      // Immediately restore scroll position before browser can scroll to top
      window.scrollTo(0, scrollPositionRef.current)
      isPaginationRef.current = false
    }
  })

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true)
      try {
        const response = await clubService.getCategories()
        if (response.success && response.data) {
          setCategories(["All", ...response.data])
        }
      } catch (error) {
        console.error("Failed to load categories:", error)
        // Fallback to default categories
        setCategories(["All", "academic", "sports", "arts", "technology", "social", "volunteer", "cultural", "other"])
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])

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
    // Save current scroll position and mark as pagination
    scrollPositionRef.current = window.scrollY
    isPaginationRef.current = true
    
    setPage(page)
  }

  // Transform club data for ClubCard component
  const transformedClubs = displayedClubs.map((club, index) => ({
    club_id: club.id,
    name: club.name,
    description: club.description || '',
    category: club.category,
    members: club.member_count,
    logo_url: club.logo_url || "/placeholder.svg?height=100&width=100",
    cover_url: (club as any).cover_url, // Use cover image if available
    isPopular: club.member_count > 100 || index < 3 // Mark clubs with many members or first 3 as popular
  }))

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
        <RecruitmentBanner campaigns={activeRecruitments} />
        {recruitmentPagination && recruitmentPagination.total_pages > 1 && (
          <div className="flex justify-center mt-2 mb-6">
            <Pagination
              currentPage={recruitmentsLoading ? recruitmentPage : recruitmentPagination.current_page}
              totalPages={recruitmentPagination.total_pages}
              onPageChange={setRecruitmentPage}
            />
          </div>
        )}

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
              <Select value={categoryInput} onValueChange={handleCategoryChange} disabled={categoriesLoading}>
                <SelectTrigger className="w-[180px]" data-testid="category-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={categoriesLoading ? "Đang tải..." : "Danh mục"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "All" ? "Tất cả" : category}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <div className="aspect-video bg-gray-200"></div>
                <CardContent className="pt-8 pb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8" data-testid="clubs-grid">
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
