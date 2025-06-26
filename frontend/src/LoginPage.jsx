//import React from "react";
import "./LoginPage.css";
import backgroundImage from "./Picture/background.jpg";
import leftImage from "./Picture/leftLogin.jpg";
import React, { useState } from "react";
import logo from "./Picture/Logo.png";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
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
            <hr className="separator" />
            <p className="signup-text">
              Chưa có tài khoản? <Link to="/signup">Đăng ký</Link>
            </p>
          </div>

          <h2 style={{ textAlign: "center", color: "rgba(51, 44, 85, 1)" }}>
            Chào mừng trở lại với UniVibe!
          </h2>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="text" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            <div className="forgot-password">
              <Link to="/forgotpassword_1">Quên mật khẩu</Link>
            </div>
          </div>
          <button>Đăng nhập</button>
        </div>
      </div>
    </div>
  );
}
