// src/components/Chatbox.jsx
import React, { useState } from 'react';
import axios from 'axios';

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 添加加载状态
  const [error, setError] = useState(null); // 添加错误状态

  // 定义组织 ID（请替换为您的实际组织 ID）
  const OPENAI_ORGANIZATION_ID = 'org-cBsq82V1mIp5gKQpqU5ONEFE';

  const handleSend = async () => {
    if (!input) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true); // 开始加载
    setError(null); // 重置错误

    try {
      // 添加请求节流，避免请求过多
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 延迟 1 秒

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
            'OpenAI-Organization': OPENAI_ORGANIZATION_ID, // 添加组织 ID
          },
        }
      );

      const assistantMessage = response.data.choices[0].message;
      setMessages([...newMessages, assistantMessage]);
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
      setIsLoading(false); // 结束加载
    }
  };

  return (
    <div>
      <div className="chatbox">
        {messages.map((msg, index) => (
          <div key={index} className={msg.role}>
            <p>{msg.content}</p>
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

