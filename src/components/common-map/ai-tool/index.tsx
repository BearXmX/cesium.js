import React, { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import { Button } from 'antd';
import { SearchOutlined, SendOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as Cesium from 'cesium'
import './index.less';
import GeoJsonLoader from '@/utils/plugins/geojson-loader';

// 消息类型定义
export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  time: string;
  isTypingEffect: boolean;
  fullText?: string;
}

// 组件属性类型定义
export interface AIChatBoxProps {
  width?: number;
  height?: number;
  title?: string;
  subtitle?: string;
  initialMessages?: Message[];
  typingSpeed?: number;
  thinkingTime?: number;
  viewer?: Cesium.Viewer;
  handleSetGeojson?: (fileList: string[]) => void;
}



const AIChatBox: React.FC<AIChatBoxProps> = ({
  width = 500,
  height = 500,
  title = "AI对话助手",
  subtitle = "输入问题开始对话",
  initialMessages = [],
  typingSpeed = 40,
  thinkingTime = 1000,
  viewer,
  handleSetGeojson
}) => {
  // 默认的AI回复库（包含段落）

  // 状态管理
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false); // AI正在思考（显示三个点）
  const [isAiTypingMessage, setIsAiTypingMessage] = useState<boolean>(false); // AI正在逐字显示回复

  // 使用ref来引用DOM元素
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 用于存储打字效果的定时器
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);


  // 判断AI是否正在回复（思考或打字）
  const isAiResponding = isTyping || isAiTypingMessage;

  // 滚动到底部
  const scrollToBottom = (): void => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // 获取当前时间
  const getCurrentTime = (): string => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  // 处理输入框变化
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value;
    setInputText(value);

    // 自动调整高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  };

  // 发送消息
  const handleSendMessage = (): void => {
    const text = inputText.trim();
    if (!text || isAiResponding) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now(),
      text: text,
      sender: 'user',
      time: getCurrentTime(),
      isTypingEffect: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // 重置输入框高度
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }

    // 显示正在输入指示器（AI思考中）
    setIsTyping(true);

    // 模拟AI思考
    setTimeout(() => {

      axios.post('/ai-geojson-server/v1/chat-messages', {
        inputs: {},
        query: text,
        response_mode: "blocking",
        conversation_id: "",
        user: "abc-123"
      }, {
        headers: {
          'Authorization': 'Bearer app-7riRxu6Wxu5YyWNpFsmqKAk6'
        },
      }).then(res => {
        setIsTyping(false);

        const data = res.data || {};

        const answer = data.answer || '';

        const answerList: string[] = typeof answer === 'string' ? JSON.parse(answer) : [];

        // 添加AI消息（初始为空，后面逐步显示）
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: '', // 初始为空
          sender: 'ai',
          time: getCurrentTime(),
          isTypingEffect: true,
          fullText: !answerList.length ? '未找到对应结果' : '找到以下结果\n\n' + answerList.join('\n'), // 存储完整文本
        };

        if (answerList.length) {

          handleSetGeojson!(answerList)
        }


        setMessages(prev => [...prev, aiMessage]);

        setIsAiTypingMessage(true); // 开始逐字显示

      }).catch(error => {
        setIsTyping(false);
        // 添加AI消息（初始为空，后面逐步显示）
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: '',
          sender: 'ai',
          time: getCurrentTime(),
          isTypingEffect: true,
          fullText: '系统繁忙，请稍后再试。' // 存储完整文本
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsAiTypingMessage(true); // 开始逐字显示
      });



    }, thinkingTime);
  };

  // 处理键盘事件
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 获取最后一个需要打字的消息
  const getLastTypingMessage = (): Message | undefined => {
    const typingMessages = messages.filter(msg =>
      msg.sender === 'ai' && msg.isTypingEffect && msg.fullText && msg.text.length < msg.fullText.length
    );

    return typingMessages[typingMessages.length - 1];
  };

  // 逐字显示效果
  useEffect(() => {
    // 清除之前的定时器
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    // 获取最后一个需要打字效果的消息
    const lastTypingMessage = getLastTypingMessage();

    // 如果有需要打字的消息，开始打字效果
    if (lastTypingMessage && lastTypingMessage.fullText) {
      const fullText = lastTypingMessage.fullText;
      let currentIndex = lastTypingMessage.text.length;

      typingTimerRef.current = setInterval(() => {
        if (currentIndex < fullText.length) {
          const newText = fullText.substring(0, currentIndex + 1);

          setMessages(prev => prev.map(msg =>
            msg.id === lastTypingMessage.id
              ? { ...msg, text: newText, isTypingEffect: currentIndex + 1 < fullText.length }
              : msg
          ));

          currentIndex++;
          scrollToBottom();
        } else {
          // 打字完成，清除定时器
          if (typingTimerRef.current) {
            clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
          }

          // 打字完成后更新状态
          setIsAiTypingMessage(false);
        }
      }, typingSpeed);
    } else {
      // 没有打字消息，确保状态正确
      const hasTypingMessage = messages.some(msg =>
        msg.sender === 'ai' && msg.isTypingEffect && msg.fullText && msg.text.length < msg.fullText.length
      );

      if (!hasTypingMessage) {
        setIsAiTypingMessage(false);
      }
    }

    // 清理定时器
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [messages, typingSpeed]);

  // 初始化欢迎消息
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now(),
        text: '', // 初始为空
        sender: 'ai',
        time: getCurrentTime(),
        isTypingEffect: true,
        fullText: '您好！我是AI助手，有什么问题可以问我。'
      };

      setMessages([welcomeMessage]);
      setIsAiTypingMessage(true); // 开始逐字显示欢迎消息
    }
  }, []); // 只在组件挂载时运行一次

  // 当消息更新时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 处理文本中的换行符，转换为React元素
  const renderTextWithLineBreaks = (text: string): React.ReactNode => {
    if (!text) return null;

    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // 组件样式
  const containerStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`
  };

  return (
    <div className="ai-chat-container" style={containerStyle}>
      {/* 头部 */}
      <div className="chat-header">
        <div className="header-left">
          <div className="ai-icon">
            <i className="fas fa-robot"></i>
          </div>
          <div className="header-title">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>
        <div className="chat-status">
          <span className="status-dot"></span>
          <span>在线</span>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="chat-messages" ref={messagesContainerRef}>
        {messages.map(message => (
          <div
            key={message.id}
            className={`message ${message.sender}-message`}
          >
            {message.sender === 'ai' && (
              <div className="ai-avatar">
                <i className="fas fa-robot"></i>
              </div>
            )}

            <div className={`${message.sender}-content`}>
              <div className="message-text">
                {renderTextWithLineBreaks(message.text)}
                {message.isTypingEffect && message.text.length < (message.fullText || '').length && (
                  <span className="typing-cursor"></span>
                )}
              </div>
              <div className="message-time">{message.time}</div>
            </div>

            {message.sender === 'user' && (
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
        ))}

        {/* 正在输入指示器 */}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div className="typing-dots">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="chat-input-area">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder={isAiResponding ? "AI正在回复，请稍候..." : "请输入您的问题..."}
            rows={1}
            disabled={isAiResponding}
          />
        </div>
        <Button type="primary" onClick={handleSendMessage}
          disabled={!inputText.trim() || isAiResponding} className='send-button' shape="circle" size='large' icon={<SendOutlined />} />
      </div>
    </div>
  );
};

export default AIChatBox;