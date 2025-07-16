import React, { useState } from "react";
import "../styles/ForgotPassword_1.css";
import backgroundImage from "../assets/background.jpg";
import leftImage from "../assets/leftLogin.jpg";
import logo from "../assets/Logo.png";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword_1() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (email.trim() === "") {
      alert("Vui lòng nhập email.");
      return;
    }

    // Chuyển sang trang xác thực và truyền email qua state
    navigate("/forgot-password-verify", { state: { email } });
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
            <hr className="separator" />
            <p className="signup-text">
              Chưa có tài khoản? <Link to="/signup">Đăng ký</Link>
            </p>
          </div>

          <h2 style={{ textAlign: "center", color: "rgba(51, 44, 85, 1)" }}>
            Khôi phục tài khoản UniVibe
          </h2>

          <div className="form-group">
            <label htmlFor="email">Nhập email</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
            />
          </div>
          <button onClick={handleContinue}>Tiếp tục</button>
        </div>
      </div>
    </div>
  );
}
