import { useState, useEffect } from 'react';

export function useAvatar() {
    const [avatarData, setAvatarData] = useState(() => {
        try {
            const localAvatar = localStorage.getItem('user_avatar_preference');
            return localAvatar ? JSON.parse(localAvatar) : null;
        } catch (e) {
            return null;
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

    const renderAvatar = (size = 'w-8 h-8', textSize = 'text-sm') => {
        if (avatarData && avatarData.type === 'emoji') {
            return (
                <div className={`${size} rounded-full bg-primary-100 flex items-center justify-center ${textSize}`}>
                    {avatarData.value}
                </div>
            );
        }
        return null; // Return null so parent can provide fallback
    };

    return { avatarData, renderAvatar };
}