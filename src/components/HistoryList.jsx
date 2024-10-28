// src/components/HistoryList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';

const HistoryList = ({ username }) => {
  const [chatSessions, setChatSessions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        // 获取用户的聊天会话列表
        const q = query(
          collection(db, 'chatSessions'),
          where('username', '==', username),
          orderBy('lastUpdated', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const sessions = [];
        querySnapshot.forEach((doc) => {
          sessions.push({ id: doc.id, ...doc.data() });
        });
        setChatSessions(sessions);
      } catch (error) {
        console.error('获取聊天会话列表时出错：', error);
        setError('无法获取聊天会话列表，请稍后重试。');
      }
    };

    fetchChatSessions();
  }, [username]);

  return (
    <div>
      <h2>历史聊天记录</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {chatSessions.map((session) => (
          <li key={session.id}>
            <Link to={`/history/${session.id}`}>
              {new Date(session.lastUpdated.toDate()).toLocaleString()}
            </Link>
          </li>
        ))}
      </ul>
      <button onClick={() => window.history.back()}>返回</button>
    </div>
  );
};

export default HistoryList;
