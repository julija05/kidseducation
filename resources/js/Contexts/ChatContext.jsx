import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from '@/config/axios';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastMessageCount, setLastMessageCount] = useState(0);
    const [hasNewAdminMessage, setHasNewAdminMessage] = useState(false);
    const [playedSoundIds, setPlayedSoundIds] = useState(new Set());
    const [soundCount, setSoundCount] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const audioContextRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    // Load persisted data from sessionStorage on initialization
    useEffect(() => {
        const loadPersistedData = () => {
            try {
                const persistedConversation = sessionStorage.getItem('chat_conversation');
                const persistedMessages = sessionStorage.getItem('chat_messages');
                const persistedUnreadCount = sessionStorage.getItem('chat_unread_count');
                const persistedSoundIds = sessionStorage.getItem('chat_played_sound_ids');
                const persistedSoundCount = sessionStorage.getItem('chat_sound_count');

                if (persistedConversation) {
                    const parsedConversation = JSON.parse(persistedConversation);
                    // Normalize conversation object to ensure conversation_id field exists
                    const normalizedConversation = {
                        ...parsedConversation,
                        conversation_id: parsedConversation.conversation_id || parsedConversation.id
                    };
                    setConversation(normalizedConversation);
                }

                if (persistedMessages) {
                    const parsedMessages = JSON.parse(persistedMessages);
                    setMessages(parsedMessages);
                    setLastMessageCount(parsedMessages.length);
                }

                if (persistedUnreadCount) {
                    setUnreadCount(parseInt(persistedUnreadCount, 10));
                }

                if (persistedSoundIds) {
                    setPlayedSoundIds(new Set(JSON.parse(persistedSoundIds)));
                }

                if (persistedSoundCount) {
                    setSoundCount(parseInt(persistedSoundCount, 10));
                }

                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to load persisted chat data:', error);
                setIsInitialized(true);
            }
        };

        loadPersistedData();
    }, []);

    // Persist data to sessionStorage whenever state changes
    useEffect(() => {
        if (!isInitialized) return;
        
        try {
            if (conversation) {
                sessionStorage.setItem('chat_conversation', JSON.stringify(conversation));
            } else {
                sessionStorage.removeItem('chat_conversation');
            }
        } catch (error) {
            console.error('Failed to persist conversation:', error);
        }
    }, [conversation, isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;
        
        try {
            if (messages.length > 0) {
                sessionStorage.setItem('chat_messages', JSON.stringify(messages));
            } else {
                sessionStorage.removeItem('chat_messages');
            }
        } catch (error) {
            console.error('Failed to persist messages:', error);
        }
    }, [messages, isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;
        
        try {
            sessionStorage.setItem('chat_unread_count', unreadCount.toString());
        } catch (error) {
            console.error('Failed to persist unread count:', error);
        }
    }, [unreadCount, isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;
        
        try {
            sessionStorage.setItem('chat_played_sound_ids', JSON.stringify([...playedSoundIds]));
        } catch (error) {
            console.error('Failed to persist played sound IDs:', error);
        }
    }, [playedSoundIds, isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;
        
        try {
            sessionStorage.setItem('chat_sound_count', soundCount.toString());
        } catch (error) {
            console.error('Failed to persist sound count:', error);
        }
    }, [soundCount, isInitialized]);

    // Start global polling when conversation exists
    useEffect(() => {
        if (conversation?.conversation_id && isInitialized) {
            startPolling();
        } else {
            stopPolling();
        }

        return () => stopPolling();
    }, [conversation, isInitialized]);

    // Update page title with notification count
    useEffect(() => {
        const originalTitle = document.title.replace(/^\(\d+\)\s*/, '');
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) ${originalTitle}`;
        } else {
            document.title = originalTitle;
        }
        
        return () => {
            document.title = originalTitle;
        };
    }, [unreadCount]);

    const startPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        pollingIntervalRef.current = setInterval(() => {
            fetchMessages();
        }, 3000);
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    const initChat = async () => {
        try {
            const response = await axios.post('/chat/init');
            
            if (response.data.error) {
                console.error('Chat initialization error:', response.data.message);
                return null;
            }
            
            const conversationData = response.data;
            const initialMessages = conversationData.messages || [];
            
            setConversation(conversationData);
            setMessages(initialMessages);
            setLastMessageCount(initialMessages.length);
            
            // Count unread admin messages on initial load
            const unreadAdminMessages = initialMessages.filter(msg => 
                msg.sender_type === 'admin' && !msg.is_read
            ).length;
            
            if (unreadAdminMessages > 0) {
                setUnreadCount(unreadAdminMessages);
                setHasNewAdminMessage(true);
            }
            
            return conversationData;
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            return null;
        }
    };

    const fetchMessages = async () => {
        if (!conversation?.conversation_id) return;
        
        try {
            const response = await axios.get(`/chat/${conversation.conversation_id}/messages`);
            const newMessages = response.data.messages;
            const updatedConversation = response.data.conversation;
            
            // Check if conversation was closed by admin - reset for guest users
            if (updatedConversation.status === 'closed' && !window.Laravel?.user) {
                clearChatData();
                return; // Exit early, conversation is reset
            }
            
            // Update conversation data with latest status
            // Ensure conversation_id field is present for consistency
            const normalizedConversation = {
                ...updatedConversation,
                conversation_id: updatedConversation.conversation_id || updatedConversation.id
            };
            setConversation(normalizedConversation);
            
            // Check for truly new admin messages (messages that didn't exist before)
            const adminMessages = newMessages.filter(msg => 
                msg.sender_type === 'admin' && 
                !messages.find(existing => existing.id === msg.id)
            );

            
            // Update total unread count based on server data
            const totalUnreadAdminMessages = newMessages.filter(msg => 
                msg.sender_type === 'admin' && !msg.is_read
            ).length;
            
            // ONLY trigger notifications for truly NEW admin messages when chat is CLOSED
            if (adminMessages.length > 0 && !isChatOpen) {
                
                setHasNewAdminMessage(true);
                
                // Show toast notification for new messages
                setToastMessage(`New message from support: ${adminMessages[adminMessages.length - 1].message.substring(0, 50)}${adminMessages[adminMessages.length - 1].message.length > 50 ? '...' : ''}`);
                setShowToast(true);
                
                // Hide toast after 5 seconds
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
                
                // Play sound for new messages - max 2 sounds per session
                const newSoundMessages = adminMessages.filter(msg => !playedSoundIds.has(msg.id));
                if (newSoundMessages.length > 0 && soundCount < 2) {
                    playSimpleNotificationSound();
                    setSoundCount(prev => prev + 1);
                }
            }
            
            // Always mark ALL admin messages as processed for sound (prevent future duplicates)
            const allAdminMessages = newMessages.filter(msg => msg.sender_type === 'admin');
            const unprocessedAdminMessages = allAdminMessages.filter(msg => !playedSoundIds.has(msg.id));
            if (unprocessedAdminMessages.length > 0) {
                setPlayedSoundIds(prev => {
                    const newSet = new Set(prev);
                    unprocessedAdminMessages.forEach(msg => newSet.add(msg.id));
                    return newSet;
                });
            }
            
            // Update state based on chat status
            if (isChatOpen) {
                // Clear all notifications when chat is open
                setUnreadCount(0);
                setHasNewAdminMessage(false);
                setShowToast(false);
            } else {
                // Update unread count when chat is closed (but don't trigger notifications)
                setUnreadCount(totalUnreadAdminMessages);
            }
            
            // Update messages last to prevent triggering effects
            setMessages(newMessages);
            setLastMessageCount(newMessages.length);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const sendMessage = async (messageText, visitorInfo = null) => {
        if (!messageText.trim()) return null;

        try {
            // Initialize chat if not already done
            let currentConversation = conversation;
            if (!currentConversation) {
                currentConversation = await initChat();
                if (!currentConversation) {
                    throw new Error('Failed to initialize chat');
                }
                // Wait a bit for the state to update
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Validate conversation_id exists
            if (!currentConversation.conversation_id) {
                throw new Error('No conversation_id available. Please refresh and try again.');
            }

            const messageData = {
                conversation_id: currentConversation.conversation_id,
                message: messageText.trim(),
            };

            // Add visitor info if provided
            if (visitorInfo && visitorInfo.name) {
                messageData.visitor_name = visitorInfo.name;
                messageData.visitor_email = visitorInfo.email;
            }

            const response = await axios.post('/chat/send', messageData);
            
            // Add message to local state immediately for better UX
            setMessages(prev => [...prev, response.data.message]);
            
            // Fetch latest messages to get any auto-responses
            setTimeout(fetchMessages, 500);
            
            return response.data.message;
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    };

    const playSimpleNotificationSound = () => {
        try {
            // Stop any existing audio context
            stopAllSounds();
            
            // Create a simple beep using data URI
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQgBz2P1/Ljdz8FKnPI8t2UTBoXYqzm9qVbGw1Lp+TytmIcBzaN1fPNeyMFJHTF8N2QQQoUXrPq66hWFApGnt/yv2UhBz2O2PHkej0HKnLH8t2TTRoXYazl9qVcGw1Lpt/zt2UgBzaP1fTNeSUFJHfJ8dyRRQwXXrLp66hXFAlGnt7yvmUjBzqM1vPjeDcHKnHG8N2SQA0X');
            audio.volume = 0.3;
            audioContextRef.current = audio;
            audio.play().catch(() => {
                // Ignore play errors (user interaction required)
            });
        } catch (error) {
            console.log('Audio not supported');
        }
    };

    const stopAllSounds = () => {
        try {
            if (audioContextRef.current) {
                audioContextRef.current.pause();
                audioContextRef.current.currentTime = 0;
                audioContextRef.current = null;
            }
        } catch (error) {
            console.log('Error stopping audio');
        }
    };

    const clearNotifications = () => {
        setUnreadCount(0);
        setHasNewAdminMessage(false);
        setShowToast(false);
        stopAllSounds();
        setSoundCount(0);
    };
    
    const setChatOpen = (isOpen) => {
        setIsChatOpen(isOpen);
        if (isOpen) {
            clearNotifications();
        }
    };

    const clearChatData = () => {
        setConversation(null);
        setMessages([]);
        setUnreadCount(0);
        setLastMessageCount(0);
        setHasNewAdminMessage(false);
        setPlayedSoundIds(new Set());
        setSoundCount(0);
        setShowToast(false);
        setToastMessage('');
        stopPolling();
        
        // Clear sessionStorage
        try {
            sessionStorage.removeItem('chat_conversation');
            sessionStorage.removeItem('chat_messages');
            sessionStorage.removeItem('chat_unread_count');
            sessionStorage.removeItem('chat_played_sound_ids');
            sessionStorage.removeItem('chat_sound_count');
        } catch (error) {
            console.error('Failed to clear persisted chat data:', error);
        }
    };

    const value = {
        // State
        conversation,
        messages,
        unreadCount,
        hasNewAdminMessage,
        showToast,
        toastMessage,
        isInitialized,
        
        // Actions
        initChat,
        sendMessage,
        clearNotifications,
        clearChatData,
        setShowToast,
        setChatOpen,
        
        // Utils
        formatMessageTime: (timestamp) => {
            return new Date(timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};