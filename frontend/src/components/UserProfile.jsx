"use client"
import UserLayout from "../layouts/UserLayout"
import "../styles/UserProfile.css"
import avatar from "../assets/Logo.png"
import { Upload, Edit } from "lucide-react"

export default function UserProfile() {
  // Dữ liệu mẫu, sau này lấy từ context hoặc API
  const user = {
    name: "Nguyen Gia Kiet",
    role: "Student",
    class: "22CLC08",
    id: "22127221",
    dateOfBirth: "August 25, 2004",
    gender: "Male",
    email: "ngkiet22@clc.fitus.edu.vn",
    country: "Viet Nam",
    city: "Ho Chi Minh City",
    avatar: avatar,
  }

  const handleAvatarChange = () => {
    // Logic để thay đổi avatar
    console.log("Change avatar clicked")
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    // Logic để thay đổi mật khẩu
    console.log("Password change submitted")
  }

  return (
    <UserLayout user={user}>
      <div className="profile-page">
        <div className="profile-header">
          <h1 className="profile-title">
            {user.name} - <span className="profile-role">{user.role}</span>
          </h1>
          <p className="profile-subtitle">User detail</p>
        </div>

        <div className="profile-content">
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-container">
              <img src={user.avatar || "/placeholder.svg"} alt="User Avatar" className="user-avatar" />
            </div>
            <button className="change-avatar-btn" onClick={handleAvatarChange}>
              <Upload size={16} />
              Change avatar
            </button>
          </div>

          {/* User Details Section */}
          <div className="user-details-card">
            <div className="detail-row">
              <span className="detail-label">Class:</span>
              <span className="detail-value">{user.class}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">ID:</span>
              <span className="detail-value">{user.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date of birth:</span>
              <span className="detail-value">{user.dateOfBirth}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Gender:</span>
              <span className="detail-value">{user.gender}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email address:</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Country:</span>
              <span className="detail-value">{user.country}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">City/town:</span>
              <span className="detail-value">{user.city}</span>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="password-section">
          <h2 className="password-title">
            <Edit size={16} />
            Change password
          </h2>

          <form className="password-form" onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Old password:</label>
              <input type="password" className="form-input" placeholder="Password" required />
            </div>
            <div className="form-group">
              <label className="form-label">New password:</label>
              <input type="password" className="form-input" placeholder="Password" required />
            </div>
            <div className="form-group">
              <label className="form-label">Verify password:</label>
              <input type="password" className="form-input" placeholder="Password" required />
            </div>
            <button type="submit" className="confirm-btn">
              Confirm
            </button>
          </form>
        </div>
      </div>
    </UserLayout>
  )
}
