// src/components/HistoryList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import '../App.css'; // 确保样式已导入

const HistoryList = ({ username }) => {
  const [chatSessions, setChatSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        const q = query(
          collection(db, 'chatSessions'),
          where('username', '==', username),
          orderBy('lastUpdated', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const sessions = [];
        querySnapshot.forEach((doc) => {
          sessions.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setChatSessions(sessions);
      } catch (error) {
        console.error('Error getting list of chat sessions:', error);
      }
    };

    fetchChatSessions();
  }, [username]);

  const viewChatHistory = (chatId) => {
    navigate(`/history/${chatId}`);
  };

  return (
    <div className="history-list">
      <h2>Chat List</h2>
      <div className="history-list-container">
        {chatSessions.map((session) => (
          <div
            key={session.id}
            className="history-card"
            onClick={() => viewChatHistory(session.id)}
          >
            <img src="/chat-header.png" alt="聊天图标" className="history-card-icon" />
            <div className="history-card-content">
              <p className="history-card-date">
                {session.lastUpdated.toDate().toLocaleString()}
              </p>
              {/* 可以在这里添加更多信息，例如聊天摘要 */}
            </div>
          </div>
        ))}
      </div>
      <button className="button" onClick={() => navigate(-1)}>
        back
      </button>
    </div>
  );
};

export default HistoryList;


