// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // 导入 Routes 和 Route
import Chatbox from './components/Chatbox';
import Login from './components/Login';
import HistoryList from './components/HistoryList'; // 导入历史记录列表组件
import ChatHistory from './components/ChatHistory'; // 导入聊天详情组件

function App() {
  const [username, setUsername] = useState(null);

  const handleLogin = (name) => {
    setUsername(name);
  };

  if (!username) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Chatbox username={username} />} />
        <Route path="/history" element={<HistoryList username={username} />} />
        <Route
          path="/history/:chatId"
          element={<ChatHistory username={username} />}
        />
      </Routes>
    </div>
  );
}

export default App;
