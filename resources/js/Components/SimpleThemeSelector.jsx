import { useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

// Simple theme definitions without complex context
const SIMPLE_THEMES = {
    default: {
        id: 'default',
        name: 'Default Blue',
        primary: 'from-blue-600 to-indigo-600',
        preview: 'bg-blue-600',
        accent: 'bg-blue-100',
    },
    purple: {
        id: 'purple',
        name: 'Purple Dreams',
        primary: 'from-purple-600 to-pink-600',
        preview: 'bg-purple-600',
        accent: 'bg-purple-100',
    },
    green: {
        id: 'green',
        name: 'Nature Green',
        primary: 'from-green-600 to-emerald-600',
        preview: 'bg-green-600',
        accent: 'bg-green-100',
    },
    orange: {
        id: 'orange',
        name: 'Warm Orange',
        primary: 'from-orange-600 to-red-500',
        preview: 'bg-orange-600',
        accent: 'bg-orange-100',
    },
    teal: {
        id: 'teal',
        name: 'Ocean Teal',
        primary: 'from-teal-600 to-cyan-600',
        preview: 'bg-teal-600',
        accent: 'bg-teal-100',
    },
    dark: {
        id: 'dark',
        name: 'Dark Mode',
        primary: 'from-gray-800 to-gray-900',
        preview: 'bg-gray-800',
        accent: 'bg-gray-700',
    },
};

export default function SimpleThemeSelector({ className = '' }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth.user;
    
    // Get current theme from localStorage or default
    const [currentTheme, setCurrentTheme] = useState(() => {
        try {
            return localStorage.getItem('user_theme_preference') || 'default';
        } catch {
            return 'default';
        }
    });
    
    const [isChanging, setIsChanging] = useState(false);
    const themes = Object.values(SIMPLE_THEMES);

    const handleThemeChange = (themeId) => {
        if (isChanging || themeId === currentTheme) return;
        
        setIsChanging(true);
        setCurrentTheme(themeId);
        
        try {
            // Apply theme immediately to DOM
            document.documentElement.setAttribute('data-theme', themeId);
            
            // Save to localStorage immediately
            localStorage.setItem('user_theme_preference', themeId);
            
            console.log('Theme saved successfully to localStorage:', themeId);
            console.log('Document data-theme attribute:', document.documentElement.getAttribute('data-theme'));
            
            // Debug: Check if CSS variables are being applied
            const styles = getComputedStyle(document.documentElement);
            const primaryColor = styles.getPropertyValue('--primary-600');
            console.log('Current --primary-600 value:', primaryColor);
            
            // Dispatch custom event for other components to listen to
            window.dispatchEvent(new CustomEvent('themeChanged', { 
                detail: { themeId } 
            }));
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">
                    {t('profile.dashboard_theme')}
                </h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
                {t('profile.dashboard_theme_description')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((theme) => (
                    <div
                        key={theme.id}
                        className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            currentTheme === theme.id
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                        } ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleThemeChange(theme.id)}
                    >
                        {/* Theme Preview */}
                        <div className="space-y-3">
                            {/* Navigation Preview */}
                            <div className={`h-8 rounded bg-gradient-to-r ${theme.primary} flex items-center px-3`}>
                                <div className="w-16 h-3 bg-white bg-opacity-30 rounded"></div>
                            </div>
                            
                            {/* Card Preview */}
                            <div className="bg-white border border-gray-200 rounded p-2 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="w-20 h-2 bg-gray-300 rounded"></div>
                                    <div className={`w-12 h-2 ${theme.preview} rounded`}></div>
                                </div>
                                <div className="w-full h-1 bg-gray-200 rounded">
                                    <div className={`w-3/4 h-full ${theme.preview} rounded`}></div>
                                </div>
                            </div>
                            
                            {/* Button Preview */}
                            <div className="flex gap-2">
                                <div className={`w-16 h-6 ${theme.preview} rounded text-xs`}></div>
                                <div className={`w-12 h-6 ${theme.accent} rounded text-xs`}></div>
                            </div>
                        </div>

                        {/* Theme Name */}
                        <div className="mt-4">
                            <p className={`font-medium text-sm ${currentTheme === theme.id ? 'text-blue-700' : 'text-gray-900'}`}>
                                {theme.name}
                            </p>
                        </div>

                        {/* Selected Indicator */}
                        {currentTheme === theme.id && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                            </div>
                        )}

                        {/* Loading Overlay */}
                        {isChanging && currentTheme !== theme.id && (
                            <div className="absolute inset-0 bg-white bg-opacity-50 rounded-lg flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>{t('profile.theme_note_title')}:</strong> {t('profile.theme_note_description')}
                </p>
            </div>
        </div>
    );
}