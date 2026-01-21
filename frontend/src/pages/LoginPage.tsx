import React from "react";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  return (
    <div className="login-container">
      
      <div className="login-left">
        <img
          src="/cirrus-logo.png"
          alt="Cirrus Labs"
          className="logo"
        />

        <h1 className="title">
          Interns<span>360</span>
        </h1>

        <p className="subtitle">
          Manage your entire intern lifecycle with confidence. Track progress,
          daily standups, attendance, and performance — all in one platform.
        </p>
      </div>

      
      <div className="login-right">
        <div className="login-box">
          <h2>Login</h2>

          <label>Email address</label>
          <input type="email" placeholder="Enter your email" />

          <label>Password</label>
          <input type="password" placeholder="Enter your password" />

          <button className="login-btn">Login</button>

          <div className="divider">OR</div>

        
          <button className="microsoft-btn">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
              alt="Microsoft"
              className="microsoft-icon"
            />
            <span>Sign in with Microsoft</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
