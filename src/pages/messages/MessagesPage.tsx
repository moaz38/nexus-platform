import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Send, Phone, Video, MessageCircle, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Sound file
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { id: targetUserId } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio(NOTIFICATION_SOUND));

  // --- 1. FETCH SIDEBAR ---
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
          const data = await res.json();
          setConversations(data);
      }
    } catch (error) { console.error(error); } 
    finally { setLoadingChats(false); }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. AUTO OPEN CHAT ---
  useEffect(() => {
    const initChat = async () => {
      if (!targetUserId) return;
      const existing = conversations.find(c => c._id === targetUserId);
      if (existing) {
        setCurrentChat(existing);
      } else {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5001/api/users/${targetUserId}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            const newChatObj = {
              _id: userData._id,
              name: userData.name,
              avatarUrl: userData.avatarUrl,
              lastMessage: 'Start conversation...',
              isOnline: true
            };
            setCurrentChat(newChatObj);
            setConversations(prev => {
                if (prev.find(c => c._id === newChatObj._id)) return prev;
                return [newChatObj, ...prev];
            });
          }
        } catch (error) {}
      }
    };
    initChat();
  }, [targetUserId, conversations.length]);

  // --- 3. FETCH MESSAGES ---
  useEffect(() => {
    if (!currentChat) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5001/api/chat/${currentChat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setMessages(prev => {
                if (data.length > prev.length && prev.length > 0) {
                    const lastMsg = data[data.length - 1];
                    // @ts-ignore
                    if (lastMsg.senderId !== (user?.id || user?._id)) {
                        audioRef.current.play().catch(e => console.log("Audio blocked"));
                    }
                }
                return data;
            });
        }
      } catch (error) {}
    };

    fetchMessages();
    scrollToBottom();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [currentChat]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // --- 4. SEND MESSAGE (🔥 MATCHING BACKEND ROUTE) ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat || !user) return;

    const msgContent = newMessage;
    setNewMessage(''); 

    // @ts-ignore
    const senderId = user._id || user.id;

    const tempMsg = {
        _id: Date.now().toString(),
        senderId: senderId,
        content: msgContent,
        createdAt: new Date().toISOString(),
        isRead: false
    };
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();

    try {
      const token = localStorage.getItem('token');
      
      // ✅ Using '/api/chat/send' to match the backend we just fixed
      const res = await fetch('http://localhost:5001/api/chat/send', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
            receiverId: currentChat._id, 
            content: msgContent 
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      
      fetchConversations(); 

    } catch (error: any) {
      toast.error("Send Failed: " + error.message);
      // Remove failed message
      setMessages(prev => prev.filter(m => m._id !== tempMsg._id));
      setNewMessage(msgContent); 
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex bg-white overflow-hidden animate-fade-in">
      
      {/* SIDEBAR */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-gray-50 ${currentChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 bg-white shadow-sm z-10">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          <div className="mt-4 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg outline-none text-sm"/>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            {loadingChats ? (
                <div className="p-4 text-center text-gray-400">Loading...</div>
            ) : conversations.length > 0 ? (
                conversations.map((chat) => (
                    <div key={chat._id} onClick={() => { setCurrentChat(chat); navigate(`/chat/${chat._id}`); }}
                        className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition border-l-4 ${currentChat?._id === chat._id ? 'bg-white border-indigo-600' : 'border-transparent'}`}
                    >
                        <Avatar src={chat.avatarUrl} alt={chat.name} size="md" status="online" />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{chat.name}</h4>
                            <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center p-8 text-gray-400 mt-10"><MessageCircle size={32} className="mx-auto mb-2 opacity-50"/><p>No chats yet.</p></div>
            )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className={`flex-1 flex flex-col bg-white ${!currentChat ? 'hidden md:flex' : 'flex'}`}>
        {currentChat ? (
            <>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10 bg-white">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setCurrentChat(null); navigate('/chat'); }} className="md:hidden p-2 text-gray-600"><ArrowLeft size={20} /></button>
                        <Avatar src={currentChat.avatarUrl} alt={currentChat.name} size="md" />
                        <div>
                            <h3 className="font-bold text-gray-900">{currentChat.name}</h3>
                            <span className="text-xs text-green-500 font-medium">● Active Now</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg, idx) => {
                        // @ts-ignore
                        const isMe = msg.senderId === (user?.id || user?._id);
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                                    <p>{msg.content}</p>
                                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        {isMe && <Check size={12} className="opacity-70"/>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
                        <input type="text" className="flex-1 bg-gray-100 rounded-full px-6 py-3.5 outline-none" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                        <button type="submit" disabled={!newMessage.trim()} className="bg-indigo-600 text-white p-3.5 rounded-full shadow-lg"><Send size={20} /></button>
                    </form>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <MessageCircle size={80} className="mb-4 opacity-20" /><p>Select a chat to start messaging.</p>
            </div>
        )}
      </div>
    </div>
  );
};