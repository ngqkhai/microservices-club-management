"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import GuestLayout from "../layouts/GuestLayout"
import "../styles/ClubDetail.css"
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Mail,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Star,
  Heart,
  Share2,
  Clock,
  Award,
  Target,
} from "lucide-react"

export default function ClubDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [club, setClub] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isFavorite, setIsFavorite] = useState(false)

  // Mock data for club details
  const clubsData = {
    1: {
      id: 1,
      name: "Photography Club",
      category: "Arts & Media",
      yearEstablished: 2018,
      members: 150,
      location: "Building A, Room 201",
      email: "photo.club@univibe.edu.vn",
      phone: "(028) 3835 4266",
      website: "https://photo.univibe.edu.vn",
      socialMedia: {
        instagram: "@univibe_photo",
        facebook: "UniVibe Photography Club",
        twitter: "@univibe_photo",
      },
      coverImage: "/placeholder.svg?height=400&width=800",
      logo: "/placeholder.svg?height=200&width=200",
      description:
        "Photography Club là nơi quy tụ những người đam mê nhiếp ảnh, từ những người mới bắt đầu đến những nhiếp ảnh gia có kinh nghiệm. Chúng tôi tổ chức các buổi workshop, chuyến đi chụp ảnh, triển lãm và các hoạt động giao lưu để phát triển kỹ năng và chia sẻ đam mê chung.",
      mission:
        "Tạo ra một cộng đồng nhiếp ảnh năng động, nơi mọi người có thể học hỏi, chia sẻ và phát triển tài năng nhiếp ảnh của mình.",
      vision: "Trở thành câu lạc bộ nhiếp ảnh hàng đầu tại trường, đào tạo ra những nhiếp ảnh gia tài năng.",
      achievements: [
        "Giải nhất cuộc thi nhiếp ảnh sinh viên toàn quốc 2023",
        "Tổ chức thành công 15 triển lãm nhiếp ảnh",
        "Có hơn 500 tác phẩm được xuất bản trên các tạp chí",
        "Đào tạo hơn 300 thành viên trong 5 năm hoạt động",
      ],
      activities: [
        {
          title: "Workshop Nhiếp ảnh cơ bản",
          description: "Học các kỹ thuật nhiếp ảnh từ cơ bản đến nâng cao",
          frequency: "Hàng tuần",
          time: "Thứ 7, 14:00 - 17:00",
        },
        {
          title: "Chuyến đi chụp ảnh",
          description: "Khám phá các địa điểm đẹp và thực hành nhiếp ảnh",
          frequency: "Hàng tháng",
          time: "Cuối tuần",
        },
        {
          title: "Triển lãm nhiếp ảnh",
          description: "Trưng bày tác phẩm của thành viên",
          frequency: "Mỗi học kỳ",
          time: "Linh hoạt",
        },
        {
          title: "Thi nhiếp ảnh nội bộ",
          description: "Cuộc thi để thành viên thể hiện tài năng",
          frequency: "Hàng quý",
          time: "Theo thông báo",
        },
      ],
      gallery: [
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
      ],
      leadership: [
        {
          name: "Nguyễn Văn An",
          position: "Chủ tịch",
          image: "/placeholder.svg?height=150&width=150",
          bio: "Sinh viên năm 3 ngành Thiết kế Đồ họa, đam mê nhiếp ảnh từ năm 16 tuổi.",
        },
        {
          name: "Trần Thị Bình",
          position: "Phó Chủ tịch",
          image: "/placeholder.svg?height=150&width=150",
          bio: "Chuyên về nhiếp ảnh chân dung và sự kiện, có 4 năm kinh nghiệm.",
        },
        {
          name: "Lê Minh Cường",
          position: "Trưởng ban Kỹ thuật",
          image: "/placeholder.svg?height=150&width=150",
          bio: "Chuyên gia về xử lý ảnh và thiết bị nhiếp ảnh chuyên nghiệp.",
        },
      ],
      requirements: [
        "Đam mê nhiếp ảnh và sáng tạo",
        "Có tinh thần học hỏi và chia sẻ",
        "Tham gia đầy đủ các hoạt động của club",
        "Có thiết bị nhiếp ảnh cơ bản (có thể hỗ trợ cho thành viên mới)",
      ],
      benefits: [
        "Học hỏi kỹ thuật nhiếp ảnh từ các chuyên gia",
        "Tham gia các chuyến đi chụp ảnh miễn phí",
        "Cơ hội triển lãm tác phẩm cá nhân",
        "Kết nối với cộng đồng nhiếp ảnh chuyên nghiệp",
        "Hỗ trợ thiết bị và phần mềm chỉnh sửa ảnh",
      ],
    },
    // Add more clubs data as needed
  }

  useEffect(() => {
    const clubData = clubsData[id]
    if (clubData) {
      setClub(clubData)
    }
  }, [id])

  const handleBack = () => {
    navigate("/clubs")
  }

  const handleJoinClub = () => {
    // Logic to join club
    alert("Tính năng đăng ký tham gia sẽ được cập nhật sớm!")
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: club.name,
        text: club.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link đã được sao chép!")
    }
  }

  if (!club) {
    return (
      <GuestLayout>
        <div className="club-detail-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin câu lạc bộ...</p>
        </div>
      </GuestLayout>
    )
  }

  return (
    <GuestLayout>
      <div className="club-detail-page">
        {/* Background Effects */}
        <div className="bg-effects">
          <div className="gradient-orb-1"></div>
          <div className="gradient-orb-2"></div>
          <div className="floating-element-1"></div>
          <div className="floating-element-2"></div>
        </div>

        {/* Hero Section */}
        <section className="club-hero">
          <div className="hero-background">
            <img src={club.coverImage || "/placeholder.svg"} alt={club.name} className="hero-image" />
            <div className="hero-overlay"></div>
          </div>

          <div className="hero-content">
            <button className="back-btn" onClick={handleBack}>
              <ArrowLeft size={20} />
              Quay lại
            </button>

            <div className="club-header">
              <div className="club-logo-container">
                <img src={club.logo || "/placeholder.svg"} alt={club.name} className="club-logo" />
              </div>

              <div className="club-basic-info">
                <h1 className="club-title">{club.name}</h1>
                <p className="club-category">{club.category}</p>
                <div className="club-stats">
                  <div className="stat">
                    <Calendar size={16} />
                    <span>Thành lập {club.yearEstablished}</span>
                  </div>
                  <div className="stat">
                    <Users size={16} />
                    <span>{club.members} thành viên</span>
                  </div>
                  <div className="stat">
                    <MapPin size={16} />
                    <span>{club.location}</span>
                  </div>
                </div>
              </div>

              <div className="club-actions">
                <button className="action-btn favorite-btn" onClick={handleToggleFavorite}>
                  <Heart size={20} fill={isFavorite ? "#f1bb87" : "none"} />
                </button>
                <button className="action-btn share-btn" onClick={handleShare}>
                  <Share2 size={20} />
                </button>
                <button className="join-btn" onClick={handleJoinClub}>
                  Tham gia ngay
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <nav className="detail-nav">
          <div className="nav-container">
            <button
              className={`nav-tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Tổng quan
            </button>
            <button
              className={`nav-tab ${activeTab === "activities" ? "active" : ""}`}
              onClick={() => setActiveTab("activities")}
            >
              Hoạt động
            </button>
            <button
              className={`nav-tab ${activeTab === "gallery" ? "active" : ""}`}
              onClick={() => setActiveTab("gallery")}
            >
              Thư viện
            </button>
            <button
              className={`nav-tab ${activeTab === "leadership" ? "active" : ""}`}
              onClick={() => setActiveTab("leadership")}
            >
              Ban chủ nhiệm
            </button>
            <button className={`nav-tab ${activeTab === "join" ? "active" : ""}`} onClick={() => setActiveTab("join")}>
              Tham gia
            </button>
          </div>
        </nav>

        {/* Content Sections */}
        <div className="detail-content">
          {activeTab === "overview" && (
            <section className="overview-section">
              <div className="content-grid">
                <div className="main-content">
                  <div className="content-card">
                    <h2>Giới thiệu</h2>
                    <p className="description">{club.description}</p>
                  </div>

                  <div className="content-card">
                    <h2>Sứ mệnh & Tầm nhìn</h2>
                    <div className="mission-vision">
                      <div className="mission">
                        <Target size={24} />
                        <div>
                          <h3>Sứ mệnh</h3>
                          <p>{club.mission}</p>
                        </div>
                      </div>
                      <div className="vision">
                        <Star size={24} />
                        <div>
                          <h3>Tầm nhìn</h3>
                          <p>{club.vision}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="content-card">
                    <h2>Thành tích nổi bật</h2>
                    <div className="achievements">
                      {club.achievements.map((achievement, index) => (
                        <div key={index} className="achievement-item">
                          <Award size={20} />
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sidebar">
                  <div className="contact-card">
                    <h3>Thông tin liên hệ</h3>
                    <div className="contact-info">
                      <div className="contact-item">
                        <Mail size={18} />
                        <a href={`mailto:${club.email}`}>{club.email}</a>
                      </div>
                      <div className="contact-item">
                        <Phone size={18} />
                        <span>{club.phone}</span>
                      </div>
                      <div className="contact-item">
                        <Globe size={18} />
                        <a href={club.website} target="_blank" rel="noopener noreferrer">
                          Website
                        </a>
                      </div>
                    </div>

                    <div className="social-links">
                      <h4>Mạng xã hội</h4>
                      <div className="social-buttons">
                        <a href="#" className="social-btn instagram">
                          <Instagram size={18} />
                        </a>
                        <a href="#" className="social-btn facebook">
                          <Facebook size={18} />
                        </a>
                        <a href="#" className="social-btn twitter">
                          <Twitter size={18} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "activities" && (
            <section className="activities-section">
              <div className="activities-grid">
                {club.activities.map((activity, index) => (
                  <div key={index} className="activity-card">
                    <h3>{activity.title}</h3>
                    <p className="activity-description">{activity.description}</p>
                    <div className="activity-details">
                      <div className="activity-detail">
                        <Clock size={16} />
                        <span>{activity.frequency}</span>
                      </div>
                      <div className="activity-detail">
                        <Calendar size={16} />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "gallery" && (
            <section className="gallery-section">
              <div className="gallery-grid">
                {club.gallery.map((image, index) => (
                  <div key={index} className="gallery-item">
                    <img src={image || "/placeholder.svg"} alt={`Gallery ${index + 1}`} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "leadership" && (
            <section className="leadership-section">
              <div className="leadership-grid">
                {club.leadership.map((leader, index) => (
                  <div key={index} className="leader-card">
                    <img src={leader.image || "/placeholder.svg"} alt={leader.name} className="leader-image" />
                    <div className="leader-info">
                      <h3>{leader.name}</h3>
                      <p className="leader-position">{leader.position}</p>
                      <p className="leader-bio">{leader.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "join" && (
            <section className="join-section">
              <div className="join-content">
                <div className="requirements-card">
                  <h2>Yêu cầu tham gia</h2>
                  <ul className="requirements-list">
                    {club.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>

                <div className="benefits-card">
                  <h2>Quyền lợi thành viên</h2>
                  <ul className="benefits-list">
                    {club.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div className="join-action">
                  <button className="join-now-btn" onClick={handleJoinClub}>
                    Đăng ký tham gia ngay
                  </button>
                  <p className="join-note">
                    Bằng cách tham gia, bạn đồng ý tuân thủ các quy định của câu lạc bộ và trường đại học.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </GuestLayout>
  )
}
