// src/components/Chatbox.jsx
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const createChatSession = async () => {
      try {
        const docRef = await addDoc(collection(db, 'chatSessions'), {
          username: username,
          lastUpdated: Timestamp.now(),
        });
        setChatSessionId(docRef.id);
      } catch (error) {
        console.error('创建聊天会话时出错：', error);
        setError('无法创建聊天会话，请稍后重试。');
      }
    };

    createChatSession();
  }, [username]);

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

  const handleSend = async () => {
    if (!input) return;

    const timestamp = Timestamp.now();
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: timestamp,
    };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: newMessages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'OpenAI-Organization': OPENAI_ORGANIZATION_ID,
          }
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
      await addDoc(collection(db, 'chatSessions', chatSessionId, 'messages'), {
        message: userMessage,
        timestamp: userMessage.timestamp,
      });

      // 将助手消息保存到 Firestore
      await addDoc(collection(db, 'chatSessions', chatSessionId, 'messages'), {
        message: assistantMessage,
        timestamp: assistantMessage.timestamp,
      });
    } catch (error) {
      console.error(
        '与 OpenAI API 通信时出错：',
        error.response ? error.response.data : error.message
      );
      setError(
        error.response
          ? error.response.data.error.message
          : '请求失败，请稍后重试。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const viewHistory = () => {
    navigate('/history');
  };

  return (
    <div>
      <h3>欢迎，{username}</h3>
      <button onClick={viewHistory}>查看历史记录</button>
      <div className="chatbox">
        {messages.map((msg, index) => (
          <div key={index} className={msg.role}>
            <p>{msg.content}</p>
            <span>{msg.timestamp.toDate().toLocaleString()}</span>
          </div>
        ))}
        {isLoading && <p>助手正在输入...</p>}
        {error && <p className="error">{error}</p>}
      </div>
      <input
        type="text"
        placeholder="请输入消息..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => (e.key === 'Enter' ? handleSend() : null)}
      />
      <button onClick={handleSend} disabled={isLoading}>
        发送
      </button>
    </div>
  );
};

export default Chatbox;
