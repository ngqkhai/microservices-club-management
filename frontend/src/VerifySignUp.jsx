import React from "react";
import "./VerifySignUp.css";
import backgroundImage from "./Picture/background.jpg";
import leftImage from "./Picture/leftLogin.jpg";
import logo from "./Picture/Logo.png";
import { Link, useLocation } from "react-router-dom";

export default function VerifySignUp() {
  const location = useLocation();
  const email = location.state?.email || "";

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
            <p style={{textAlign: "center"}}>
              Đường link xác thực đã được gửi về email:
              <br />
              <strong>{email}</strong>
            </p>
            <p>Vui lòng kiểm tra hộp thư và click vào đường link để hoàn tất đăng ký.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
