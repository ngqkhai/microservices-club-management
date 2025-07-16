import React, { useState } from 'react';
import { Lock, Bell, Shield, Trash2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { resetPassword, deleteAccount } from '../services/authService';
import '../styles/SettingsPage.css';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('password');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    clubUpdates: true,
    eventReminders: true,
    applicationResults: true
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('Mật khẩu mới không khớp');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Implement password change logic here
      // const result = await changePassword(passwordForm);
      
      // Mock success for now
      setTimeout(() => {
        setMessage('Đổi mật khẩu thành công!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setLoading(false);
      }, 1000);
    } catch (error) {
      setMessage('Có lỗi xảy ra khi đổi mật khẩu');
      setLoading(false);
    }
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveNotificationSettings = () => {
    setLoading(true);
    
    // Mock save
    setTimeout(() => {
      setMessage('Cài đặt thông báo đã được lưu');
      setLoading(false);
    }, 500);
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.'
    );

    if (!confirmDelete) return;

    const confirmAgain = window.confirm(
      'Xác nhận lần cuối: Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?'
    );

    if (!confirmAgain) return;

    setLoading(true);
    
    try {
      const result = await deleteAccount();
      if (result.success) {
        alert('Tài khoản đã được xóa thành công');
        logout();
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi xóa tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1 className="settings-title">Cài đặt tài khoản</h1>
        </div>

        {message && (
          <div className={`settings-message ${message.includes('thành công') || message.includes('được lưu') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="settings-content">
          <nav className="settings-nav">
            <button 
              className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <Lock size={20} />
              Đổi mật khẩu
            </button>
            <button 
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={20} />
              Thông báo
            </button>
            <button 
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield size={20} />
              Bảo mật
            </button>
          </nav>

          <div className="settings-panel">
            {activeTab === 'password' && (
              <div className="panel-content">
                <h2 className="panel-title">Đổi mật khẩu</h2>
                <form onSubmit={handlePasswordChange} className="password-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">Mật khẩu mới</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      className="form-input"
                      minLength={8}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      className="form-input"
                      minLength={8}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={loading}
                  >
                    <Save size={16} />
                    {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="panel-content">
                <h2 className="panel-title">Cài đặt thông báo</h2>
                <div className="notification-settings">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Thông báo email</h3>
                      <p>Nhận thông báo qua email</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={() => handleNotificationChange('emailNotifications')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Cập nhật câu lạc bộ</h3>
                      <p>Thông báo về hoạt động câu lạc bộ bạn tham gia</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={notifications.clubUpdates}
                        onChange={() => handleNotificationChange('clubUpdates')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Nhắc nhở sự kiện</h3>
                      <p>Nhận nhắc nhở về sự kiện bạn quan tâm</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={notifications.eventReminders}
                        onChange={() => handleNotificationChange('eventReminders')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Kết quả ứng tuyển</h3>
                      <p>Thông báo kết quả khi ứng tuyển câu lạc bộ</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={notifications.applicationResults}
                        onChange={() => handleNotificationChange('applicationResults')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <button 
                    onClick={saveNotificationSettings}
                    className="submit-btn"
                    disabled={loading}
                  >
                    <Save size={16} />
                    {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="panel-content">
                <h2 className="panel-title">Bảo mật tài khoản</h2>
                <div className="security-settings">
                  <div className="danger-zone">
                    <h3 className="danger-title">Vùng nguy hiểm</h3>
                    <p className="danger-description">
                      Các hành động sau đây sẽ ảnh hưởng vĩnh viễn đến tài khoản của bạn
                    </p>
                    
                    <button 
                      onClick={handleDeleteAccount}
                      className="danger-btn"
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                      Xóa tài khoản vĩnh viễn
                    </button>
                    
                    <p className="danger-note">
                      Hành động này sẽ xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan. 
                      Bạn sẽ không thể khôi phục sau khi xóa.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
