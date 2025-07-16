"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter } from "lucide-react"
import { ClubCard } from "@/components/club-card"
import { Pagination } from "@/components/pagination"
import { RecruitmentBanner } from "@/components/recruitment-banner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Mock clubs data with logos
const mockClubs = [
  {
    club_id: "music-club",
    name: "CLB Âm nhạc",
    description: "Khám phá tài năng âm nhạc và kết nối với những người yêu nhạc cùng chí hướng",
    category: "Arts",
    members: 45,
    logo_url: "/placeholder.svg?height=100&width=100",
  },
  {
    club_id: "tech-club",
    name: "CLB Công nghệ thông tin",
    description: "Học lập trình, AI và các công nghệ tiên tiến cùng nhau",
    category: "Technology",
    members: 78,
    logo_url: "/placeholder.svg?height=100&width=100",
  },
  {
    club_id: "sports-club",
    name: "CLB Thể thao",
    description: "Duy trì sức khỏe và tinh thần thể thao qua các hoạt động đa dạng",
    category: "Sports",
    members: 92,
    logo_url: "/placeholder.svg?height=100&width=100",
  },
  {
    club_id: "debate-club",
    name: "CLB Tranh luận",
    description: "Phát triển tư duy phản biện và kỹ năng diễn đạt",
    category: "Academic",
    members: 34,
    logo_url: "/placeholder.svg?height=100&width=100",
  },
  {
    club_id: "art-club",
    name: "CLB Nghệ thuật",
    description: "Thể hiện sự sáng tạo qua hội họa và nghệ thuật thị giác",
    category: "Arts",
    members: 56,
    logo_url: "/placeholder.svg?height=100&width=100",
  },
  {
    club_id: "volunteer-club",
    name: "CLB Tình nguyện",
    description: "Góp phần xây dựng cộng đồng qua các hoạt động ý nghĩa",
    category: "Service",
    members: 67,
    logo_url: "/placeholder.svg?height=100&width=100",
  },
  {
    club_id: "photography-club",
    name: "CLB Nhiếp ảnh",
    description: "Ghi lại những khoảnh khắc đẹp và kể chuyện qua ảnh",
    category: "Arts",
    members: 38,
    logo_url: "/placeholder.svg?height=100&width=100",
  },
  {
    club_id: "business-club",
    name: "CLB Kinh doanh",
    description: "Học về kinh doanh, khởi nghiệp và kết nối với các nhà lãnh đạo tương lai",
    category: "Business",
    members: 52,
    logo_url: "/placeholder.svg?height=100&width=100",
  },
]

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

const categories = ["All", "Arts", "Technology", "Sports", "Academic", "Service", "Business"]
const CLUBS_PER_PAGE = 6

export default function ClubsPage() {
  const [allClubs] = useState(mockClubs)
  const [filteredClubs, setFilteredClubs] = useState(mockClubs)
  const [displayedClubs, setDisplayedClubs] = useState<typeof mockClubs>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    filterClubs()
  }, [searchTerm, selectedCategory])

  useEffect(() => {
    paginateClubs()
  }, [filteredClubs, currentPage])

  const filterClubs = () => {
    setIsLoading(true)

    setTimeout(() => {
      let filtered = allClubs

      if (searchTerm) {
        filtered = filtered.filter(
          (club) =>
            club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            club.description.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      if (selectedCategory !== "All") {
        filtered = filtered.filter((club) => club.category === selectedCategory)
      }

      setFilteredClubs(filtered)
      setCurrentPage(1)
      setIsLoading(false)
    }, 300)
  }

  const paginateClubs = () => {
    const startIndex = (currentPage - 1) * CLUBS_PER_PAGE
    const endIndex = startIndex + CLUBS_PER_PAGE
    const paginatedClubs = filteredClubs.slice(startIndex, endIndex)

    setDisplayedClubs(paginatedClubs)
    setTotalPages(Math.ceil(filteredClubs.length / CLUBS_PER_PAGE))
  }

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Danh mục" />
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

        {/* Results */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {isLoading ? "Đang tìm kiếm..." : `Tìm thấy ${filteredClubs.length} câu lạc bộ`}
          </p>
          <p className="text-sm text-gray-500">
            Trang {currentPage} / {totalPages}
          </p>
        </div>

        {/* Clubs Grid */}
        {isLoading ? (
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
        ) : displayedClubs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedClubs.map((club) => (
                <ClubCard key={club.club_id} club={club} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy câu lạc bộ</h3>
            <p className="text-gray-600">Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc để tìm thêm câu lạc bộ.</p>
          </div>
        )}
      </div>
    </div>
  )
}
