import { useState } from 'react';
import { Check } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

// Simple avatar options using text/emoji avatars
const AVATAR_OPTIONS = [
    { id: 'initial', name: 'Initial', type: 'initial', value: null },
    { id: 'student', name: '🎓 Student', type: 'emoji', value: '🎓' },
    { id: 'book', name: '📚 Reader', type: 'emoji', value: '📚' },
    { id: 'star', name: '⭐ Star', type: 'emoji', value: '⭐' },
    { id: 'rocket', name: '🚀 Explorer', type: 'emoji', value: '🚀' },
    { id: 'brain', name: '🧠 Thinker', type: 'emoji', value: '🧠' },
    { id: 'lightbulb', name: '💡 Creative', type: 'emoji', value: '💡' },
    { id: 'trophy', name: '🏆 Winner', type: 'emoji', value: '🏆' },
    { id: 'puzzle', name: '🧩 Problem Solver', type: 'emoji', value: '🧩' },
];

export default function AvatarSelector({ currentAvatar, className = '' }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const user = auth.user;
    const [selectedAvatar, setSelectedAvatar] = useState(() => {
        try {
            const localAvatar = localStorage.getItem('user_avatar_preference');
            if (localAvatar) {
                const avatarData = JSON.parse(localAvatar);
                return avatarData?.id || 'initial';
            }
            return currentAvatar || 'initial';
        } catch (e) {
            return currentAvatar || 'initial';
        }
    });
    const [isChanging, setIsChanging] = useState(false);

    const handleAvatarChange = (avatarId) => {
        if (isChanging || avatarId === selectedAvatar) return;
        
        setIsChanging(true);
        setSelectedAvatar(avatarId);
        
        try {
            const avatarData = AVATAR_OPTIONS.find(avatar => avatar.id === avatarId);
            // Store avatar info in localStorage for now (until database migration can be run)
            const avatarString = JSON.stringify({
                type: avatarData.type,
                value: avatarData.value,
                id: avatarData.id
            });
            
            localStorage.setItem('user_avatar_preference', avatarString);
            console.log('Avatar updated successfully in localStorage');
            
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
        if (avatar.type === 'emoji') {
            return (
                <div className={`${size} rounded-full bg-primary-100 flex items-center justify-center text-2xl`}>
                    {avatar.value}
                </div>
            );
        } else {
            // Initial avatar - will be handled by parent component
            return (
                <div className={`${size} rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg`}>
                    A
                </div>
            );
        }
    };

    return (
        <div className={className}>
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Choose Your Avatar
                </h3>
                <p className="text-sm text-gray-600">
                    Select an avatar that represents you best
                </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {AVATAR_OPTIONS.map((avatar) => (
                    <div
                        key={avatar.id}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 text-center transition-all duration-200 hover:shadow-md ${
                            selectedAvatar === avatar.id
                                ? 'border-primary-300 bg-primary-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                        } ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleAvatarChange(avatar.id)}
                    >
                        {/* Avatar Preview */}
                        <div className="flex justify-center mb-2">
                            {renderAvatar(avatar, 'w-10 h-10')}
                        </div>
                        
                        {/* Avatar Name */}
                        <p className={`text-xs font-medium ${
                            selectedAvatar === avatar.id ? 'text-primary-700' : 'text-gray-700'
                        }`}>
                            {avatar.name}
                        </p>

                        {/* Selected Indicator */}
                        {selectedAvatar === avatar.id && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                        )}

                        {/* Loading Overlay */}
                        {isChanging && selectedAvatar !== avatar.id && (
                            <div className="absolute inset-0 bg-white bg-opacity-50 rounded-lg flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Your avatar will appear in the header and throughout the platform
                </p>
            </div>
        </div>
    );
}