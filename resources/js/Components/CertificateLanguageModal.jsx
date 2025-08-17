import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Globe } from 'lucide-react';

export default function CertificateLanguageModal({ 
    isOpen, 
    onClose, 
    onLanguageSelect, 
    programName,
    isGenerating = false 
}) {
    const handleLanguageSelect = (language) => {
        onLanguageSelect(language);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full p-8 relative">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Globe className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Choose Certificate Language
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    Select the language for your {programName} certificate
                                </p>
                            </div>

                            {/* Language Options */}
                            <div className="space-y-3 mb-6">
                                {/* English Option */}
                                <motion.button
                                    onClick={() => handleLanguageSelect('en')}
                                    disabled={isGenerating}
                                    className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">EN</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-gray-900">English</div>
                                            <div className="text-sm text-gray-500">Certificate in English</div>
                                        </div>
                                    </div>
                                    <Download className="w-5 h-5 text-gray-400" />
                                </motion.button>

                                {/* Macedonian Option */}
                                <motion.button
                                    onClick={() => handleLanguageSelect('mk')}
                                    disabled={isGenerating}
                                    className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">МК</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-gray-900">Македонски</div>
                                            <div className="text-sm text-gray-500">Сертификат на македонски</div>
                                        </div>
                                    </div>
                                    <Download className="w-5 h-5 text-gray-400" />
                                </motion.button>
                            </div>

                            {/* Loading State */}
                            {isGenerating && (
                                <div className="text-center">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-2"
                                    />
                                    <p className="text-sm text-gray-600">Generating certificate...</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="text-center">
                                <p className="text-xs text-gray-500">
                                    You can download the certificate in either language
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}