import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

// Simple avatar options using text/emoji avatars
const AVATAR_OPTIONS = [
    { id: 'default', type: 'emoji', value: '👤', translationKey: 'default' },
    { id: 'student', type: 'emoji', value: '🎓', translationKey: 'student' },
    { id: 'book', type: 'emoji', value: '📚', translationKey: 'reader' },
    { id: 'star', type: 'emoji', value: '⭐', translationKey: 'star' },
    { id: 'rocket', type: 'emoji', value: '🚀', translationKey: 'explorer' },
    { id: 'brain', type: 'emoji', value: '🧠', translationKey: 'thinker' },
    { id: 'lightbulb', type: 'emoji', value: '💡', translationKey: 'creative' },
    { id: 'trophy', type: 'emoji', value: '🏆', translationKey: 'winner' },
    { id: 'puzzle', type: 'emoji', value: '🧩', translationKey: 'problem_solver' },
];

export default function AvatarSelector({ currentAvatar, className = '' }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth.user;
    
    // Get theme colors with fallback - use CSS variables that are set globally
    const getThemeColors = () => {
        try {
            const styles = getComputedStyle(document.documentElement);
            let primaryColor = styles.getPropertyValue('--primary-600').trim();
            let primaryLight = styles.getPropertyValue('--primary-50').trim();
            
            // If CSS variables are empty, try alternative approach
            if (!primaryColor) {
                // Check if there's a primary color set in the body or html
                const bodyStyles = getComputedStyle(document.body);
                primaryColor = bodyStyles.getPropertyValue('--primary-600').trim();
            }
            
            // Convert space-separated RGB values to proper CSS color format
            if (primaryColor && !primaryColor.startsWith('#') && !primaryColor.startsWith('rgb')) {
                primaryColor = `rgb(${primaryColor})`;
            }
            if (primaryLight && !primaryLight.startsWith('#') && !primaryLight.startsWith('rgb')) {
                primaryLight = `rgb(${primaryLight})`;
            }
            
            // Fallback to hardcoded colors if nothing found
            primaryColor = primaryColor || 'rgb(37, 99, 235)'; // blue-600
            primaryLight = primaryLight || 'rgb(239, 246, 255)'; // blue-50
            
            return { primaryColor, primaryLight };
        } catch (error) {
            console.log('Error getting theme colors:', error);
            return { primaryColor: 'rgb(37, 99, 235)', primaryLight: 'rgb(239, 246, 255)' };
        }
    };
    
    const [themeColors, setThemeColors] = useState(getThemeColors);
    const [selectedAvatar, setSelectedAvatar] = useState(() => {
        // First try user's database preference (only if field exists)
        if (user?.avatar_preference) {
            return user.avatar_preference;
        }
        // Fallback to localStorage for backwards compatibility
        try {
            const localAvatar = localStorage.getItem('user_avatar_preference');
            if (localAvatar) {
                const avatarData = JSON.parse(localAvatar);
                return avatarData?.id || 'default';
            }
        } catch (e) {
            console.error('Error reading localStorage avatar:', e);
        }
        return currentAvatar || 'default';
    });
    const [isChanging, setIsChanging] = useState(false);

    // Listen for theme changes and update colors accordingly
    useEffect(() => {
        const handleThemeChange = () => {
            setThemeColors(getThemeColors());
        };

        // Listen for data-theme attribute changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    handleThemeChange();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // Also listen for custom theme change events
        window.addEventListener('themeChanged', handleThemeChange);

        return () => {
            observer.disconnect();
            window.removeEventListener('themeChanged', handleThemeChange);
        };
    }, []);

    const handleAvatarChange = async (avatarId) => {
        if (isChanging || avatarId === selectedAvatar) return;
        
        setIsChanging(true);
        setSelectedAvatar(avatarId);
        
        try {
            const avatarData = AVATAR_OPTIONS.find(avatar => avatar.id === avatarId);
            
            // Store in localStorage for immediate persistence
            const avatarString = JSON.stringify({
                type: avatarData.type,
                value: avatarData.value,
                id: avatarData.id
            });
            localStorage.setItem('user_avatar_preference', avatarString);
            
            // Save to database for user-specific persistence
            try {
                const response = await fetch('/profile/avatar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ avatar: avatarId })
                });
                
                const data = await response.json();
                if (data.success) {
                    console.log('Avatar saved successfully to database:', avatarId);
                } else {
                    console.warn('Avatar save response:', data);
                }
            } catch (error) {
                console.error('Failed to save avatar to database:', error);
                // Don't revert UI state as localStorage still works
            }
            
            console.log('Avatar updated successfully');
            
            // Trigger a custom event to notify other components
            window.dispatchEvent(new CustomEvent('avatarChanged', { 
                detail: { avatarData } 
            }));
            
        } catch (error) {
            console.error('Failed to update avatar:', error);
        } finally {
            setIsChanging(false);
        }
    };

    const renderAvatar = (avatar, size = 'w-12 h-12') => {
        const isLarge = size.includes('w-16');
        return (
            <div className={`${size} rounded-full bg-primary-100 flex items-center justify-center ${isLarge ? 'text-3xl' : 'text-2xl'}`}>
                {avatar.value}
            </div>
        );
    };

    return (
        <div className={className}>
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">🎭</span>
                    {t('profile.choose_your_avatar')}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {t('profile.select_avatar_that_represents')}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {AVATAR_OPTIONS.map((avatar) => (
                    <div
                        key={avatar.id}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 text-center transition-all duration-200 hover:shadow-md hover:scale-102 ${
                            selectedAvatar === avatar.id
                                ? 'shadow-lg'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                        } ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{
                            backgroundColor: selectedAvatar === avatar.id ? themeColors.primaryLight : 'white',
                            borderColor: selectedAvatar === avatar.id ? themeColors.primaryColor : '#e5e7eb'
                        }}
                        onClick={() => handleAvatarChange(avatar.id)}
                    >
                        {/* Avatar Preview - Bigger */}
                        <div className="flex justify-center items-center mb-3">
                            {renderAvatar(avatar, 'w-16 h-16')}
                        </div>
                        
                        {/* Avatar Name - Full text, no truncation */}
                        <p className={`text-sm font-medium text-center px-1 leading-tight ${
                            selectedAvatar === avatar.id ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                            {t(`profile.avatars.${avatar.translationKey}`)}
                        </p>

                        {/* Selected Indicator */}
                        {selectedAvatar === avatar.id && (
                            <div 
                                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                                style={{ backgroundColor: themeColors.primaryColor }}
                            >
                                <Check className="h-4 w-4 text-white" />
                            </div>
                        )}

                        {/* Loading Overlay */}
                        {isChanging && selectedAvatar !== avatar.id && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                                <div 
                                    className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                                    style={{ borderColor: themeColors.primaryColor }}
                                ></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-blue-600 text-sm">💡</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-blue-800 leading-relaxed">
                            <span className="font-semibold">{t('profile.avatar_tip')}:</span> {t('profile.avatar_tip_description')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}