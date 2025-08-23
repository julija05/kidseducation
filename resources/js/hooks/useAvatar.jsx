import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export function useAvatar() {
    const { auth } = usePage().props;
    const user = auth?.user;
    
    const [avatarData, setAvatarData] = useState(() => {
        // First try user's database preference
        if (user?.avatar_preference) {
            // Map avatar preference to avatar data
            const avatarOptions = {
                'default': { type: 'emoji', value: '👤', id: 'default' },
                'student': { type: 'emoji', value: '🎓', id: 'student' },
                'book': { type: 'emoji', value: '📚', id: 'book' },
                'star': { type: 'emoji', value: '⭐', id: 'star' },
                'rocket': { type: 'emoji', value: '🚀', id: 'rocket' },
                'brain': { type: 'emoji', value: '🧠', id: 'brain' },
                'lightbulb': { type: 'emoji', value: '💡', id: 'lightbulb' },
                'trophy': { type: 'emoji', value: '🏆', id: 'trophy' },
                'puzzle': { type: 'emoji', value: '🧩', id: 'puzzle' },
            };
            return avatarOptions[user.avatar_preference] || avatarOptions['default'];
        }
        
        // Fallback to localStorage for backwards compatibility
        try {
            const localAvatar = localStorage.getItem('user_avatar_preference');
            if (localAvatar) {
                return JSON.parse(localAvatar);
            }
        } catch (e) {
            console.error('Error reading localStorage avatar:', e);
        }
        
        // Return default avatar if no preference is set
        return { type: 'emoji', value: '👤', id: 'default' };
    });

    useEffect(() => {
        const handleAvatarChange = (event) => {
            setAvatarData(event.detail.avatarData);
        };

        window.addEventListener('avatarChanged', handleAvatarChange);
        
        return () => {
            window.removeEventListener('avatarChanged', handleAvatarChange);
        };
    }, []);

    const renderAvatar = (size = 'w-8 h-8', textSize = 'text-sm', fallbackLetter = 'A') => {
        if (avatarData && avatarData.type === 'emoji') {
            return (
                <div className={`${size} rounded-full bg-primary-100 flex items-center justify-center ${textSize}`}>
                    {avatarData.value}
                </div>
            );
        } else {
            // Fallback to initial avatar with user's first letter
            return (
                <div className={`${size} rounded-full bg-primary-600 flex items-center justify-center text-white font-bold ${textSize}`}>
                    {fallbackLetter}
                </div>
            );
        }
    };

    return { avatarData, renderAvatar };
}