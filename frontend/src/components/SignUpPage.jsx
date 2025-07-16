import React, { useState } from "react"
import "../styles/SignUpPage.css"
import backgroundImage from "../assets/background.jpg"
import leftImage from "../assets/leftLogin.jpg"
import logo from "../assets/Logo.png"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { registerUser } from "../services/authService"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    if (!email || !name || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.")
      return
    }
    
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp.")
      return
    }
    
    setLoading(true)
    
    try {
      const result = await registerUser({
        email,
        password,
        fullName: name
      })
      
      if (result.success) {
        setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.")
        setTimeout(() => {
          navigate("/verifySignUp", { state: { email } })
        }, 1500)
      } else {
        setError(result.message || "Đăng ký thất bại")
      }
    } catch (err) {
      setError("Lỗi mạng hoặc server không phản hồi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page" style={{ fontFamily: '"Roboto Flex", Roboto, Arial, sans-serif' }}>
      <div className="background" style={{ backgroundImage: `url(${backgroundImage})` }}></div>

      <div className="login-container">
        <div className="login-image" style={{ backgroundImage: `url(${leftImage})` }}></div>

        <div className="login-form">
          <div className="form-top">
            <img src={logo || "/placeholder.svg"} alt="UniVibe Logo" className="logo" />
            <h2
              style={{
                textAlign: "center",
                color: "rgba(51, 44, 85, 1)",
                fontSize: "16px",
                fontFamily: '"Roboto Flex", Roboto, Arial, sans-serif',
              }}
            >
              Kết nối, phát triển, tỏa sáng - bắt đầu từ đây!
            </h2>
            <hr className="separator" />
            <p className="signup-text">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Họ tên</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ fontFamily: '"Roboto Flex", Roboto, Arial, sans-serif' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ fontFamily: '"Roboto Flex", Roboto, Arial, sans-serif' }}
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
                  required
                  style={{ fontFamily: '"Roboto Flex", Roboto, Arial, sans-serif' }}
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
              <div className="password-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ fontFamily: '"Roboto Flex", Roboto, Arial, sans-serif' }}
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ cursor: "pointer" }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  fontWeight: "bold",
                  fontFamily: '"Roboto Flex", Roboto, Arial, sans-serif',
                  minWidth: 180,
                  textAlign: "center",
                }}
              >
                {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
