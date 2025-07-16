import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verifySignUp" element={<VerifySignUp />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/forgotpassword_1" element={<ForgotPassword_1 />} />
        <Route path="/forgot-password-verify" element={<ForgotPassword_2 />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/clubs/:clubId" element={<ClubDetail />} />
        <Route path="/clubspace/:clubId" element={<ClubSpace />} />
      </Routes>
    </Router>
  );
}

export default App;
