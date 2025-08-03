import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function ThemeManager() {
    const { auth } = usePage().props;
    
    useEffect(() => {
        // Get theme from user preference, localStorage, or default
        let theme = 'default';
        
        // Priority: user preference from database > localStorage > default
        if (auth?.user?.theme_preference) {
            theme = auth.user.theme_preference;
        } else {
            try {
                const savedTheme = localStorage.getItem('user_theme_preference');
                if (savedTheme) {
                    theme = savedTheme;
                }
            } catch (error) {
                console.warn('Could not access localStorage:', error);
            }
        }
        
        // Apply theme to document if it's different from current
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme !== theme) {
            document.documentElement.setAttribute('data-theme', theme);
            console.log('ThemeManager: Applied theme to document:', theme);
        }
        
        // Also save to localStorage if it's different
        try {
            const currentSaved = localStorage.getItem('user_theme_preference');
            if (currentSaved !== theme) {
                localStorage.setItem('user_theme_preference', theme);
            }
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
        
    }, [auth?.user?.theme_preference]);
    
    // This component doesn't render anything
    return null;
}