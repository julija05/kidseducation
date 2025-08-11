import { usePage, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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
        setIsOpen(false);
        
        // If it's the same locale, do nothing
        if (newLocale === locale.current) {
            return;
        }
        
        // Store the desired language in localStorage for immediate detection
        localStorage.setItem('pending_language_switch', newLocale);
        localStorage.setItem('force_language_reload', Date.now().toString());
        
        // Show loading state
        const switchingMessage = document.createElement('div');
        switchingMessage.innerHTML = `
            <div style="text-align: center;">
                <div style="margin-bottom: 10px;">🌐</div>
                <div>Switching to ${newLocale === 'en' ? 'English' : 'Македонски'}...</div>
                <div style="margin-top: 10px; font-size: 12px;">Please wait...</div>
            </div>
        `;
        switchingMessage.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.9);color:white;padding:20px 30px;border-radius:8px;z-index:99999;font-family:Arial,sans-serif;';
        document.body.appendChild(switchingMessage);
        
        // Disable all interactions during switch
        document.body.style.pointerEvents = 'none';
        
        // Create a form to POST the language change (bypasses GET caching)
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/language/${newLocale}`;
        form.style.display = 'none';
        
        // Add CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (csrfToken) {
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = csrfToken.getAttribute('content');
            form.appendChild(tokenInput);
        }
        
        // Add cache busting parameters
        const timestampInput = document.createElement('input');
        timestampInput.type = 'hidden';
        timestampInput.name = 'cache_bust';
        timestampInput.value = Date.now().toString();
        form.appendChild(timestampInput);
        
        const forceInput = document.createElement('input');
        forceInput.type = 'hidden';
        forceInput.name = 'force_reload';
        forceInput.value = '1';
        form.appendChild(forceInput);
        
        document.body.appendChild(form);
        
        // Submit the form after a short delay
        setTimeout(() => {
            form.submit();
        }, 500);
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