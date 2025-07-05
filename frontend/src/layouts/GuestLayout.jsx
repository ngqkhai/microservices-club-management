import React from 'react';
import { Link } from 'react-router-dom';
import './GuestLayout.css';
import logo from '../Picture/Logo.png';
import background from '../Picture/background.jpg';

const GuestLayout = ({ children }) => (
  <div className="layout-container" style={{ fontFamily: 'Quicksand, Arial, sans-serif' }}>
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="UniVibe Logo" className="logo-img" />
        <nav className="nav-menu">
          <Link to="/" className="nav-link home-link">DASHBOARD</Link>
          <Link to="/clubs" className="nav-link">CLUBS</Link>
          <Link to="/events" className="nav-link">EVENTS</Link>
        </nav>
      </div>
      <div className="auth-buttons">
        <Link to="/login" className="login-btn">Log in</Link>
        <Link to="/signup" className="signup-btn">Sign up</Link>
      </div>
    </header>
    <div className="main-content-container" style={{ backgroundImage: `url(${background})` }}>
      {children}
    </div>
    <footer className="footer">
      <div className="footer-left">
        <img src={logo} alt="UniVibe Logo" className="footer-logo" />
        <p className="footer-text">Copyright © 2025 - by SWPG_UniVibe Team</p>
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

export default GuestLayout; 