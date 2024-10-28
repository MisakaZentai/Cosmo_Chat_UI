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
        <h2>请输入用户名</h2>
        <input
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => (e.key === 'Enter' ? handleLogin() : null)}
        />
        <button className="button" onClick={handleLogin}>登录</button>
      </div>
    </div>
  );
};

export default Login;
