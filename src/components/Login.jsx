// src/components/Login.jsx
import React, { useState } from 'react';
import './Login.css'; // 导入 CSS 文件

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
      <img src="/login-image.png" alt="登录图片" className="login-image" />
        <h2>Welcome!👋</h2>
        <h3>Receive Career Help from ReX!</h3>
        <h4>Start a conversation with rex right now!</h4>
        <h5>please enter your user name</h5>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => (e.key === 'Enter' ? handleLogin() : null)}
        />
        <button className="button" onClick={handleLogin}>login</button>
      </div>
    </div>
  );
};

export default Login;
