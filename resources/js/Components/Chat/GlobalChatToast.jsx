import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/Contexts/ChatContext';
import { MessageCircle, X } from 'lucide-react';

export default function GlobalChatToast() {
    const { showToast, toastMessage, setShowToast, clearNotifications } = useChat();
    
    const handleOpenChat = () => {
        setShowToast(false);
        clearNotifications();
        // Dispatch a custom event to open the chat
        window.dispatchEvent(new CustomEvent('openChat'));
    };

    return (
        <AnimatePresence>
            {showToast && (
                <motion.div
                    className="fixed top-4 right-4 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <motion.div
                                className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center"
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <MessageCircle size={16} className="text-white" />
                            </motion.div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">Support Team</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{toastMessage}</p>
                        </div>
                        <button
                            onClick={() => setShowToast(false)}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <button
                        onClick={handleOpenChat}
                        className="mt-3 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-all duration-200"
                    >
                        Open Chat
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}