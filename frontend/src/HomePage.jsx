import React from 'react';
import GuestLayout from './layouts/GuestLayout';
import './HomePage.css';
import heroBg from './Picture/Dark Blue Modern Background Space Instagram Post (Hình nền màn hình chính) 2.png';
export default function HomePage() {
  return (
    <GuestLayout>
      <section className="home-hero">
        <img src={heroBg} alt="UniVibe Hero" className="home-hero-bg" />
        <div className="home-hero-overlay"></div>
        <h1 className="home-hero-title">
          Khám phá đam mê – Kết nối cộng đồng – Sống hết mình với UniVibe
        </h1>
      </section>
      {/* Phần còn lại để div khác sau, nền tối màu #0F1429 */}
      <div className="home-main-dark"></div>
    </GuestLayout>
  );
}
