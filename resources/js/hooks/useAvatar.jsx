import { useState, useEffect } from 'react';

export function useAvatar() {
    const [avatarData, setAvatarData] = useState(() => {
        try {
            const localAvatar = localStorage.getItem('user_avatar_preference');
            if (localAvatar) {
                return JSON.parse(localAvatar);
            }
            // Return default avatar if no preference is set
            return { type: 'emoji', value: '👤', id: 'default' };
        } catch (e) {
            return { type: 'emoji', value: '👤', id: 'default' };
        }
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