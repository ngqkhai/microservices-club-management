import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./VerifySignUp.css"; // Reuse existing styles
import backgroundImage from "./Picture/background.jpg";
import leftImage from "./Picture/leftLogin.jpg";
import logo from "./Picture/Logo.png";

export default function EmailVerification() {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'already_verified'
  const [message, setMessage] = useState('Đang xác thực email...');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL query parameters
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('Token xác thực không hợp lệ hoặc bị thiếu.');
          return;
        }

        // Make API call to verify email
        const response = await fetch('http://localhost:8000/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          if (result.data.alreadyVerified) {
            setStatus('already_verified');
            setMessage('Email của bạn đã được xác thực trước đó. Bạn có thể đăng nhập ngay bây giờ.');
          } else {
            setStatus('success');
            setMessage('Xác thực email thành công! Bạn có thể đăng nhập vào tài khoản của mình.');
          }
          
          // Auto redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.message || 'Xác thực email thất bại. Token có thể đã hết hạn hoặc không hợp lệ.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xác thực email. Vui lòng thử lại sau.');
      }
    };

    verifyEmail();
  }, [location.search, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
      case 'already_verified':
        return '✅';
      case 'error':
        return '❌';
      case 'verifying':
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
      case 'already_verified':
        return '#28a745';
      case 'error':
        return '#dc3545';
      case 'verifying':
      default:
        return '#007bff';
    }
  };

  return (
    <div className="login-page">
      <div
        className="background"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>

      <div className="login-container">
        <div
          className="login-image"
          style={{ backgroundImage: `url(${leftImage})` }}
        ></div>

        <div className="login-form">
          <div className="form-top">
            <img src={logo} alt="UniVibe Logo" className="logo" />
            <h2
              style={{
                textAlign: "center",
                color: "rgba(51, 44, 85, 1)",
                fontSize: "16px",
              }}
            >
              Kết nối, phát triển, tỏa sáng - bắt đầu từ đây!
            </h2>
            <hr className="separator" />
          </div>

          <div className="form-group">
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div 
                style={{ 
                  fontSize: "48px", 
                  marginBottom: "16px" 
                }}
              >
                {getStatusIcon()}
              </div>
              
              <h3 style={{ 
                color: getStatusColor(), 
                marginBottom: "16px",
                fontSize: "18px" 
              }}>
                Xác Thực Email
              </h3>
              
              <p style={{ 
                color: getStatusColor(),
                fontSize: "14px",
                lineHeight: "1.5",
                marginBottom: "20px"
              }}>
                {message}
              </p>

              {status === 'verifying' && (
                <div style={{ 
                  display: "inline-block",
                  width: "20px",
                  height: "20px", 
                  border: "2px solid #f3f3f3",
                  borderTop: "2px solid #007bff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
              )}

              {(status === 'success' || status === 'already_verified') && (
                <div>
                  <p style={{ fontSize: "12px", color: "#666" }}>
                    Đang chuyển hướng đến trang đăng nhập trong 3 giây...
                  </p>
                  <Link 
                    to="/login" 
                    style={{ 
                      color: "#007bff", 
                      textDecoration: "none",
                      fontWeight: "bold"
                    }}
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              )}

              {status === 'error' && (
                <div>
                  <Link 
                    to="/login" 
                    style={{ 
                      color: "#007bff", 
                      textDecoration: "none",
                      fontWeight: "bold",
                      marginRight: "20px"
                    }}
                  >
                    Đến trang đăng nhập
                  </Link>
                  <Link 
                    to="/signup" 
                    style={{ 
                      color: "#007bff", 
                      textDecoration: "none",
                      fontWeight: "bold"
                    }}
                  >
                    Đăng ký lại
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 