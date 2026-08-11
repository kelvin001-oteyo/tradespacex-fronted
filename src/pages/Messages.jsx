import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Messages.css';
import api from '../services/api';
import {
  ArrowLeft,
  Send,
  Search,
  Paperclip,
  Image,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  User,
  Building,
  Clock,
  Check,
  CheckCheck,
  Star,
  Shield,
  Loader2,
  AlertCircle,
  X,
  Menu,
  Users,
  MessageCircle,
  Mail,
  PhoneCall,
  Calendar,
  FileText,
  Link as LinkIcon,
  Plus,
  Trash2,
  Archive,
  Pin,
  Reply,
  Copy,
  Flag,
  Ban,
  Volume2,
  VolumeX,
  Camera,
  Mic,
  SendHorizontal
} from 'lucide-react';

export default function Messages() {
  const { id } = useParams(); // Conversation ID from URL
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAttachments, setShowAttachments] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Fetch conversations on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [isAuthenticated]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (id) {
      fetchMessages(id);
      markAsRead(id);
    }
  }, [id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (id) {
        fetchMessages(id, true);
      }
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [id]);

  // Fetch conversations
  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // ✅ FIXED: Removed /api/ from endpoint
      const response = await api.get('/chat/conversations/');
      const data = response.data.results || response.data || [];
      setConversations(data);
      
      // If there's an ID param, find and set active conversation
      if (id) {
        const active = data.find(conv => conv.id === parseInt(id));
        if (active) {
          setActiveConversation(active);
        } else if (data.length > 0) {
          // If ID not found, redirect to first conversation
          navigate(`/messages/${data[0].id}`);
        }
      } else if (data.length > 0) {
        // If no ID, redirect to first conversation
        navigate(`/messages/${data[0].id}`);
      }
      
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
      
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId, silent = false) => {
    if (!silent) setLoadingMessages(true);
    
    try {
      // ✅ FIXED: Removed /api/ from endpoint
      const response = await api.get(`/chat/conversations/${conversationId}/messages/`);
      const data = response.data.results || response.data || [];
      setMessages(data);
      
      // Update conversation list with latest message
      if (data.length > 0) {
        const lastMessage = data[data.length - 1];
        setConversations(prev => 
          prev.map(conv => 
            conv.id === parseInt(conversationId) 
              ? { 
                  ...conv, 
                  last_message: lastMessage.content,
                  last_message_time: lastMessage.created_at,
                  unread_count: 0 
                }
              : conv
          )
        );
      }
      
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (!silent) setError('Failed to load messages');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Mark messages as read
  const markAsRead = async (conversationId) => {
    try {
      // ✅ FIXED: Removed /api/ from endpoint
      await api.post(`/chat/conversations/${conversationId}/read/`);
      setConversations(prev => 
        prev.map(conv => 
          conv.id === parseInt(conversationId) 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !id || sending) return;
    
    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    // Optimistically add message to UI
    const tempMessage = {
      id: Date.now(),
      content: messageContent,
      sender: user.id,
      created_at: new Date().toISOString(),
      is_sender: true,
      status: 'sending'
    };
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      // ✅ FIXED: Removed /api/ from endpoint
      const response = await api.post(`/chat/conversations/${id}/messages/`, {
        content: messageContent
      });
      
      // Replace temp message with real message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? response.data : msg
        )
      );
      
      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === parseInt(id) 
            ? { 
                ...conv, 
                last_message: messageContent,
                last_message_time: response.data.created_at 
              }
            : conv
        )
      );
      
    } catch (err) {
      console.error('Error sending message:', err);
      // Mark message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (e.target.value.length > 0 && !typing) {
      setTyping(true);
      // ✅ FIXED: Removed /api/ from endpoint
      api.post(`/chat/conversations/${id}/typing/`);
    }
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (msgDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (msgDate.getTime() === today.getTime() - 86400000) {
      return 'Yesterday';
    } else if (now - date < 604800000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Get conversation name
  const getConversationName = (conversation) => {
    if (!conversation) return '';
    if (conversation.name) return conversation.name;
    
    // If it's a direct chat with one other person
    const otherParticipant = conversation.participants?.find(p => p.id !== user.id);
    return otherParticipant?.full_name || otherParticipant?.username || 'Unknown';
  };

  // Get conversation avatar
  const getConversationAvatar = (conversation) => {
    if (!conversation) return '';
    if (conversation.avatar) return conversation.avatar;
    
    const otherParticipant = conversation.participants?.find(p => p.id !== user.id);
    return otherParticipant?.avatar || otherParticipant?.full_name?.charAt(0) || 'U';
  };

  // Get message status icon
  const getMessageStatus = (message) => {
    if (message.status === 'sending') {
      return <Clock className="w-3.5 h-3.5 text-slate-400 animate-spin" />;
    }
    if (message.status === 'failed') {
      return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    }
    if (message.is_sender) {
      return <CheckCheck className="w-3.5 h-3.5 text-primary-500" />;
    }
    return null;
  };

  // Get time display for message grouping
  const shouldShowTime = (index) => {
    if (index === 0) return true;
    const current = new Date(messages[index].created_at);
    const previous = new Date(messages[index - 1].created_at);
    return (current - previous) > 300000; // 5 minutes
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading conversations...</p>
          </div>
        </div>
      </>
    );
  }

  // Empty state
  if (!loading && conversations.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-3 mb-6">
              <Link to="/dashboard" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <h1 className="text-2xl font-bold text-ink">Messages</h1>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-ink mb-2">No conversations yet</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                Start exploring the marketplace and connect with suppliers or buyers to begin your conversations.
              </p>
              <Link 
                to="/marketplace" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <Search className="w-5 h-5" />
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const activeConversationData = conversations.find(c => c.id === parseInt(id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ====== MESSAGES LAYOUT ====== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-[calc(100vh-120px)] min-h-[500px]">
          
          <div className="flex h-full">
            
            {/* ====== SIDEBAR - Conversation List ====== */}
            <div className={`${showSidebar ? 'w-full sm:w-80' : 'hidden'} sm:block border-r border-slate-100 flex-shrink-0`}>
              
              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-ink">Messages</h2>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                      <Plus className="w-4 h-4 text-slate-500" />
                    </button>
                    <button 
                      onClick={() => setShowSidebar(false)}
                      className="sm:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Conversation List */}
              <div className="overflow-y-auto h-[calc(100%-80px)]">
                {conversations
                  .filter(conv => {
                    const name = getConversationName(conv).toLowerCase();
                    const lastMsg = conv.last_message?.toLowerCase() || '';
                    return name.includes(searchQuery.toLowerCase()) || lastMsg.includes(searchQuery.toLowerCase());
                  })
                  .map((conversation) => {
                    const isActive = conversation.id === parseInt(id);
                    const name = getConversationName(conversation);
                    const avatar = getConversationAvatar(conversation);
                    const otherParticipant = conversation.participants?.find(p => p.id !== user.id);
                    const isOnline = isUserOnline(otherParticipant?.id);
                    
                    return (
                      <Link
                        key={conversation.id}
                        to={`/messages/${conversation.id}`}
                        className={`block p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                          isActive ? 'bg-primary-50' : ''
                        }`}
                        onClick={() => {
                          setShowSidebar(false);
                          setActiveConversation(conversation);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                              {typeof avatar === 'string' && avatar.length === 1 ? avatar : 'U'}
                            </div>
                            {isOnline && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                            )}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-ink truncate">{name}</p>
                              {conversation.last_message_time && (
                                <span className="text-xs text-slate-400 flex-shrink-0">
                                  {formatDate(conversation.last_message_time)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-slate-500 truncate">
                                {conversation.last_message || 'Start a conversation'}
                              </p>
                              {conversation.unread_count > 0 && (
                                <span className="w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                                  {conversation.unread_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
            
            {/* ====== CHAT AREA ====== */}
            {id && activeConversationData ? (
              <div className="flex-1 flex flex-col min-w-0">
                
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile back button */}
                    <button 
                      onClick={() => setShowSidebar(true)}
                      className="sm:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Menu className="w-5 h-5 text-slate-500" />
                    </button>
                    
                    <Link 
                      to={`/suppliers/${activeConversationData.participants?.find(p => p.id !== user.id)?.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                          {getConversationAvatar(activeConversationData).charAt(0) || 'U'}
                        </div>
                        {isUserOnline(activeConversationData.participants?.find(p => p.id !== user.id)?.id) && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink group-hover:text-primary-600 transition-colors truncate">
                          {getConversationName(activeConversationData)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {isUserOnline(activeConversationData.participants?.find(p => p.id !== user.id)?.id) 
                            ? 'Online' 
                            : 'Offline'}
                        </p>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                      <Phone className="w-4 h-4 text-slate-500" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                      <Video className="w-4 h-4 text-slate-500" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                      <Info className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
                
                {/* Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50/30 to-white"
                >
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="w-16 h-16 text-slate-300 mb-4" />
                      <p className="text-slate-500 font-medium">No messages yet</p>
                      <p className="text-sm text-slate-400">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isSender = message.sender === user.id || message.is_sender;
                      const showTime = shouldShowTime(index);
                      
                      return (
                        <div key={message.id || index}>
                          {showTime && (
                            <div className="flex justify-center my-3">
                              <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                {formatDate(message.created_at)}
                              </span>
                            </div>
                          )}
                          
                          <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} group`}>
                            <div className={`max-w-[85%] sm:max-w-[70%] ${isSender ? 'order-2' : 'order-1'}`}>
                              <div className={`relative rounded-2xl px-4 py-2.5 ${
                                isSender 
                                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white' 
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                <p className="text-sm break-words whitespace-pre-wrap">
                                  {message.content}
                                </p>
                                
                                {/* Message Status */}
                                <div className={`flex items-center gap-1 mt-0.5 ${isSender ? 'justify-end' : 'justify-start'}`}>
                                  <span className={`text-[10px] ${isSender ? 'text-white/70' : 'text-slate-400'}`}>
                                    {formatTime(message.created_at)}
                                  </span>
                                  {isSender && (
                                    <span className="ml-1">
                                      {getMessageStatus(message)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Reply/React Actions (hover) */}
                              {!isSender && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 ml-2">
                                  <button className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                                    <Reply className="w-3 h-3 text-slate-400" />
                                  </button>
                                  <button className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="px-4 py-2">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span>typing...</span>
                    </div>
                  </div>
                )}
                
                {/* Message Input */}
                <div className="border-t border-slate-100 p-4 bg-white">
                  <form onSubmit={sendMessage} className="flex items-end gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Paperclip className="w-5 h-5 text-slate-500" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                      <button
                        type="button"
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Smile className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>
                    
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        rows="1"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e);
                          }
                        }}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="p-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-ink mb-2">Your Messages</h3>
                <p className="text-slate-500 max-w-sm">
                  Select a conversation from the sidebar to start messaging.
                  {conversations.length === 0 && ' Connect with suppliers or buyers to begin.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
