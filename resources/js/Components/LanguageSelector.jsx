import { usePage, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const LanguageSelector = ({ className = '' }) => {
    const page = usePage();
    const locale = page.props.locale || { current: 'en', supported: ['en', 'mk'] };
    const [isOpen, setIsOpen] = useState(false);

    const languages = {
        en: { name: 'English', flag: '🇺🇸' },
        mk: { name: 'Македонски', flag: '🇲🇰' }
    };

    const switchLanguage = (newLocale) => {
        router.get(`/language/${newLocale}`);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            >
                <GlobeAltIcon className="h-4 w-4" />
                <span className="hidden sm:inline">
                    {languages[locale.current]?.flag} {languages[locale.current]?.name}
                </span>
                <span className="sm:hidden">
                    {languages[locale.current]?.flag}
                </span>
                <ChevronDownIcon className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                        {locale.supported.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => switchLanguage(lang)}
                                className={`${
                                    lang === locale.current
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-700 hover:bg-gray-50'
                                } flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 cursor-pointer`}
                            >
                                <span className="mr-3 text-lg">
                                    {languages[lang]?.flag}
                                </span>
                                <span>{languages[lang]?.name}</span>
                                {lang === locale.current && (
                                    <span className="ml-auto text-blue-600">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Backdrop to close dropdown */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default LanguageSelector;