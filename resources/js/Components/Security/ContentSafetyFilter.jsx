import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, X, Eye, Lock } from 'lucide-react';

function ContentSafetyFilter({ 
    content, 
    onContentApproved, 
    onContentBlocked,
    children 
}) {
    const [isChecking, setIsChecking] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);
    const [violations, setViolations] = useState([]);
    const [showBlockedMessage, setShowBlockedMessage] = useState(false);

    useEffect(() => {
        checkContentSafety();
    }, [content]);

    const checkContentSafety = async () => {
        setIsChecking(true);
        
        // Simulate content moderation check
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const foundViolations = moderateContent(content);
        
        if (foundViolations.length > 0) {
            setViolations(foundViolations);
            setIsBlocked(true);
            setShowBlockedMessage(true);
            onContentBlocked?.(foundViolations);
        } else {
            setIsBlocked(false);
            onContentApproved?.();
        }
        
        setIsChecking(false);
    };

    const moderateContent = (text) => {
        if (!text || typeof text !== 'string') return [];
        
        const violations = [];
        const textLower = text.toLowerCase();
        
        // Check for prohibited words/phrases
        const prohibitedWords = [
            'phone', 'address', 'email', 'meet me', 'secret', 'password',
            'don\'t tell', 'come over', 'visit me', 'my house', 'where do you live',
            'instagram', 'facebook', 'snapchat', 'discord', 'whatsapp'
        ];
        
        prohibitedWords.forEach(word => {
            if (textLower.includes(word)) {
                violations.push({
                    type: 'prohibited_word',
                    word: word,
                    reason: 'This word or phrase is not allowed for your safety'
                });
            }
        });
        
        // Check for patterns
        const patterns = [
            {
                regex: /\b\d{10,}\b/,
                type: 'phone_number',
                reason: 'Phone numbers are not allowed for your privacy'
            },
            {
                regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
                type: 'email_address', 
                reason: 'Email addresses are not allowed for your safety'
            },
            {
                regex: /https?:\/\/[^\s]+/,
                type: 'url',
                reason: 'External links are filtered for your protection'
            }
        ];
        
        patterns.forEach(pattern => {
            if (pattern.regex.test(text)) {
                violations.push({
                    type: pattern.type,
                    reason: pattern.reason
                });
            }
        });
        
        return violations;
    };

    if (isChecking) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center p-8"
            >
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Shield className="w-8 h-8 text-blue-500" />
                    </motion.div>
                    <p className="text-sm text-gray-600">Checking content safety...</p>
                </div>
            </motion.div>
        );
    }

    if (isBlocked) {
        return (
            <AnimatePresence>
                {showBlockedMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-red-50 border-2 border-red-200 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                                <h3 className="text-lg font-bold text-red-800">Content Blocked</h3>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowBlockedMessage(false)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <X className="w-5 h-5" />
                            </motion.button>
                        </div>

                        <div className="space-y-3">
                            <p className="text-red-700">
                                🛡️ Our safety system detected content that needs to be reviewed to keep you safe.
                            </p>

                            {violations.length > 0 && (
                                <div className="bg-white rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-red-800 mb-2">Safety Issues Found:</h4>
                                    <ul className="space-y-1">
                                        {violations.map((violation, index) => (
                                            <li key={index} className="text-xs text-red-700 flex items-start gap-2">
                                                <span className="text-red-500">•</span>
                                                <span>{violation.reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-800">Why do we check content?</h4>
                                        <p className="text-xs text-blue-700 mt-1">
                                            We check all content to make sure it's safe and appropriate for young learners. 
                                            This helps protect your privacy and keeps you safe online.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    // Content is safe - render children with safety indicator
    return (
        <div className="relative">
            {/* Safety indicator */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-0 right-0 -mt-2 -mr-2 z-10"
            >
                <div className="bg-green-100 border-2 border-green-300 rounded-full p-1">
                    <Shield className="w-4 h-4 text-green-600" />
                </div>
            </motion.div>
            
            {children}
        </div>
    );
}

// Safe Input Component for forms
function SafeInput({ 
    value, 
    onChange, 
    placeholder, 
    className = "",
    maxLength = 500,
    ...props 
}) {
    const [isValidating, setIsValidating] = useState(false);
    const [hasViolations, setHasViolations] = useState(false);

    const handleChange = async (e) => {
        const newValue = e.target.value;
        
        // Apply character limit
        if (newValue.length > maxLength) {
            return;
        }
        
        onChange?.(e);
        
        // Quick validation for real-time feedback
        if (newValue.length > 10) {
            setIsValidating(true);
            
            // Simulate quick check
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const hasIssues = /\b(phone|email|meet|secret)\b/i.test(newValue);
            setHasViolations(hasIssues);
            setIsValidating(false);
        } else {
            setHasViolations(false);
        }
    };

    return (
        <div className="relative">
            <input
                {...props}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className={`${className} ${hasViolations ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} transition-colors`}
            />
            
            {/* Character count */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {value?.length || 0}/{maxLength}
            </div>
            
            {/* Validation indicators */}
            {isValidating && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Shield className="w-4 h-4 text-blue-500" />
                    </motion.div>
                </div>
            )}
            
            {hasViolations && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
            )}
            
            {!isValidating && !hasViolations && value && value.length > 10 && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Shield className="w-4 h-4 text-green-500" />
                </div>
            )}
        </div>
    );
}

export { ContentSafetyFilter, SafeInput };
export default ContentSafetyFilter;