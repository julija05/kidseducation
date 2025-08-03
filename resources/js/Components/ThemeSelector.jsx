import { useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { getAllThemes } from '@/Utils/themes';
import { useTheme } from '@/hooks/useTheme.jsx';
import { useTranslation } from '@/hooks/useTranslation';

export default function ThemeSelector({ className = '' }) {
    const { t } = useTranslation();
    const { userTheme, changeTheme } = useTheme();
    const [isChanging, setIsChanging] = useState(false);
    const themes = getAllThemes();

    const handleThemeChange = async (themeId) => {
        if (isChanging || themeId === userTheme.id) return;
        
        setIsChanging(true);
        try {
            await changeTheme(themeId);
        } catch (error) {
            console.error('Failed to change theme:', error);
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
                            userTheme.id === theme.id
                                ? `${theme.primaryBorder} bg-gradient-to-br ${theme.primaryLight}`
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
                            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded p-2 space-y-2`}>
                                <div className="flex items-center justify-between">
                                    <div className="w-20 h-2 bg-gray-300 rounded"></div>
                                    <div className={`w-12 h-2 ${theme.primarySolid} rounded`}></div>
                                </div>
                                <div className="w-full h-1 bg-gray-200 rounded">
                                    <div className={`w-3/4 h-full ${theme.primarySolid} rounded`}></div>
                                </div>
                            </div>
                            
                            {/* Button Preview */}
                            <div className="flex gap-2">
                                <div className={`w-16 h-6 ${theme.primarySolid} rounded text-xs`}></div>
                                <div className={`w-12 h-6 ${theme.accent} rounded text-xs`}></div>
                            </div>
                        </div>

                        {/* Theme Name */}
                        <div className="mt-4">
                            <p className={`font-medium text-sm ${userTheme.id === theme.id ? theme.primaryText : 'text-gray-900'}`}>
                                {theme.name}
                            </p>
                        </div>

                        {/* Selected Indicator */}
                        {userTheme.id === theme.id && (
                            <div className={`absolute top-2 right-2 w-6 h-6 ${theme.primarySolid} rounded-full flex items-center justify-center`}>
                                <Check className="h-4 w-4 text-white" />
                            </div>
                        )}

                        {/* Loading Overlay */}
                        {isChanging && userTheme.id !== theme.id && (
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