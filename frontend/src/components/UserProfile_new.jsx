import React, { useState, useEffect } from "react";
import "../styles/UserProfile.css"
import avatar from "../assets/Logo.png"
import { Upload, Edit, Save, X } from "lucide-react"
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile, updateUserProfile } from "../services/authService";

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    date_of_birth: "",
    gender: "",
    country: "",
    city: "",
  });

  console.log('UserProfile - user from context:', user);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    // Load data from user context if available and formData is empty
    if (user && !formData.full_name) {
      console.log('Loading data from user context:', user);
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        date_of_birth: user.date_of_birth || "",
        gender: user.gender || "",
        country: user.country || "",
        city: user.city || "",
      });
    }
  }, [user]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const result = await getUserProfile();
      console.log('getUserProfile result:', result);
      
      if (result.success) {
        console.log('Profile data:', result.data);
        setFormData({
          full_name: result.data.full_name || "",
          email: result.data.email || "",
          phone: result.data.phone || "",
          bio: result.data.bio || "",
          date_of_birth: result.data.date_of_birth || "",
          gender: result.data.gender || "",
          country: result.data.country || "",
          city: result.data.city || "",
        });
      } else {
        console.error('Failed to get profile:', result.message);
        // Fallback to user data from context
        if (user) {
          console.log('Using fallback user data:', user);
          setFormData({
            full_name: user.full_name || "",
            email: user.email || "",
            phone: user.phone || "",
            bio: user.bio || "",
            date_of_birth: user.date_of_birth || "",
            gender: user.gender || "",
            country: user.country || "",
            city: user.city || "",
          });
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // Fallback to user data from context
      if (user) {
        console.log('Using fallback user data after error:', user);
        setFormData({
          full_name: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
          bio: user.bio || "",
          date_of_birth: user.date_of_birth || "",
          gender: user.gender || "",
          country: user.country || "",
          city: user.city || "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const result = await updateUserProfile(formData);
      if (result.success) {
        setMessage("Cập nhật thành công!");
        updateUser(result.data);
        setIsEditing(false);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(result.message || "Cập nhật thất bại");
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadUserProfile(); // Reset form data
    setMessage("");
  };

  const handleAvatarChange = () => {
    // Logic để thay đổi avatar
    console.log("Change avatar clicked")
  };

  if (loading && !formData.full_name) {
    return (
      <div className="profile-loading">
        <div>Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">Thông tin tài khoản</h1>
          {!isEditing ? (
            <button 
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={16} />
              Chỉnh sửa
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="save-btn"
                onClick={handleSave}
                disabled={loading}
              >
                <Save size={16} />
                {loading ? "Đang lưu..." : "Lưu"}
              </button>
              <button 
                className="cancel-btn"
                onClick={handleCancel}
              >
                <X size={16} />
                Hủy
              </button>
            </div>
          )}
        </div>

        {message && (
          <div className={`message ${message.includes("thành công") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <div className="profile-content">
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-container">
              <img 
                src={user?.avatar || avatar} 
                alt="User Avatar" 
                className="user-avatar"
              />
              <button 
                className="avatar-upload-btn"
                onClick={handleAvatarChange}
                disabled={!isEditing}
              >
                <Upload size={16} />
              </button>
            </div>
            <div className="avatar-info">
              <h2 className="user-name">
                {formData.full_name || user?.full_name || "Người dùng"}
              </h2>
              <p className="user-email">
                {formData.email || user?.email}
              </p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="profile-form">
            <div className="form-section">
              <h3 className="section-title">Thông tin cá nhân</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="full_name">Họ và tên</label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  ) : (
                    <div className="form-value">
                      {formData.full_name || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  ) : (
                    <div className="form-value">
                      {formData.email || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  ) : (
                    <div className="form-value">
                      {formData.phone || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="date_of_birth">Ngày sinh</label>
                  {isEditing ? (
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  ) : (
                    <div className="form-value">
                      {formData.date_of_birth ? 
                        new Date(formData.date_of_birth).toLocaleDateString("vi-VN") : 
                        "Chưa cập nhật"
                      }
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Giới tính</label>
                  {isEditing ? (
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  ) : (
                    <div className="form-value">
                      {formData.gender === "male" ? "Nam" : 
                       formData.gender === "female" ? "Nữ" :
                       formData.gender === "other" ? "Khác" : "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="country">Quốc gia</label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  ) : (
                    <div className="form-value">
                      {formData.country || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="city">Thành phố</label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  ) : (
                    <div className="form-value">
                      {formData.city || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="bio">Giới thiệu bản thânn</label>
                  {isEditing ? (
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="form-input"
                      rows="4"
                      placeholder="Viết vài dòng giới thiệu về bản thân..."
                    />
                  ) : (
                    <div className="form-value">
                      {formData.bio || "Chưa có giới thiệu"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
