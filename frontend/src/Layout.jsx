
import React from 'react';
import './Layout.css';
import logo from './Picture/Logo.png';
import background from './Picture/background.jpg';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <header className="header">
        <div className="header-left">
          <img src={logo} alt="UniVibe Logo" className="logo-img" />
          <nav className="nav-menu">
            <a href="/" className="nav-link home-link">HOME</a>
            <a href="/clubs" className="nav-link">CLUBS</a>
            <a href="/events" className="nav-link">EVENTS</a>
          </nav>
        </div>

        <div className="auth-buttons">
          <button className="login-btn">Log in</button>
          <button className="signup-btn">Sign up</button>
        </div>
      </header>

      <div className="main-content-container" style={{ backgroundImage: `url(${background})` }}>
        {children}
      </div>

      <footer className="footer">
        <div className="footer-left">
          <img src={logo} alt="UniVibe Logo" className="footer-logo" />
          <p className="footer-text">Copyright 2025 - by SWPG_UniVibe Team</p>
        </div>

        <div className="footer-info">
          <div className="contact-info">
            <h4>Contact us</h4>
            <p>Technical team: <a href="mailto:xxxxxxx@gmail.com">xxxxxxx@gmail.com</a></p>
            <p>Email: <a href="mailto:xxxxx@fit.hcmus.edu.vn">xxxxx@fit.hcmus.edu.vn</a></p>
            <p>Phone: (028) 3835 4266</p>
          </div>

          <div className="address-info">
            <h4>Address</h4>
            <p>227 Nguyen Van Cu, Ward 4,<br />District 5, Ho Chi Minh City,<br />Vietnam</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
