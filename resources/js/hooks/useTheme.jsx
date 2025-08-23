import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import { getTheme, programConfigToTheme } from '@/Utils/themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Safely get page props, handle cases where usePage might not be available
    let pageProps;
    try {
        pageProps = usePage().props;
    } catch (error) {
        // If usePage is not available, use empty props
        pageProps = {};
    }
    
    const { auth } = pageProps;
    const user = auth?.user;
    
    // Initialize theme from user preference or default
    const [currentTheme, setCurrentTheme] = useState(() => {
        return getTheme(user?.theme_preference || 'default');
    });

    const [programTheme, setProgramTheme] = useState(null);

    // Update theme when user preference changes
    useEffect(() => {
        if (user?.theme_preference) {
            setCurrentTheme(getTheme(user.theme_preference));
        }
    }, [user?.theme_preference]);

    // Function to change user's theme preference
    const changeTheme = useCallback(async (themeId) => {
        const newTheme = getTheme(themeId);
        setCurrentTheme(newTheme);
        
        // Save preference to backend
        try {
            await router.patch(route('profile.update'), {
                theme_preference: themeId
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    }, []);

    // Function to temporarily override theme for specific pages (like lessons)
    const setTemporaryTheme = useCallback((programConfig) => {
        if (programConfig) {
            setProgramTheme(programConfigToTheme(programConfig));
        } else {
            setProgramTheme(null);
        }
    }, []);

    // Get the active theme (program theme takes precedence)
    const getActiveTheme = () => {
        return programTheme || currentTheme;
    };

    const value = {
        theme: getActiveTheme(),
        userTheme: currentTheme,
        programTheme,
        changeTheme,
        setTemporaryTheme,
        isUsingProgramTheme: !!programTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Hook for getting theme classes
export const useThemeClasses = () => {
    const { theme } = useTheme();
    
    return {
        navigation: `bg-gradient-to-r ${theme.primary}`,
        card: `${theme.cardBg} border ${theme.cardBorder} rounded-lg shadow-sm`,
        cardHeader: `${theme.accent} border-b ${theme.cardBorder}`,
        button: `${theme.primarySolid} hover:opacity-90 text-white`,
        buttonOutline: `border-2 ${theme.primaryBorder} ${theme.primaryText} hover:${theme.primarySolid} hover:text-white`,
        accent: theme.accent,
        text: theme.primaryText,
        textMuted: 'text-gray-600',
        border: theme.primaryBorder,
        light: `bg-gradient-to-br ${theme.primaryLight}`,
        success: theme.success,
        warning: theme.warning,
        danger: theme.danger,
        badge: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme.accent} ${theme.primaryText}`,
        progress: `bg-gray-200 rounded-full overflow-hidden`,
        progressBar: `h-full ${theme.primarySolid} transition-all duration-300`,
    };
};