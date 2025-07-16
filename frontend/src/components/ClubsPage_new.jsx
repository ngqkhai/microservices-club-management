import React, { useState, useMemo } from "react"
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
      location: "Dance Studio, Ground Floor",
      image: "/placeholder.svg?height=200&width=300",
      description: "Express yourself through movement and rhythm.",
    }
  ]

  // Mock data for recruitment posts
  const recruitmentPosts = [
    {
      id: 1,
      clubName: "Photography Club",
      title: "Tuyển thành viên mới - Nhiếp ảnh sáng tạo",
      description: "Chúng tôi đang tìm kiếm những bạn trẻ có đam mê với nhiếp ảnh và sáng tạo.",
      requirements: [
        "Yêu thích nhiếp ảnh",
        "Có khả năng sáng tạo",
        "Sẵn sàng học hỏi và chia sẻ",
      ],
      deadline: "2025-02-15",
      contact: "photo.club@univibe.edu.vn",
      image: "/placeholder.svg?height=150&width=200",
    },
    {
      id: 2,
      clubName: "Tech Innovation",
      title: "Tuyển Developer & Designer",
      description: "Tham gia đội ngũ phát triển các dự án công nghệ đầy thú vị.",
      requirements: [
        "Biết lập trình (Python, JavaScript, React)",
        "Có kinh nghiệm với Git/GitHub",
        "Tinh thần làm việc nhóm",
      ],
      deadline: "2025-02-20",
      contact: "tech.innovation@univibe.edu.vn",
      image: "/placeholder.svg?height=150&width=200",
    }
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
          <h1 className="page-title">Khám phá các CLB</h1>
          <p className="page-subtitle">Tìm kiếm câu lạc bộ phù hợp với sở thích của bạn</p>
        </div>

        {/* Search and Filters */}
        <div className="search-filters">
          <div className="search-container">
            <div className="search-input">
              <Search size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm câu lạc bộ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filters">
            <div className="filter-group">
              <Filter size={16} />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "Tất cả danh mục" : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <Calendar size={16} />
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year === "all" ? "Tất cả năm" : `Năm ${year}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          <p>Tìm thấy {filteredClubs.length} câu lạc bộ</p>
        </div>

        {/* Clubs Grid */}
        <div className="clubs-grid">
          {currentClubs.map((club) => (
            <div key={club.id} className="club-card" onClick={() => navigate(`/clubs/${club.id}`)}>
              <div className="club-image">
                <img src={club.image} alt={club.name} />
                <div className="club-overlay">
                  <span className="view-details">Xem chi tiết</span>
                </div>
              </div>
              <div className="club-info">
                <h3 className="club-name">{club.name}</h3>
                <p className="club-category">{club.category}</p>
                <p className="club-description">{club.description}</p>
                <div className="club-meta">
                  <div className="meta-item">
                    <Users size={14} />
                    <span>{club.members} thành viên</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span>{club.location}</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>Thành lập {club.yearEstablished}</span>
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
              className="page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Trước
            </button>

            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`page-number ${currentPage === page ? "active" : ""}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      {/* Recruitment Section */}
      <section className="recruitment-section">
        <div className="section-header">
          <h2 className="section-title">Tuyển thành viên</h2>
          <p className="section-subtitle">Cơ hội tham gia các câu lạc bộ đang tuyển thành viên mới</p>
        </div>

        <div className="recruitment-grid">
          {recruitmentPosts.map((post) => (
            <div key={post.id} className="recruitment-card">
              <div className="recruitment-header">
                <img src={post.image} alt={post.clubName} className="recruitment-image" />
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
  )
}
