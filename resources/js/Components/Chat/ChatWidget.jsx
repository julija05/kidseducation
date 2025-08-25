import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/Contexts/ChatContext';
import { 
    MessageCircle, 
    X, 
    Send, 
    User, 
    Clock,
    CheckCircle,
    AlertCircle,
    Minimize2
} from 'lucide-react';

export default function ChatWidget() {
    const {
        conversation,
        messages,
        unreadCount,
        hasNewAdminMessage,
        showToast,
        toastMessage,
        isInitialized,
        initChat,
        sendMessage: sendChatMessage,
        clearNotifications,
        setShowToast,
        formatMessageTime,
        setChatOpen
    } = useChat();
    
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [visitorInfo, setVisitorInfo] = useState({ name: '', email: '' });
    const [showVisitorForm, setShowVisitorForm] = useState(false);
    const [emailError, setEmailError] = useState('');
    const messagesEndRef = useRef(null);


    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
            });
        }
    };

    const validateEmail = (email) => {
        if (!email) return true; // Email is optional, so empty is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setVisitorInfo(prev => ({ ...prev, email }));
        
        // Validate email on change
        if (email && !validateEmail(email)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            // Use setTimeout to ensure DOM has updated before scrolling
            setTimeout(() => scrollToBottom(), 50);
        }
    }, [messages]);

    useEffect(() => {
        // Only scroll to bottom when chat is opened and has messages
        if (isOpen && messages.length > 0) {
            setTimeout(() => scrollToBottom(), 200);
        }
    }, [isOpen, messages.length]);

    // Sync chat open state with context
    useEffect(() => {
        setChatOpen(isOpen);
    }, [isOpen, setChatOpen]);
    
    // Show visitor form for new conversations when chat opens
    useEffect(() => {
        if (isOpen && !conversation && !window.Laravel?.user && isInitialized) {
            setShowVisitorForm(true);
        }
    }, [isOpen, conversation, isInitialized]);
    
    // Listen for global open chat events
    useEffect(() => {
        const handleOpenChat = () => {
            setIsOpen(true);
            setChatOpen(true);
            setIsMinimized(false);
            if (messages.length > 0) {
                setTimeout(() => scrollToBottom(), 300);
            }
        };
        
        window.addEventListener('openChat', handleOpenChat);
        return () => window.removeEventListener('openChat', handleOpenChat);
    }, [messages.length, setChatOpen]);



    const requestNotificationPermission = () => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Validate email if provided
        if (showVisitorForm && visitorInfo.email && !validateEmail(visitorInfo.email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        try {
            setIsLoading(true);
            
            const messageText = newMessage.trim();
            const currentVisitorInfo = showVisitorForm ? visitorInfo : null;
            
            await sendChatMessage(messageText, currentVisitorInfo);
            
            setNewMessage('');
            setShowVisitorForm(false);
            setEmailError(''); // Clear any email errors on successful send
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const closeChat = () => {
        setIsOpen(false);
        setChatOpen(false);
        setIsMinimized(false);
    };


    const minimizeChat = () => {
        setIsMinimized(true);
        setIsOpen(false);
        setChatOpen(false);
    };


    const getStatusDisplay = () => {
        if (!conversation) return 'Connecting...';
        
        switch (conversation.status) {
            case 'waiting':
                return 'Waiting for support...';
            case 'active':
                return 'Connected with support';
            case 'closed':
                return 'Chat ended';
            default:
                return 'Online';
        }
    };

    return (
        <>
            {/* Chat Widget Button */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
            >
                {!isOpen && (
                    <motion.button
                        onClick={() => {
                            clearNotifications();
                            if (!isOpen) {
                                setIsOpen(true);
                                setChatOpen(true);
                                setIsMinimized(false);
                                // Request notification permission when first opening chat
                                requestNotificationPermission();
                                // Scroll to bottom when opening chat if there are messages
                                if (messages.length > 0) {
                                    setTimeout(() => scrollToBottom(), 300);
                                }
                            }
                        }}
                        className="relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 min-h-[64px] min-w-[64px] flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <MessageCircle className="w-6 h-6" />
                        
                        {/* Unread count badge */}
                        {unreadCount > 0 && (
                            <motion.span
                                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-lg border-2 border-white"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </motion.span>
                        )}

                        {/* Pulse animation for new messages */}
                        {hasNewAdminMessage && (
                            <>
                                <motion.div
                                    className="absolute inset-0 rounded-full border-4 border-yellow-400"
                                    animate={{ 
                                        scale: [1, 1.4, 1],
                                        opacity: [0.8, 0, 0.8]
                                    }}
                                    transition={{ 
                                        duration: 1.2, 
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-yellow-400/20"
                                    animate={{ 
                                        scale: [1, 1.6, 1],
                                        opacity: [0.5, 0, 0.5]
                                    }}
                                    transition={{ 
                                        duration: 1.8, 
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 0.3
                                    }}
                                />
                            </>
                        )}
                    </motion.button>
                )}
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-x-2 bottom-2 top-16 sm:bottom-6 sm:right-6 sm:top-auto sm:left-auto sm:inset-x-auto sm:w-96 sm:h-[500px] bg-white rounded-lg sm:rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-lg truncate">Live Support</h3>
                                    <p className="text-sm opacity-90 truncate">{getStatusDisplay()}</p>
                                </div>
                                {/* Unread count in header */}
                                {unreadCount > 0 && (
                                    <motion.span
                                        className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    >
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </motion.span>
                                )}
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button
                                    onClick={minimizeChat}
                                    className="p-3 hover:bg-white/20 rounded-lg transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                                    aria-label="Minimize chat"
                                >
                                    <Minimize2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={closeChat}
                                    className="p-3 hover:bg-white/20 rounded-lg transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
                                    aria-label="Close chat"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {isLoading && messages.length === 0 ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8 px-4">
                                    <MessageCircle className="mx-auto mb-4 text-gray-400 w-12 h-12" />
                                    <p className="mb-2 text-base font-medium">Welcome to Abacoding Support!</p>
                                    <p className="text-sm">Send us a message and we'll help you right away.</p>
                                </div>
                            ) : (
                                messages.map((message, index) => (
                                    <motion.div
                                        key={message.id || index}
                                        className={`flex ${message.sender_type === 'admin' ? 'justify-start' : 'justify-end'}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className={`max-w-[85%] ${
                                            message.sender_type === 'admin'
                                                ? 'bg-gray-100 text-gray-800'
                                                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                        } rounded-2xl px-4 py-3`}>
                                            {message.sender_type === 'admin' && (
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <User className="w-3 h-3" />
                                                    <span className="text-xs font-medium">
                                                        {message.sender?.name || 'Support'}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-sm leading-relaxed break-words">{message.message}</p>
                                            <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                                                message.sender_type === 'admin' ? 'text-gray-500' : 'text-white/70'
                                            }`}>
                                                <Clock className="w-2.5 h-2.5" />
                                                <span className="text-xs">{formatMessageTime(message.created_at)}</span>
                                                {message.sender_type !== 'admin' && (
                                                    <CheckCircle className="w-2.5 h-2.5 ml-1" />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Visitor Info Form */}
                        {showVisitorForm && (
                            <div className="border-t p-4 bg-gray-50">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            value={visitorInfo.name}
                                            onChange={(e) => setVisitorInfo(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base min-h-[48px]"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email (Optional)
                                        </label>
                                        <input
                                            type="email"
                                            value={visitorInfo.email}
                                            onChange={handleEmailChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base min-h-[48px] ${
                                                emailError ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="your@email.com"
                                        />
                                        {emailError && (
                                            <div className="mt-2 flex items-center text-red-600 text-sm">
                                                <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                                                <span>{emailError}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Message Input */}
                        <div className="border-t p-4 bg-white">
                            <form onSubmit={sendMessage} className="flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onFocus={() => {
                        if (isOpen) {
                            clearNotifications();
                        }
                    }}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base min-h-[48px]"
                                    placeholder="Type your message..."
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !newMessage.trim() || (showVisitorForm && !visitorInfo.name.trim())}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all duration-200 min-h-[48px] min-w-[48px] flex items-center justify-center flex-shrink-0"
                                    aria-label="Send message"
                                >
                                    {isLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </>
    );
}