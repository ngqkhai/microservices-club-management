"use client"

import { useState, useMemo } from "react"
import GuestLayout from "../layouts/GuestLayout"
import "../styles/ClubsPage.css"
import { Search, Filter, Calendar, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function ClubsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const clubsPerPage = 6

  const navigate = useNavigate()

  // Mock data for clubs
  const clubs = [
    {
      id: 1,
      name: "Photography Club",
      category: "Arts & Media",
      yearEstablished: 2018,
      members: 150,
      location: "Building A, Room 201",
      image: "/placeholder.svg?height=200&width=300",
      description: "Capturing moments, creating memories through the lens of creativity.",
    },
    {
      id: 2,
      name: "Music Harmony",
      category: "Arts & Media",
      yearEstablished: 2015,
      members: 200,
      location: "Music Hall, Floor 3",
      image: "/placeholder.svg?height=200&width=300",
      description: "Where melodies meet passion and rhythm creates unity.",
    },
    {
      id: 3,
      name: "Tech Innovation",
      category: "Technology",
      yearEstablished: 2020,
      members: 180,
      location: "Computer Lab, Building B",
      image: "/placeholder.svg?height=200&width=300",
      description: "Building the future through code, innovation, and collaboration.",
    },
    {
      id: 4,
      name: "Dance Fusion",
      category: "Sports & Recreation",
      yearEstablished: 2017,
      members: 120,
      location: "Dance Studio, Building C",
      image: "/placeholder.svg?height=200&width=300",
      description: "Express yourself through movement and rhythm.",
    },
    {
      id: 5,
      name: "Environmental Action",
      category: "Community Service",
      yearEstablished: 2019,
      members: 95,
      location: "Green Space, Campus Garden",
      image: "/placeholder.svg?height=200&width=300",
      description: "Protecting our planet, one action at a time.",
    },
    {
      id: 6,
      name: "Business Leaders",
      category: "Academic",
      yearEstablished: 2016,
      members: 160,
      location: "Conference Room, Building D",
      image: "/placeholder.svg?height=200&width=300",
      description: "Developing tomorrow's business leaders and entrepreneurs.",
    },
    {
      id: 7,
      name: "Literary Society",
      category: "Arts & Media",
      yearEstablished: 2014,
      members: 85,
      location: "Library, Reading Room",
      image: "/placeholder.svg?height=200&width=300",
      description: "Where words come alive and stories find their voice.",
    },
    {
      id: 8,
      name: "Sports United",
      category: "Sports & Recreation",
      yearEstablished: 2013,
      members: 220,
      location: "Sports Complex",
      image: "/placeholder.svg?height=200&width=300",
      description: "Unity through sports, strength through teamwork.",
    },
    {
      id: 9,
      name: "Science Explorers",
      category: "Academic",
      yearEstablished: 2021,
      members: 110,
      location: "Science Lab, Building E",
      image: "/placeholder.svg?height=200&width=300",
      description: "Discovering the wonders of science through experimentation.",
    },
    {
      id: 10,
      name: "Cultural Heritage",
      category: "Cultural",
      yearEstablished: 2012,
      members: 140,
      location: "Cultural Center",
      image: "/placeholder.svg?height=200&width=300",
      description: "Preserving traditions, celebrating diversity.",
    },
  ]

  // Mock data for recruitment posts
  const recruitmentPosts = [
    {
      id: 1,
      clubName: "Photography Club",
      title: "Tuyển thành viên mới - Nhiếp ảnh gia tương lai",
      description: "Bạn có đam mê với nhiếp ảnh? Hãy gia nhập Photography Club để khám phá thế giới qua ống kính!",
      requirements: ["Yêu thích nhiếp ảnh", "Có tinh thần học hỏi", "Sẵn sàng tham gia các hoạt động"],
      deadline: "2025-02-15",
      contact: "photo.club@univibe.edu.vn",
      image: "/placeholder.svg?height=150&width=200",
    },
    {
      id: 2,
      clubName: "Tech Innovation",
      title: "Tuyển Developer - Xây dựng tương lai công nghệ",
      description: "Tham gia cùng chúng tôi để phát triển các dự án công nghệ sáng tạo và ứng dụng thực tế.",
      requirements: ["Biết ít nhất 1 ngôn ngữ lập trình", "Có kinh nghiệm làm việc nhóm", "Đam mê công nghệ"],
      deadline: "2025-02-20",
      contact: "tech.innovation@univibe.edu.vn",
      image: "/placeholder.svg?height=150&width=200",
    },
    {
      id: 3,
      clubName: "Music Harmony",
      title: "Tuyển thành viên ban nhạc - Hòa âm đam mê",
      description: "Bạn có tài năng âm nhạc? Hãy cùng chúng tôi tạo nên những giai điệu tuyệt vời!",
      requirements: ["Biết chơi ít nhất 1 nhạc cụ", "Có khả năng hát hoặc sáng tác", "Tinh thần đồng đội"],
      deadline: "2025-02-10",
      contact: "music.harmony@univibe.edu.vn",
      image: "/placeholder.svg?height=150&width=200",
    },
    {
      id: 4,
      clubName: "Environmental Action",
      title: "Tuyển tình nguyện viên - Bảo vệ môi trường",
      description: "Cùng nhau hành động vì một môi trường xanh, sạch, đẹp cho thế hệ tương lai.",
      requirements: [
        "Quan tâm đến môi trường",
        "Có tinh thần tình nguyện",
        "Sẵn sàng tham gia các hoạt động ngoài trời",
      ],
      deadline: "2025-02-25",
      contact: "env.action@univibe.edu.vn",
      image: "/placeholder.svg?height=150&width=200",
    },
  ]

  const categories = [
    "all",
    "Arts & Media",
    "Technology",
    "Sports & Recreation",
    "Community Service",
    "Academic",
    "Cultural",
  ]
  const years = ["all", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021"]

  // Filter clubs based on search and filters
  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || club.category === selectedCategory
      const matchesYear = selectedYear === "all" || club.yearEstablished.toString() === selectedYear
      return matchesSearch && matchesCategory && matchesYear
    })
  }, [searchTerm, selectedCategory, selectedYear])

  // Pagination
  const totalPages = Math.ceil(filteredClubs.length / clubsPerPage)
  const startIndex = (currentPage - 1) * clubsPerPage
  const currentClubs = filteredClubs.slice(startIndex, startIndex + clubsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  return (
    <GuestLayout>
      <div className="clubs-page">
        {/* Background Effects */}
        <div className="bg-effects">
          <div className="hologram-1"></div>
          <div className="hologram-2"></div>
          <div className="gradient-orb-1"></div>
          <div className="gradient-orb-2"></div>
          <div className="gradient-orb-3"></div>
        </div>

        {/* Clubs Section */}
        <section className="clubs-section">
          <div className="section-header">
            <h1 className="page-title">Khám phá các Câu lạc bộ</h1>
            <p className="page-subtitle">Tìm kiếm và tham gia câu lạc bộ phù hợp với đam mê của bạn</p>
          </div>

          {/* Search and Filters */}
          <div className="search-filters">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm câu lạc bộ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filters">
              <div className="filter-group">
                <Filter size={16} />
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="all">Tất cả danh mục</option>
                  {categories.slice(1).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <Calendar size={16} />
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                  <option value="all">Tất cả năm</option>
                  {years.slice(1).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Clubs Grid */}
          <div className="clubs-grid">
            {currentClubs.map((club) => (
              <div key={club.id} className="club-card" onClick={() => navigate(`/clubs/${club.id}`)}>
                <div className="club-image-container">
                  <img src={club.image || "/placeholder.svg"} alt={club.name} className="club-image" />
                  <div className="club-overlay">
                    <button
                      className="view-details-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/clubs/${club.id}`)
                      }}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
                <div className="club-info">
                  <h3 className="club-name">{club.name}</h3>
                  <p className="club-category">{club.category}</p>
                  <p className="club-description">{club.description}</p>
                  <div className="club-stats">
                    <div className="stat">
                      <Calendar size={14} />
                      <span>{club.yearEstablished}</span>
                    </div>
                    <div className="stat">
                      <Users size={14} />
                      <span>{club.members}</span>
                    </div>
                    <div className="stat">
                      <MapPin size={14} />
                      <span>{club.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn prev-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? "active" : ""}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="page-btn next-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-text">Tuyển dụng</div>
          <div className="divider-line"></div>
        </div>

        {/* Recruitment Section */}
        <section className="recruitment-section">
          <div className="section-header">
            <h2 className="section-title">Bài đăng tuyển dụng</h2>
            <p className="section-subtitle">Cơ hội tham gia các câu lạc bộ đang tuyển thành viên mới</p>
          </div>

          <div className="recruitment-grid">
            {recruitmentPosts.map((post) => (
              <div key={post.id} className="recruitment-card">
                <div className="recruitment-header">
                  <img src={post.image || "/placeholder.svg"} alt={post.clubName} className="recruitment-image" />
                  <div className="recruitment-info">
                    <h3 className="recruitment-title">{post.title}</h3>
                    <p className="club-name-tag">{post.clubName}</p>
                  </div>
                </div>
                <div className="recruitment-content">
                  <p className="recruitment-description">{post.description}</p>
                  <div className="requirements">
                    <h4>Yêu cầu:</h4>
                    <ul>
                      {post.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="recruitment-footer">
                    <div className="deadline">
                      <Calendar size={14} />
                      <span>Hạn nộp: {new Date(post.deadline).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <button className="apply-btn">Ứng tuyển</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </GuestLayout>
  )
}
