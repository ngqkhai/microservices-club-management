import React, { useState, useEffect } from "react";
import "../styles/ForgotPassword_2.css";
import backgroundImage from "../assets/background.jpg";
import leftImage from "../assets/leftLogin.jpg";
import logo from "../assets/Logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function ForgotPassword_2() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [countdown, setCountdown] = useState(0);

  const handleResendCode = () => {
    if (countdown === 0) {
      console.log("Đã gửi lại mã khôi phục tới:", email);

      // TODO: Gọi API gửi lại mã thật ở đây
      setCountdown(30);
    }
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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
            <p className="signup-text">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>

          <div className="form-group">
            <p>
              Chúng tôi đã gửi mã xác thực qua email: <strong>{email}</strong>
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="verifycode">
              Vui lòng kiểm tra hộp thư và nhập mã xác thực bên dưới
            </label>
            <input id="verifycode" type="text" />
          </div>

          <div className="forgot-password">
            {countdown > 0 ? (
              <span style={{ fontSize: "15px", color: "#888" }}>
                Gửi lại mã sau {countdown}s
              </span>
            ) : (
              <span className="resend-text">
                Chưa nhận được mã?{" "}
                <span className="resend-link" onClick={handleResendCode}>
                  Gửi lại mã xác thực
                </span>
              </span>
            )}
          </div>

          <button>Xác thực tài khoản</button>
        </div>
      </div>
    </div>
  );
}
