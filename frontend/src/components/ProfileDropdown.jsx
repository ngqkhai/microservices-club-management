import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import './ProfileDropdown.css';

const ProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button 
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src={user?.profile_picture_url || "/placeholder.svg"} 
          alt="avatar" 
          className="avatar" 
        />
        <span className="profile-name">
          {user?.full_name || user?.name || "User"}
        </span>
        <ChevronDown 
          size={16} 
          className={`chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <img 
              src={user?.profile_picture_url || "/placeholder.svg"} 
              alt="avatar" 
              className="dropdown-avatar" 
            />
            <div className="user-info">
              <span className="user-name">
                {user?.full_name || user?.name || "User"}
              </span>
              <span className="user-email">
                {user?.email || "user@example.com"}
              </span>
            </div>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <button 
            className="dropdown-item"
            onClick={handleProfileClick}
          >
            <User size={16} />
            <span>Thông tin tài khoản</span>
          </button>
          
          <button 
            className="dropdown-item"
            onClick={handleSettingsClick}
          >
            <Settings size={16} />
            <span>Cài đặt</span>
          </button>
          
          <div className="dropdown-divider"></div>
          
          <button 
            className="dropdown-item logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
