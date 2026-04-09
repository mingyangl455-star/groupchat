/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  Search, 
  MoreHorizontal, 
  Plus, 
  Image as ImageIcon, 
  Smile, 
  Gift, 
  Languages, 
  MessageSquare, 
  Mic,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface User {
  name: string;
  avatar: string;
  isVip?: boolean;
  isVipPlus?: boolean;
  badges?: string[];
  flag?: string;
}

interface Message {
  id: string;
  type: 'user' | 'system' | 'timestamp';
  sender?: User;
  content?: string;
  timestamp?: string;
  isSelf?: boolean;
  giftInfo?: {
    image: string;
    title: string;
    description: string;
  };
}

// --- Mock Data ---

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'sys-1',
    type: 'system',
    giftInfo: {
      image: 'https://picsum.photos/seed/gift1/100/100',
      title: '赠送礼物',
      description: '赠送礼物给 覃源华 ATan, 庄燕燕 Leona'
    }
  },
  {
    id: 'time-1',
    type: 'timestamp',
    content: '02/22 22:22'
  },
  {
    id: 'msg-1',
    type: 'user',
    sender: {
      name: '庄燕燕 Leona',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leona',
      isVip: true,
      flag: '🇨🇳'
    },
    giftInfo: {
      image: 'https://picsum.photos/seed/gift2/100/100',
      title: '赠送礼物',
      description: '赠送礼物给 覃源华 ATan, Timmons'
    }
  },
  {
    id: 'time-2',
    type: 'timestamp',
    content: '03/01 14:40'
  },
  {
    id: 'msg-2',
    type: 'user',
    sender: {
      name: '文莲 Joanna',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joanna',
      isVip: true,
      badges: ['CN', 'EN'],
      flag: '🇨🇳'
    },
    content: '@张婷婷 Tingting 直播间直接发这里'
  },
  {
    id: 'msg-3',
    type: 'user',
    sender: {
      name: '张婷婷 Tingting',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tingting',
      isVipPlus: true,
      badges: ['CN', 'EN'],
      flag: '🇨🇳'
    },
    content: '好的'
  },
  {
    id: 'msg-4',
    type: 'user',
    sender: {
      name: '张婷婷 Tingting',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tingting',
      isVipPlus: true,
      badges: ['CN', 'EN'],
      flag: '🇨🇳'
    },
    content: '来 HelloTalk 一起观看全球语言文化直播：https://h5.hellotalk8.com/h5live/v2/htlive/?cname=LS_156097511_1772346582279638108&HA=1'
  }
];

// --- Components ---

const Toast = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: 20 }}
    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/70 text-white px-6 py-3 rounded-2xl text-sm font-medium shadow-xl backdrop-blur-sm"
  >
    {message}
  </motion.div>
);

const Badge = ({ type }: { type: string }) => {
  if (type === 'VIP') return <span className="bg-[#FFB800] text-white text-[10px] px-1 rounded-sm font-bold italic ml-1">VIP</span>;
  if (type === 'VIP+') return <span className="bg-gradient-to-r from-[#7B61FF] to-[#B361FF] text-white text-[10px] px-1 rounded-sm font-bold italic ml-1">VIP+</span>;
  if (type === 'CN') return <span className="w-3 h-3 bg-[#00C853] rounded-full flex items-center justify-center text-[8px] text-white ml-0.5">C</span>;
  if (type === 'EN') return <span className="w-3 h-3 bg-[#00B0FF] rounded-full flex items-center justify-center text-[8px] text-white ml-0.5">E</span>;
  return null;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  
  // Anti-spam states
  const [lastSentTimes, setLastSentTimes] = useState<number[]>([]);
  const [lastContent, setLastContent] = useState("");
  const [repeatCount, setRepeatCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    const now = Date.now();

    // 1. Frequency check (5 messages in 5 seconds)
    const recentMessages = lastSentTimes.filter(t => now - t < 5000);
    if (recentMessages.length >= 5) {
      showToast("操作太频繁，请稍后再试");
      return;
    }

    // 2. Repeat check (3 times same content)
    if (text === lastContent) {
      if (repeatCount >= 2) { // Already sent 3 times
        showToast("请勿重复发送相同内容");
        return;
      }
      setRepeatCount(prev => prev + 1);
    } else {
      setLastContent(text);
      setRepeatCount(0);
    }

    // Success: Create message
    const newMessage: Message = {
      id: now.toString(),
      type: 'user',
      sender: {
        name: '我',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
        isVip: true,
        flag: '🇨🇳'
      },
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };

    setMessages(prev => [...prev, newMessage]);
    setLastSentTimes(prev => [...prev, now]);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] font-sans text-[#333] max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-bottom border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <ChevronLeft className="w-6 h-6 text-gray-700 cursor-pointer" />
          <div>
            <h1 className="text-base font-bold leading-tight">HelloTalk 团队</h1>
            <p className="text-[11px] text-gray-400">群成员 (234)</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-gray-700" />
          <MoreHorizontal className="w-5 h-5 text-gray-700" />
        </div>
      </header>

      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      >
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            {msg.type === 'timestamp' && (
              <div className="text-center text-[11px] text-gray-400 my-2">
                {msg.content}
              </div>
            )}

            {msg.type === 'system' && msg.giftInfo && (
              <div className="bg-[#F0F2F5] rounded-2xl p-3 flex items-center gap-3 max-w-[85%] mx-auto">
                <img src={msg.giftInfo.image} alt="gift" className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-800">{msg.giftInfo.title}</h4>
                  <p className="text-[10px] text-gray-500 truncate">{msg.giftInfo.description}</p>
                </div>
              </div>
            )}

            {msg.type === 'user' && (
              <div className={`flex gap-2 ${msg.isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img 
                    src={msg.sender?.avatar} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full bg-white border border-gray-100" 
                    referrerPolicy="no-referrer"
                  />
                  {msg.sender?.flag && (
                    <span className="absolute -bottom-1 -left-1 text-[10px] bg-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm border border-gray-50">
                      {msg.sender.flag}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className={`flex flex-col max-w-[75%] ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                  {!msg.isSelf && (
                    <div className="flex items-center mb-1">
                      <span className="text-xs font-bold text-gray-700">{msg.sender?.name}</span>
                      {msg.sender?.isVip && <Badge type="VIP" />}
                      {msg.sender?.isVipPlus && <Badge type="VIP+" />}
                      {msg.sender?.badges?.map((b) => (
                        <React.Fragment key={b}>
                          <Badge type={b} />
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {msg.giftInfo ? (
                    <div className="bg-[#F0F2F5] rounded-2xl p-3 flex items-center gap-3 w-full">
                      <img src={msg.giftInfo.image} alt="gift" className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-800">{msg.giftInfo.title}</h4>
                        <p className="text-[10px] text-gray-500 truncate">{msg.giftInfo.description}</p>
                      </div>
                    </div>
                  ) : (
                    <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed break-words ${
                      msg.isSelf 
                        ? 'bg-[#00B0FF] text-white rounded-tr-none' 
                        : 'bg-[#F0F2F5] text-gray-800 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Scroll Down Button */}
      <button 
        onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
        className="absolute bottom-32 right-4 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ArrowDown className="w-4 h-4" />
      </button>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-100 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#F0F2F5] rounded-full px-4 py-2 flex items-center">
            <input 
              type="text" 
              placeholder="请输入..." 
              className="flex-1 bg-transparent outline-none text-sm"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <button className="p-2 text-gray-600">
            <Mic className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-between px-1">
          <button className="p-1 text-gray-500 hover:text-blue-500 transition-colors"><Plus className="w-6 h-6" /></button>
          <button className="p-1 text-gray-500 hover:text-blue-500 transition-colors"><ImageIcon className="w-6 h-6" /></button>
          <button className="p-1 text-gray-500 hover:text-blue-500 transition-colors"><Smile className="w-6 h-6" /></button>
          <button className="p-1 text-gray-500 hover:text-blue-500 transition-colors"><Gift className="w-6 h-6" /></button>
          <button className="p-1 text-gray-500 hover:text-blue-500 transition-colors"><Languages className="w-6 h-6" /></button>
          <button 
            onClick={handleSend}
            className={`p-1 transition-colors ${inputValue.trim() ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      </footer>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && <Toast message={toast} />}
      </AnimatePresence>
    </div>
  );
}
