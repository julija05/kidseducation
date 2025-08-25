import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from '@/config/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    Users,
    Clock,
    Send,
    User,
    CheckCircle,
    AlertCircle,
    X,
    RefreshCw,
    Phone,
    Mail,
    UserX,
    Archive,
    ChevronDown,
    ArrowLeft,
    Trash2
} from 'lucide-react';

export default function AdminChatIndex({ auth, conversations: initialConversations, waitingCount, activeCount, totalUnreadCount }) {
    const [conversations, setConversations] = useState(initialConversations.data || []);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [showMobileChat, setShowMobileChat] = useState(false);
    const [stats, setStats] = useState({
        waiting_conversations: waitingCount,
        active_conversations: activeCount,
        unread_messages: totalUnreadCount
    });
    const [previousStats, setPreviousStats] = useState({
        waiting_conversations: waitingCount,
        active_conversations: activeCount,
        unread_messages: totalUnreadCount
    });
    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);
    const isTypingRef = useRef(false);
    const typingTimeoutRef = useRef(null);
    const conversationListRef = useRef(null);
    const lastSelectionTimeRef = useRef(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Only auto-scroll to bottom when new messages arrive, not when manually scrolling
    useEffect(() => {
        if (messages.length > 0) {
            // Only auto-scroll if user hasn't manually scrolled up
            const messagesContainer = messagesEndRef.current?.parentElement;
            if (messagesContainer) {
                const isAtBottom = messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight - 10;
                if (isAtBottom) {
                    scrollToBottom();
                }
            }
        }
    }, [messages]);

    // Auto-refresh conversations and messages
    useEffect(() => {
        const interval = setInterval(() => {
            // Store current focus state
            const wasInputFocused = document.activeElement === messageInputRef.current;
            
            // Only refresh if user is not actively typing
            if (!isTypingRef.current) {
                // Always refresh stats (lightweight)
                loadStats();
                
                // Only refresh conversations if not actively interacting with one
                const isInteractingWithConversation = wasInputFocused || 
                    (selectedConversation && Date.now() - lastSelectionTimeRef.current < 10000); // Increased to 10 seconds
                
                if (!isInteractingWithConversation) {
                    loadConversations();
                }
                
                // Always refresh messages for selected conversation (to get new incoming messages)
                if (selectedConversation) {
                    loadMessages(selectedConversation.id);
                }
                
                // Restore focus if input was focused before refresh
                if (wasInputFocused && messageInputRef.current) {
                    setTimeout(() => {
                        messageInputRef.current.focus();
                    }, 0);
                }
            }
        }, 5000); // Increased interval to 5 seconds

        return () => clearInterval(interval);
    }, [selectedConversation, filter]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    const loadConversations = async () => {
        try {
            const response = await axios.get('/admin/chat/conversations', {
                params: { status: filter }
            });
            
            const newConversations = response.data.conversations;
            
            // Simple comparison - only update if there are actual meaningful changes
            setConversations(prev => {
                // If no conversations exist yet, just set them
                if (prev.length === 0) {
                    return newConversations;
                }
                
                // If length changed, update
                if (prev.length !== newConversations.length) {
                    return newConversations;
                }
                
                // Check if any conversation ID, status, or unread count changed
                const hasImportantChanges = prev.some((oldConv, index) => {
                    const newConv = newConversations[index];
                    return !newConv || 
                           oldConv.id !== newConv.id ||
                           oldConv.status !== newConv.status ||
                           oldConv.unread_count !== newConv.unread_count;
                });
                
                // Only update if there are important changes
                if (hasImportantChanges) {
                    return newConversations;
                }
                
                return prev;
            });
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    };

    const loadMessages = async (conversationId) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/admin/chat/conversations/${conversationId}/messages`);
            
            // Only update if messages actually changed
            const newMessages = response.data.messages;
            setMessages(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(newMessages)) {
                    // If this is a new conversation selection, scroll to bottom
                    setTimeout(() => scrollToBottom(), 100);
                    return newMessages;
                }
                return prev;
            });
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await axios.get('/admin/chat/stats');
            const newStats = response.data;
            
            // Check for new waiting conversations or unread messages
            if (newStats.waiting_conversations > previousStats.waiting_conversations) {
                playNotificationSound();
                showBrowserNotification('New Chat Request', 'A visitor is waiting for support');
            }
            
            if (newStats.unread_messages > previousStats.unread_messages) {
                playNotificationSound();
                showBrowserNotification('New Chat Message', 'You have new unread messages');
            }
            
            setPreviousStats(stats);
            setStats(newStats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const playNotificationSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Audio not supported');
        }
    };

    const showBrowserNotification = (title, body) => {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                tag: 'admin-chat'
            });
        } else if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    };

    const takeConversation = async (conversationId) => {
        try {
            await axios.post(`/admin/chat/conversations/${conversationId}/take`);
            loadConversations();
            loadStats();
            
            // Auto-select the conversation
            const conversation = conversations.find(c => c.id === conversationId);
            if (conversation) {
                setSelectedConversation(conversation);
                loadMessages(conversationId);
                lastSelectionTimeRef.current = Date.now();
            }
        } catch (error) {
            console.error('Failed to take conversation:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            setIsLoading(true);
            isTypingRef.current = false; // Reset typing state
            
            const response = await axios.post('/admin/chat/send', {
                conversation_id: selectedConversation.id,
                message: newMessage.trim()
            });

            setMessages(prev => [...prev, response.data.message]);
            setNewMessage('');
            loadConversations();
            
            // Keep focus on input after sending
            setTimeout(() => {
                if (messageInputRef.current) {
                    messageInputRef.current.focus();
                }
            }, 0);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const closeConversation = async (conversationId) => {
        try {
            await axios.post(`/admin/chat/conversations/${conversationId}/close`);
            loadConversations();
            loadStats();
            
            if (selectedConversation?.id === conversationId) {
                setSelectedConversation(null);
                setMessages([]);
            }
        } catch (error) {
            console.error('Failed to close conversation:', error);
        }
    };

    const deleteConversation = async (conversationId) => {
        if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`/admin/chat/conversations/${conversationId}`);
            loadConversations();
            loadStats();
            
            // If the deleted conversation was selected, clear the selection
            if (selectedConversation?.id === conversationId) {
                setSelectedConversation(null);
                setMessages([]);
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            alert('Failed to delete conversation. Please try again.');
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const getStatusBadge = (status) => {
        const badges = {
            waiting: 'bg-yellow-100 text-yellow-800',
            active: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800'
        };
        return badges[status] || badges.waiting;
    };

    const getVisitorName = (conversation) => {
        if (conversation.user) {
            return conversation.user.name;
        }
        return conversation.visitor_name || 'Anonymous Visitor';
    };

    return (
        <div style={{ height: '100vh' }} className="flex flex-col">
            <Head title="Chat Support - Admin" />
            
            {/* Header */}
            <div className="flex-shrink-0 bg-white shadow-sm px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium">Back to Dashboard</span>
                        </Link>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Live Chat Support
                        </h2>
                    </div>
                    <button
                        onClick={() => {
                            loadConversations();
                            loadStats();
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="flex-shrink-0 px-4 md:px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <motion.div
                        className="bg-white rounded-xl shadow-sm border p-4 md:p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm font-medium text-gray-600">Waiting</p>
                                <p className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.waiting_conversations || 0}</p>
                            </div>
                            <Clock className="text-yellow-500" size={24} />
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-xl shadow-sm border p-4 md:p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.active_conversations || 0}</p>
                            </div>
                            <MessageCircle className="text-green-500" size={24} />
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-xl shadow-sm border p-4 md:p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm font-medium text-gray-600">Unread</p>
                                <p className="text-2xl md:text-3xl font-bold text-red-600">{stats.unread_messages || 0}</p>
                            </div>
                            <AlertCircle className="text-red-500" size={24} />
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-xl shadow-sm border p-4 md:p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm font-medium text-gray-600">Total</p>
                                <p className="text-2xl md:text-3xl font-bold text-blue-600">{stats.total_conversations || 0}</p>
                            </div>
                            <Users className="text-blue-500" size={24} />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className="flex-1 mx-4 md:mx-6 mb-6 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col min-h-0">
                <div className="flex h-full relative">
                    {/* Conversations List */}
                    <div className={`${showMobileChat ? 'hidden' : 'flex'} md:flex w-full md:w-1/3 border-r border-gray-200 flex-col h-full`}>
                        {/* Filter Tabs */}
                        <div className="border-b border-gray-200 p-4 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-wrap gap-1">
                                    {[
                                        { key: 'all', label: 'All' },
                                        { key: 'waiting', label: 'Waiting' },
                                        { key: 'active', label: 'Active' },
                                        { key: 'assigned', label: 'My Chats' },
                                        { key: 'closed', label: 'Closed' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setFilter(tab.key)}
                                            className={`px-2 md:px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                                                filter === tab.key
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        loadConversations();
                                        loadStats();
                                    }}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Refresh conversations"
                                >
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Conversations */}
                        <div 
                            ref={conversationListRef} 
                            className="flex-1 overflow-y-auto min-h-0"
                        >
                            {conversations.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
                                    <p>No conversations found</p>
                                </div>
                            ) : (
                                conversations.map((conversation) => (
                                    <div
                                        key={`conversation-${conversation.id}`}
                                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                                            selectedConversation?.id === conversation.id
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => {
                                            // Only update if selecting a different conversation
                                            if (selectedConversation?.id !== conversation.id) {
                                                setSelectedConversation(conversation);
                                                loadMessages(conversation.id);
                                                lastSelectionTimeRef.current = Date.now();
                                                // On mobile, show chat view
                                                setShowMobileChat(true);
                                            }
                                        }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User size={16} className="text-gray-400" />
                                                    <h3 className="font-medium text-gray-900">
                                                        {getVisitorName(conversation)}
                                                    </h3>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(conversation.status)}`}>
                                                        {conversation.status}
                                                    </span>
                                                </div>
                                                
                                                {conversation.visitor_email && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                        <Mail size={12} />
                                                        {conversation.visitor_email}
                                                    </div>
                                                )}
                                                
                                                <p className="text-sm text-gray-600 truncate">
                                                    {conversation.initial_message || 'No message preview'}
                                                </p>
                                                
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatTime(conversation.last_activity_at)}
                                                </p>
                                            </div>
                                            
                                            <div className="flex flex-col items-end gap-2">
                                                {conversation.unread_count > 0 && (
                                                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                        {conversation.unread_count}
                                                    </span>
                                                )}
                                                
                                                {conversation.status === 'waiting' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            takeConversation(conversation.id);
                                                        }}
                                                        className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded transition-colors"
                                                    >
                                                        Take
                                                    </button>
                                                )}
                                                
                                                {conversation.status === 'closed' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteConversation(conversation.id);
                                                        }}
                                                        className="bg-red-500 hover:bg-red-600 text-white text-xs p-1 rounded transition-colors"
                                                        title="Delete conversation"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`${!showMobileChat ? 'hidden' : 'flex'} md:flex flex-1 flex-col h-full min-w-0`}>
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-gray-50 flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        {/* Mobile Back Button */}
                                        <button
                                            onClick={() => setShowMobileChat(false)}
                                            className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {getVisitorName(selectedConversation)}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {selectedConversation.status === 'active' ? 'Active conversation' : 'Waiting for response'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {selectedConversation.status === 'active' && (
                                            <button
                                                onClick={() => closeConversation(selectedConversation.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                                            >
                                                <Archive size={14} />
                                                Close
                                            </button>
                                        )}
                                        {selectedConversation.status === 'closed' && (
                                            <button
                                                onClick={() => deleteConversation(selectedConversation.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 relative min-h-0">
                                    <div 
                                        className="h-full overflow-y-auto p-4 space-y-4"
                                    >
                                        {isLoading && messages.length === 0 ? (
                                            <div className="flex justify-center items-center h-full">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            </div>
                                        ) : (
                                            messages.map((message, index) => (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[80%] ${
                                                        message.sender_type === 'admin'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-800'
                                                    } rounded-2xl px-4 py-2`}>
                                                        {message.sender_type !== 'admin' && (
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <User size={12} />
                                                                <span className="text-xs font-medium">
                                                                    {getVisitorName(selectedConversation)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <p className="text-sm leading-relaxed">{message.message}</p>
                                                        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                                                            message.sender_type === 'admin' ? 'text-blue-200' : 'text-gray-500'
                                                        }`}>
                                                            <Clock size={10} />
                                                            <span>{formatTime(message.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    
                                    {/* Scroll to bottom button */}
                                    <button
                                        onClick={scrollToBottom}
                                        className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                                        title="Scroll to bottom"
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                </div>

                                {/* Message Input */}
                                {selectedConversation.status === 'active' && (
                                    <div className="border-t border-gray-200 p-4 flex-shrink-0">
                                        <form onSubmit={sendMessage} className="flex gap-2">
                                            <input
                                                ref={messageInputRef}
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => {
                                                    setNewMessage(e.target.value);
                                                    
                                                    // Set typing state and clear any existing timeout
                                                    isTypingRef.current = true;
                                                    clearTimeout(typingTimeoutRef.current);
                                                    
                                                    // Clear typing state after 2 seconds of inactivity
                                                    typingTimeoutRef.current = setTimeout(() => {
                                                        isTypingRef.current = false;
                                                    }, 2000);
                                                }}
                                                onFocus={() => isTypingRef.current = true}
                                                onBlur={() => {
                                                    isTypingRef.current = false;
                                                    clearTimeout(typingTimeoutRef.current);
                                                }}
                                                onKeyDown={() => {
                                                    isTypingRef.current = true;
                                                    clearTimeout(typingTimeoutRef.current);
                                                    
                                                    // Clear typing state after 2 seconds of inactivity
                                                    typingTimeoutRef.current = setTimeout(() => {
                                                        isTypingRef.current = false;
                                                    }, 2000);
                                                }}
                                                disabled={isLoading}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                placeholder="Type your message..."
                                            />
                                            <button
                                                type="submit"
                                                disabled={isLoading || !newMessage.trim()}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition-colors"
                                            >
                                                {isLoading ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                ) : (
                                                    <Send size={16} />
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <MessageCircle size={64} className="mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                                    <p>Choose a conversation from the list to start chatting</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}