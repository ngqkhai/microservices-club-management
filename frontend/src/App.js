import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage"; 
import VerifySignUp from "./VerifySignUp"
import ForgotPassword_1 from "./ForgotPassword_1";
import ForgotPassword_2 from "./ForgotPassword_2";
import UserProfile from "./UserProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verifySignUp" element={<VerifySignUp />} />
        <Route path="/forgotpassword_1" element={<ForgotPassword_1 />} />
        <Route path="/forgot-password-verify" element={<ForgotPassword_2 />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
