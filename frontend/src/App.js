import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LayoutWrapper from "./layouts/LayoutWrapper";
import ProtectedRoute from "./components/ProtectedRoute";

// Import components
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import VerifySignUp from "./components/VerifySignUp";
import EmailVerification from "./components/EmailVerification";
import ForgotPassword_1 from "./components/ForgotPassword_1";
import ForgotPassword_2 from "./components/ForgotPassword_2";
import UserProfile from "./components/UserProfile";
import ClubsPage from "./components/ClubsPage";
import ClubDetail from "./components/ClubDetail";
import ClubSpace from "./components/ClubSpace";
import DashboardPage from "./components/DashboardPage";
import SettingsPage from "./components/SettingsPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes - always use GuestLayout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verifySignUp" element={<VerifySignUp />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/forgotpassword_1" element={<ForgotPassword_1 />} />
          <Route path="/forgot-password-verify" element={<ForgotPassword_2 />} />
          
          {/* Routes that work for both guest and authenticated users */}
          <Route path="/" element={
            <LayoutWrapper>
              <HomePage />
            </LayoutWrapper>
          } />
          <Route path="/clubs" element={
            <LayoutWrapper>
              <ClubsPage />
            </LayoutWrapper>
          } />
          <Route path="/clubs/:clubId" element={
            <LayoutWrapper>
              <ClubDetail />
            </LayoutWrapper>
          } />
          
          {/* Protected routes - require authentication, use UserLayout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <LayoutWrapper>
                <DashboardPage />
              </LayoutWrapper>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <LayoutWrapper>
                <UserProfile />
              </LayoutWrapper>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <LayoutWrapper>
                <SettingsPage />
              </LayoutWrapper>
            </ProtectedRoute>
          } />
          <Route path="/clubspace/:clubId" element={
            <ProtectedRoute>
              <LayoutWrapper>
                <ClubSpace />
              </LayoutWrapper>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
