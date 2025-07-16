import React, { useState } from "react";
import "../styles/LoginPage.css"
import backgroundImage from "../assets/background.jpg"
import leftImage from "../assets/leftLogin.jpg"
import logo from "../assets/Logo.png"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "../contexts/AuthContext";
import { loginUser } from "../services/authService";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // Get the return URL from navigation state, default to home
  const from = location.state?.from?.pathname || "/"

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      const result = await loginUser({ email, password })
      
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, result.data:', result.data);
        // Update auth context
        login(result.data)
        
        // Redirect to the page user was trying to access, or home
        navigate(from, { replace: true })
      } else {
        setError(result.message || "Đăng nhập thất bại")
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Lỗi mạng hoặc server không phản hồi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="background" style={{ backgroundImage: `url(${backgroundImage})` }}></div>

      <div className="login-container">
        <div className="login-image" style={{ backgroundImage: `url(${leftImage})` }}></div>

        <div className="login-form">
          <div className="form-top">
            <img src={logo || "/placeholder.svg"} alt="UniVibe Logo" className="logo" />
            <hr className="separator" />
            <p className="signup-text">
              Chưa có tài khoản? <Link to="/signup">Đăng ký</Link>
            </p>
          </div>

          <h2 style={{ textAlign: "center", color: "rgba(51, 44, 85, 1)" }}>Chào mừng trở lại với UniVibe!</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
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
                  autoComplete="current-password"
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
              <div className="forgot-password">
                <Link to="/forgotpassword_1">Quên mật khẩu</Link>
              </div>
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
