import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Globe, Check } from 'lucide-react';

export default function FirstTimeLanguageSelector({ show, onClose }) {
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const languages = [
        {
            code: 'en',
            name: 'English',
            nativeName: 'English',
            flag: '🇺🇸',
            description: 'Learn in English'
        },
        {
            code: 'mk',
            name: 'Macedonian',
            nativeName: 'Македонски',
            flag: '🇲🇰',
            description: 'Учи на македонски'
        }
    ];

    const handleLanguageSelect = (language) => {
        setSelectedLanguage(language);
    };

    const handleSubmit = () => {
        if (!selectedLanguage) return;

        setIsSubmitting(true);
        
        router.post('/language/set-preference', {
            language: selectedLanguage.code,
            first_time: true
        }, {
            onSuccess: () => {
                onClose();
                // Reload the page to apply the new language
                window.location.reload();
            },
            onError: (errors) => {
                console.error('Error setting language preference:', errors);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            
            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all w-full max-w-md">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                            <Globe className="w-8 h-8 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Welcome to Abacoding!
                        </h2>
                        <p className="text-blue-100">
                            Choose your preferred language to get started
                        </p>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6">
                        <div className="space-y-3">
                            {languages.map((language) => (
                                <button
                                    key={language.code}
                                    onClick={() => handleLanguageSelect(language)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                                        selectedLanguage?.code === language.code
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-3xl">{language.flag}</div>
                                            <div>
                                                <div className="font-semibold text-gray-900">
                                                    {language.nativeName}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {language.description}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedLanguage?.code === language.code && (
                                            <div className="text-blue-500">
                                                <Check className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8">
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedLanguage || isSubmitting}
                                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
                                    selectedLanguage && !isSubmitting
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                                        Setting up...
                                    </div>
                                ) : selectedLanguage ? (
                                    `Continue with ${selectedLanguage.nativeName}`
                                ) : (
                                    'Please select a language'
                                )}
                            </button>
                        </div>

                        {/* Info Text */}
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                Don't worry! You can change this later in your profile settings.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}