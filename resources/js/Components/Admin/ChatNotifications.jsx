import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from '@/config/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageCircle, 
    Bell, 
    Users, 
    Clock,
    ExternalLink,
    Volume2,
    VolumeX
} from 'lucide-react';

export default function ChatNotifications({ 
    initialUnreadCount = 0, 
    className = "",
    showText = false 
}) {
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [waitingCount, setWaitingCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [recentConversations, setRecentConversations] = useState([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [hasNewMessage, setHasNewMessage] = useState(false);

    // Poll for new chat notifications every 2 seconds for immediate alerts
    useEffect(() => {
        // Initial fetch
        fetchChatStats();
        
        const interval = setInterval(() => {
            fetchChatStats();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Play notification sound for new messages
    useEffect(() => {
        if (hasNewMessage && soundEnabled) {
            // Create a simple notification sound
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

            setHasNewMessage(false);
        }
    }, [hasNewMessage, soundEnabled]);

    const fetchChatStats = async () => {
        try {
            const response = await axios.get('/admin/chat/stats');
            const newUnreadCount = response.data.unread_messages || 0;
            const newWaitingCount = response.data.waiting_conversations || 0;
            
            // Check if there are new unread messages
            if (newUnreadCount > unreadCount) {
                setHasNewMessage(true);
                
                // Show browser notification if permission granted
                if (Notification.permission === 'granted') {
                    new Notification('New Chat Message', {
                        body: `You have ${newUnreadCount} unread chat messages`,
                        icon: '/favicon.ico',
                        tag: 'chat-unread'
                    });
                }
            }
            
            // Check if there are new waiting conversations (PRIORITY ALERT)
            if (newWaitingCount > waitingCount) {
                setHasNewMessage(true);
                
                // Show browser notification for waiting conversations
                if (Notification.permission === 'granted') {
                    new Notification('🚨 URGENT: New Live Chat Request!', {
                        body: `${newWaitingCount} visitor${newWaitingCount > 1 ? 's' : ''} waiting for support - Immediate response needed!`,
                        icon: '/favicon.ico',
                        tag: 'chat-urgent',
                        requireInteraction: true // Keep notification visible until user interacts
                    });
                }
                
                // Play urgent sound for new waiting conversations
                playUrgentNotificationSound();
            }
            
            setUnreadCount(newUnreadCount);
            setWaitingCount(newWaitingCount);
        } catch (error) {
            console.error('Failed to fetch chat stats:', error);
        }
    };

    const fetchRecentConversations = async () => {
        try {
            const response = await axios.get('/admin/chat/conversations?status=all');
            setRecentConversations(response.data.conversations.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        }
    };

    const handleDropdownToggle = () => {
        if (!showDropdown) {
            fetchRecentConversations();
            // Clear new message indicator when opening dropdown
            setHasNewMessage(false);
        }
        setShowDropdown(!showDropdown);
    };

    const playUrgentNotificationSound = () => {
        try {
            // Create a more urgent/attention-grabbing sound for waiting conversations
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Play a series of urgent beeps
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    // Higher frequency for urgent sound
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                }, i * 300); // 300ms between beeps
            }
        } catch (error) {
            console.log('Audio not supported');
        }
    };

    const requestNotificationPermission = () => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getVisitorName = (conversation) => {
        if (conversation.user) {
            return conversation.user.name;
        }
        return conversation.visitor_name || 'Anonymous Visitor';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'waiting':
                return 'text-yellow-600 bg-yellow-100';
            case 'active':
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const totalNotifications = unreadCount + waitingCount;

    return (
        <div className={`relative ${className}`}>
            {/* Notification Button */}
            <motion.button
                onClick={handleDropdownToggle}
                className={`relative p-2 rounded-lg transition-all duration-200 ${
                    waitingCount > 0
                        ? 'text-red-600 bg-red-100 hover:bg-red-200 shadow-lg' 
                        : totalNotifications > 0 
                        ? 'text-purple-600 bg-purple-100 hover:bg-purple-200' 
                        : 'text-gray-600 hover:bg-gray-100'
                } ${showText ? 'px-4 flex items-center gap-2' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <MessageCircle size={20} />
                {showText && <span className="font-medium">Live Chat</span>}
                
                {/* Notification Badge */}
                <AnimatePresence>
                    {totalNotifications > 0 && (
                        <motion.span
                            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                            {totalNotifications > 9 ? '9+' : totalNotifications}
                        </motion.span>
                    )}
                </AnimatePresence>

                {/* Pulse animation for notifications */}
                {totalNotifications > 0 && (
                    <motion.div
                        className={`absolute inset-0 rounded-lg border-2 ${
                            waitingCount > 0 
                                ? 'border-red-400' 
                                : 'border-purple-400'
                        }`}
                        animate={{ 
                            scale: [1, waitingCount > 0 ? 1.3 : 1.2, 1],
                            opacity: [0.7, 0, 0.7]
                        }}
                        transition={{ 
                            duration: waitingCount > 0 ? 1 : 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                )}
                
                {/* Additional urgent animation for waiting conversations */}
                {waitingCount > 0 && (
                    <motion.div
                        className="absolute inset-0 rounded-lg bg-red-400"
                        animate={{ 
                            scale: [1, 1.4, 1],
                            opacity: [0.3, 0, 0.3]
                        }}
                        transition={{ 
                            duration: 0.8, 
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.2
                        }}
                    />
                )}
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">Live Chat</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSoundEnabled(!soundEnabled)}
                                        className="p-1 rounded hover:bg-white/50 transition-colors"
                                        title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
                                    >
                                        {soundEnabled ? (
                                            <Volume2 size={16} className="text-gray-600" />
                                        ) : (
                                            <VolumeX size={16} className="text-gray-400" />
                                        )}
                                    </button>
                                    <button
                                        onClick={requestNotificationPermission}
                                        className="p-1 rounded hover:bg-white/50 transition-colors"
                                        title="Enable browser notifications"
                                    >
                                        <Bell size={16} className="text-gray-600" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Stats */}
                            <div className="flex gap-4 mt-2 text-sm">
                                <div className="flex items-center gap-1">
                                    <Clock size={14} className="text-yellow-600" />
                                    <span className="text-yellow-700">{waitingCount} waiting</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle size={14} className="text-red-600" />
                                    <span className="text-red-700">{unreadCount} unread</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Conversations */}
                        <div className="max-h-64 overflow-y-auto">
                            {recentConversations.length > 0 ? (
                                recentConversations.map((conversation) => (
                                    <Link
                                        key={conversation.id}
                                        href="/admin/chat"
                                        className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Users size={14} className="text-gray-400" />
                                                    <span className="font-medium text-gray-900 truncate">
                                                        {getVisitorName(conversation)}
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(conversation.status)}`}>
                                                        {conversation.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {conversation.initial_message || conversation.latest_message?.message || 'No message'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatTime(conversation.last_activity_at)}
                                                </p>
                                            </div>
                                            {conversation.unread_count > 0 && (
                                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                                                    {conversation.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <MessageCircle size={32} className="mx-auto mb-2 text-gray-400" />
                                    <p>No recent conversations</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                            <Link
                                href="/admin/chat"
                                className="flex items-center justify-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                                onClick={() => setShowDropdown(false)}
                            >
                                <span>View all conversations</span>
                                <ExternalLink size={14} />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click outside to close */}
            {showDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </div>
    );
}