import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function PasswordStrengthIndicator({ password }) {
    const { t } = useTranslation();

    const requirements = [
        {
            key: 'length',
            label: t('auth.register.password_requirement_length'),
            test: (password) => password.length >= 8
        },
        {
            key: 'letters',
            label: t('auth.register.password_requirement_letters'),
            test: (password) => /[a-zA-Z]/.test(password)
        },
        {
            key: 'mixedCase',
            label: t('auth.register.password_requirement_mixed_case'),
            test: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password)
        },
        {
            key: 'numbers',
            label: t('auth.register.password_requirement_numbers'),
            test: (password) => /\d/.test(password)
        },
        {
            key: 'symbols',
            label: t('auth.register.password_requirement_symbols'),
            test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
        }
    ];

    const metRequirements = requirements.filter(req => req.test(password));
    const strengthPercentage = (metRequirements.length / requirements.length) * 100;

    const getStrengthInfo = () => {
        if (strengthPercentage === 0) return { level: '', color: 'bg-gray-200', text: '' };
        if (strengthPercentage <= 40) return { 
            level: t('auth.register.password_strength_weak'), 
            color: 'bg-gradient-to-r from-red-500 to-red-600', 
            text: 'text-red-600' 
        };
        if (strengthPercentage <= 60) return { 
            level: t('auth.register.password_strength_fair'), 
            color: 'bg-gradient-to-r from-orange-500 to-yellow-500', 
            text: 'text-orange-600' 
        };
        if (strengthPercentage <= 80) return { 
            level: t('auth.register.password_strength_good'), 
            color: 'bg-gradient-to-r from-yellow-500 to-green-500', 
            text: 'text-green-600' 
        };
        return { 
            level: t('auth.register.password_strength_strong'), 
            color: 'bg-gradient-to-r from-green-500 to-emerald-600', 
            text: 'text-green-600' 
        };
    };

    const strengthInfo = getStrengthInfo();

    if (!password) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200"
        >
            {/* Strength Bar */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {t('auth.register.password_strength')}
                    </span>
                    {strengthInfo.level && (
                        <span className={`text-sm font-semibold ${strengthInfo.text}`}>
                            {strengthInfo.level}
                        </span>
                    )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                        className={`h-full ${strengthInfo.color} transition-all duration-300`}
                        initial={{ width: 0 }}
                        animate={{ width: `${strengthPercentage}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Requirements List */}
            <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600 mb-2">
                    {t('auth.register.password_requirements')}
                </p>
                {requirements.map((requirement) => {
                    const isMet = requirement.test(password);
                    return (
                        <motion.div
                            key={requirement.key}
                            className="flex items-center gap-2 text-xs"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <motion.div
                                className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    isMet 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-300 text-gray-500'
                                }`}
                                animate={{ scale: isMet ? 1.1 : 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isMet ? (
                                    <Check className="w-2.5 h-2.5" />
                                ) : (
                                    <X className="w-2.5 h-2.5" />
                                )}
                            </motion.div>
                            <span className={`${isMet ? 'text-green-700' : 'text-gray-600'} transition-colors duration-200`}>
                                {requirement.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Security Tip */}
            {strengthPercentage === 100 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg"
                >
                    <div className="flex items-center gap-2 text-xs text-green-700">
                        <Lock className="w-3 h-3" />
                        <span className="font-medium">
                            Excellent! Your password meets all security requirements.
                        </span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}