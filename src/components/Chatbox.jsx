// src/components/Chatbox.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../App.css'; // 导入包含所有样式的 App.css
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

const Chatbox = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [chatSessionId, setChatSessionId] = useState(null);

  const navigate = useNavigate();

  const OPENAI_ORGANIZATION_ID = 'org-cBsq82V1mIp5gKQpqU5ONEFE'; // 替换为您的组织 ID
  const chatboxRef = useRef(null); // 初始化 chatboxRef

  // 创建新的聊天会话
  useEffect(() => {
    const createChatSession = async () => {
      try {
        const docRef = await addDoc(collection(db, 'chatSessions'), {
          username: username,
          lastUpdated: Timestamp.now(),
        });
        setChatSessionId(docRef.id);
      } catch (error) {
        console.error('Error while creating a chat session:', error);
        setError('Could not create a chat session, please try again later.');
      }
    };

    createChatSession();
  }, [username]);

  // 监听聊天消息的更新
  useEffect(() => {
    if (!chatSessionId) return;

    const q = query(
      collection(db, 'chatSessions', chatSessionId, 'messages'),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = [];
      querySnapshot.forEach((doc) => {
        const messageData = doc.data();
        fetchedMessages.push({
          ...messageData.message,
          timestamp: messageData.timestamp,
        });
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [chatSessionId]);

  // 当消息更新时，自动滚动到底部
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const timestamp = Timestamp.now();
    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: timestamp,
    };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // 与 OpenAI API 通信
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: newMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'OpenAI-Organization': OPENAI_ORGANIZATION_ID,
          },
        }
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.data.choices[0].message.content,
        timestamp: Timestamp.now(),
      };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // 更新聊天会话的最后更新时间
      await updateDoc(doc(db, 'chatSessions', chatSessionId), {
        lastUpdated: Timestamp.now(),
      });

      // 将用户消息保存到 Firestore
      await addDoc(
        collection(db, 'chatSessions', chatSessionId, 'messages'),
        {
          message: userMessage,
          timestamp: userMessage.timestamp,
        }
      );

      // 将助手消息保存到 Firestore
      await addDoc(
        collection(db, 'chatSessions', chatSessionId, 'messages'),
        {
          message: assistantMessage,
          timestamp: assistantMessage.timestamp,
        }
      );
    } catch (error) {
      console.error(
        'Error communicating with the OpenAI API:',
        error.response ? error.response.data : error.message
      );
      setError(
        error.response
          ? error.response.data.error.message
          : 'Request failed, please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const viewHistory = () => {
    navigate('/history');
  };

  return (
    <div className="chatbox-page">
      <h3>REX</h3>
      <div className="chat-header">
        <img src="/chat-header.png" alt="聊天顶部图片" className="chat-header-image" />
      </div>
      <button className="button" onClick={viewHistory}>
      View History
      </button>
      <div className="chatbox-container">
        <div className="chatbox" ref={chatboxRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.role === 'user' ? 'message-user' : 'message-assistant'
              }`}
            >
              <div className="message-content">
                <p>{msg.content}</p>
              </div>
              <span className="message-timestamp">
                {msg.timestamp.toDate().toLocaleString()}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="message message-assistant">
              <div className="message-content">
                <p>The assistant is typing...</p>
              </div>
            </div>
          )}
          {error && <p className="error">{error}</p>}
        </div>
        <div className="input-container">
          <input
            type="text"
            className="input-field"
            placeholder="Please enter a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => (e.key === 'Enter' ? handleSend() : null)}
          />
          <button className="button" onClick={handleSend} disabled={isLoading}>
            send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
