import React, { useState } from "react";
import "./SignUpPage.css";
import backgroundImage from "./Picture/background.jpg";
import leftImage from "./Picture/leftLogin.jpg";
import logo from "./Picture/Logo.png";
import { Link, useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!email || !name || !password || !confirmPassword) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp.");
      return;
    }

    navigate("/verifySignUp", { state: { email } });
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
            <p className="signup-text">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="name">Họ tên</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
            <div className="password-wrapper">
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <button onClick={handleSubmit}>Tạo tài khoản mới</button>
        </div>
      </div>
    </div>
  );
}
