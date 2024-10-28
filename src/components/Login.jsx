// src/components/Login.jsx
import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="login">
      <h2>请输入用户名</h2>
      <input
        type="text"
        placeholder="用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyPress={(e) => (e.key === 'Enter' ? handleLogin() : null)}
      />
      <button onClick={handleLogin}>登录</button>
    </div>
  );
};

export default Login;