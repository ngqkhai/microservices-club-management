"use client"

import { useState } from "react"
import { useParams } from "react-router-dom"
import UserLayout from "../layouts/UserLayout"
import "../styles/ClubSpace.css"
import {
  Users,
  Settings,
  TrendingUp,
  Heart,
  UserCheck,
  Star,
  HelpCircle,
  Plus,
  ImageIcon,
  Smile,
  BarChart3,
  Calendar,
  ThumbsUp,
  MessageSquare,
  Share2,
  MoreHorizontal,
} from "lucide-react"

export default function ClubSpace() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState("discussion")
  const [newPost, setNewPost] = useState("")
  const [user] = useState({
    id: 1,
    name: "Nguyen Gia Kiet",
    role: "admin", // admin, member
    avatar: "/placeholder.svg?height=40&width=40",
  })

  // Mock data for club
  const [club] = useState({
    id: 1,
    name: "Photography Club HCMUS 2024",
    type: "Nhóm Riêng tư",
    members: 56,
    newToday: 0,
    memberAvatars: Array.from({ length: 20 }, (_, i) => `/placeholder.svg?height=40&width=40`),
  })

  // Mock data for posts
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: {
        name: "Nguyen Vinh Khang",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      timestamp: "12 tháng 1, 2024",
      content:
        "Chào mọi người, hôm nay chúng ta sẽ có buổi workshop về kỹ thuật chụp ảnh chân dung. Mọi người nhớ mang theo máy ảnh nhé! 📸",
      hashtags: ["#StudyJam", "#Photography"],
      image: "/placeholder.svg?height=300&width=500",
      reactions: {
        like: 4,
        love: 2,
      },
      comments: 6,
      isAdmin: false,
    },
    {
      id: 2,
      author: {
        name: "Tran Thi Mai",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      timestamp: "11 tháng 1, 2024",
      content:
        "Chia sẻ một số tác phẩm từ buổi chụp ảnh cuối tuần vừa rồi. Cảm ơn mọi người đã tham gia nhiệt tình! 🌟",
      hashtags: ["#Weekend", "#PhotoShoot"],
      image: "/placeholder.svg?height=300&width=500",
      reactions: {
        like: 8,
        love: 3,
      },
      comments: 12,
      isAdmin: true,
    },
  ])

  // Mock data for events
  const [events] = useState([
    {
      id: 1,
      title: "Workshop Chụp ảnh Chân dung",
      date: "15 tháng 1, 2024",
      time: "14:00",
      location: "Phòng A201",
    },
    {
      id: 2,
      title: "Triển lãm Nhiếp ảnh",
      date: "20 tháng 1, 2024",
      time: "09:00",
      location: "Hội trường lớn",
    },
  ])

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        author: {
          name: user.name,
          avatar: user.avatar,
        },
        timestamp: new Date().toLocaleDateString("vi-VN"),
        content: newPost,
        hashtags: [],
        reactions: { like: 0, love: 0 },
        comments: 0,
        isAdmin: user.role === "admin",
      }
      setPosts([post, ...posts])
      setNewPost("")
    }
  }

  const handleReaction = (postId, type) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactions: {
                ...post.reactions,
                [type]: post.reactions[type] + 1,
              },
            }
          : post,
      ),
    )
  }

  return (
    <UserLayout user={user}>
      <div className="club-space">
        {/* Sidebar - Only show admin options if user is admin */}
        <aside className="club-sidebar">
          <div className="club-info">
            <div className="club-avatar">
              <img src="/placeholder.svg?height=60&width=60" alt={club.name} />
            </div>
            <div className="club-details">
              <h3>{club.name}</h3>
              <p>
                {club.type} • {club.members} thành viên
              </p>
            </div>
          </div>

          <div className="sidebar-stats">
            <div className="stat-item">
              <TrendingUp size={16} />
              <span>{club.newToday} mục mới hôm nay</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-item">
                <Users size={18} />
                <span>Trang thái nhóm</span>
              </div>
              <div className="nav-item">
                <Star size={18} />
                <span>Vai trò trong cộng đồng</span>
              </div>
            </div>

            {/* Admin-only sections */}
            {user.role === "admin" && (
              <>
                <div className="nav-section">
                  <div className="nav-section-title">
                    <span>Cài đặt</span>
                    <button className="expand-btn">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="nav-subsection">
                    <div className="nav-item sub-item">
                      <Settings size={16} />
                      <span>Cài đặt nhóm</span>
                    </div>
                    <div className="nav-item sub-item">
                      <Plus size={16} />
                      <span>Thêm tính năng</span>
                    </div>
                  </div>
                </div>

                <div className="nav-section">
                  <div className="nav-section-title">
                    <span>Thông tin chi tiết</span>
                    <button className="expand-btn">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="nav-subsection">
                    <div className="nav-item sub-item">
                      <TrendingUp size={16} />
                      <span>Mức độ tăng trưởng</span>
                    </div>
                    <div className="nav-item sub-item">
                      <Heart size={16} />
                      <span>Tương tác</span>
                    </div>
                    <div className="nav-item sub-item">
                      <UserCheck size={16} />
                      <span>Quản trị viên và người kiểm duyệt</span>
                    </div>
                    <div className="nav-item sub-item">
                      <Star size={16} />
                      <span>Chuyên gia trong nhóm</span>
                    </div>
                    <div className="nav-item sub-item">
                      <Users size={16} />
                      <span>Thành viên</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="nav-section">
              <div className="nav-section-title">
                <span>Hỗ trợ</span>
                <button className="expand-btn">
                  <Plus size={14} />
                </button>
              </div>
              <div className="nav-item sub-item">
                <HelpCircle size={16} />
                <span>Trung tâm trợ giúp</span>
              </div>
            </div>
          </nav>

          <button className="create-chat-btn">
            <Plus size={16} />
            <span>Tạo đoạn chat</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="club-main">
          {/* Club Header */}
          <div className="club-header">
            <div className="club-title">
              <h1>{club.name}</h1>
              <p>
                {club.type} • {club.members} thành viên
              </p>
            </div>

            {/* Member Avatars */}
            <div className="member-avatars">
              {club.memberAvatars.slice(0, 15).map((avatar, index) => (
                <img
                  key={index}
                  src={avatar || "/placeholder.svg"}
                  alt={`Member ${index + 1}`}
                  className="member-avatar"
                />
              ))}
              {club.members > 15 && <div className="more-members">+{club.members - 15}</div>}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="content-tabs">
            <button
              className={`tab ${activeTab === "discussion" ? "active" : ""}`}
              onClick={() => setActiveTab("discussion")}
            >
              Thảo luận
            </button>
            <button className={`tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>
              Đăng chú ý
            </button>
            <button
              className={`tab ${activeTab === "members" ? "active" : ""}`}
              onClick={() => setActiveTab("members")}
            >
              Thành viên
            </button>
            <button className={`tab ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}>
              Sự kiện
            </button>
            <button className={`tab ${activeTab === "media" ? "active" : ""}`} onClick={() => setActiveTab("media")}>
              File phương tiện
            </button>
            <button className={`tab ${activeTab === "files" ? "active" : ""}`} onClick={() => setActiveTab("files")}>
              File
            </button>
          </nav>

          {/* Content Area */}
          <div className="content-area">
            {activeTab === "discussion" && (
              <>
                {/* Create Post */}
                <div className="create-post">
                  <div className="post-input">
                    <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="user-avatar" />
                    <textarea
                      placeholder="Bạn viết gì đi..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="post-options">
                    <div className="post-types">
                      <button className="post-type">
                        <ImageIcon size={16} />
                        <span>Bài viết ẩn danh</span>
                      </button>
                      <button className="post-type">
                        <BarChart3 size={16} />
                        <span>Thăm dò ý kiến</span>
                      </button>
                      <button className="post-type">
                        <Smile size={16} />
                        <span>Cảm xúc/hoạt động</span>
                      </button>
                    </div>
                    <button className="post-btn" onClick={handleCreatePost} disabled={!newPost.trim()}>
                      Đăng
                    </button>
                  </div>
                </div>

                {/* Posts Feed */}
                <div className="posts-feed">
                  {posts.map((post) => (
                    <div key={post.id} className="post">
                      <div className="post-header">
                        <img
                          src={post.author.avatar || "/placeholder.svg"}
                          alt={post.author.name}
                          className="post-avatar"
                        />
                        <div className="post-info">
                          <div className="post-author">
                            {post.author.name}
                            {post.isAdmin && <span className="admin-badge">Admin</span>}
                          </div>
                          <div className="post-timestamp">{post.timestamp}</div>
                        </div>
                        <button className="post-menu">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>

                      <div className="post-content">
                        <p>{post.content}</p>
                        {post.hashtags.length > 0 && (
                          <div className="post-hashtags">
                            {post.hashtags.map((tag, index) => (
                              <span key={index} className="hashtag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {post.image && (
                          <img src={post.image || "/placeholder.svg"} alt="Post content" className="post-image" />
                        )}
                      </div>

                      <div className="post-reactions">
                        <div className="reaction-summary">
                          <div className="reaction-icons">
                            {post.reactions.like > 0 && <span className="reaction-icon like">👍</span>}
                            {post.reactions.love > 0 && <span className="reaction-icon love">❤️</span>}
                          </div>
                          <span className="reaction-count">{post.reactions.like + post.reactions.love}</span>
                        </div>
                      </div>

                      <div className="post-actions">
                        <button className="action-btn" onClick={() => handleReaction(post.id, "like")}>
                          <ThumbsUp size={16} />
                          <span>Thích</span>
                        </button>
                        <button className="action-btn">
                          <MessageSquare size={16} />
                          <span>Bình luận</span>
                        </button>
                        <button className="action-btn">
                          <Share2 size={16} />
                          <span>Chia sẻ</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "members" && (
              <div className="members-section">
                <div className="members-header">
                  <h2>Thành viên ({club.members})</h2>
                  {user.role === "admin" && (
                    <button className="add-member-btn">
                      <Plus size={16} />
                      Thêm thành viên
                    </button>
                  )}
                </div>
                <div className="members-grid">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="member-card">
                      <img
                        src={`/placeholder.svg?height=80&width=80`}
                        alt={`Member ${i + 1}`}
                        className="member-photo"
                      />
                      <h4>Thành viên {i + 1}</h4>
                      <p>Thành viên</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "events" && (
              <div className="events-section">
                <div className="events-header">
                  <h2>Sự kiện</h2>
                  {user.role === "admin" && (
                    <button className="create-event-btn">
                      <Plus size={16} />
                      Tạo sự kiện
                    </button>
                  )}
                </div>
                <div className="events-list">
                  {events.map((event) => (
                    <div key={event.id} className="event-card">
                      <div className="event-date">
                        <Calendar size={20} />
                        <span>{event.date}</span>
                      </div>
                      <div className="event-details">
                        <h4>{event.title}</h4>
                        <p>
                          {event.time} • {event.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          <div className="events-widget">
            <div className="widget-header">
              <h3>Sự kiện</h3>
              <button className="add-btn">Thêm</button>
            </div>
            <div className="upcoming-events">
              <p>Những sự kiện được tạo hoặc chia sẻ sẽ hiển thị trong thẻ này.</p>
              {user.role === "admin" && (
                <button className="create-event-widget-btn">
                  <Calendar size={16} />
                  Tạo sự kiện
                </button>
              )}
            </div>
            <p className="widget-note">Chỉ quản trị viên và người kiểm duyệt mới xem được thông tin này.</p>
          </div>
        </aside>
      </div>
    </UserLayout>
  )
}
