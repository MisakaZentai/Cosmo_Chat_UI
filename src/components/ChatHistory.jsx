// src/components/ChatHistory.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

const ChatHistory = ({ username }) => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChatMessages = async () => {
      try {
        const q = query(
          collection(db, 'chatSessions', chatId, 'messages'),
          orderBy('timestamp')
        );
        const querySnapshot = await getDocs(q);
        const fetchedMessages = [];
        querySnapshot.forEach((doc) => {
          const messageData = doc.data();
          fetchedMessages.push({
            ...messageData.message,
            timestamp: messageData.timestamp,
          });
        });
        setMessages(fetchedMessages);
      } catch (error) {
        console.error('获取聊天记录时出错：', error);
        setError('无法获取聊天记录，请稍后重试。');
      }
    };

    fetchChatMessages();
  }, [chatId]);

  return (
    <div>
      <h2>聊天记录详情</h2>
      {error && <p className="error">{error}</p>}
      <div className="chatbox">
        {messages.map((msg, index) => (
          <div key={index} className={msg.role}>
            <p>{msg.content}</p>
            <span>{msg.timestamp.toDate().toLocaleString()}</span>
          </div>
        ))}
      </div>
      <button onClick={() => navigate(-1)}>返回</button>
    </div>
  );
};

export default ChatHistory;
