// src/components/ChatHistory.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import '../App.css';

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
        console.error('Error getting chat logs:', error);
        setError('Could not get the chat log, please try again later.');
      }
    };

    fetchChatMessages();
  }, [chatId]);

  return (
    <div>
      <h2>Chat log details</h2>
      {error && <p className="error">{error}</p>}
      <div className="chatbox">
  {messages.map((msg, index) => (
    <div
      key={index}
      className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
    >
      <div className="message-content">
        <p>{msg.content}</p>
      </div>
      <span className="message-timestamp">
        {msg.timestamp.toDate().toLocaleString()}
      </span>
    </div>
  ))}
</div>
      <button className="button" onClick={() => navigate(-1)}>back</button>
    </div>
  );
};

export default ChatHistory;
