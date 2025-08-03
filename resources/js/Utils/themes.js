// Theme configuration for the dashboard
export const THEME_VARIANTS = {
    default: {
        id: 'default',
        name: 'Default Blue',
        primary: 'from-blue-600 to-indigo-600',
        primarySolid: 'bg-blue-600',
        primaryLight: 'from-blue-50 to-indigo-50',
        primaryBorder: 'border-blue-300',
        primaryText: 'text-blue-700',
        accent: 'bg-blue-100',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        cardBg: 'bg-white',
        cardBorder: 'border-blue-200',
        navigation: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    },
    purple: {
        id: 'purple',
        name: 'Purple Dreams',
        primary: 'from-purple-600 to-pink-600',
        primarySolid: 'bg-purple-600',
        primaryLight: 'from-purple-50 to-pink-50',
        primaryBorder: 'border-purple-300',
        primaryText: 'text-purple-700',
        accent: 'bg-purple-100',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        cardBg: 'bg-white',
        cardBorder: 'border-purple-200',
        navigation: 'bg-gradient-to-r from-purple-600 to-pink-600',
    },
    green: {
        id: 'green',
        name: 'Nature Green',
        primary: 'from-green-600 to-emerald-600',
        primarySolid: 'bg-green-600',
        primaryLight: 'from-green-50 to-emerald-50',
        primaryBorder: 'border-green-300',
        primaryText: 'text-green-700',
        accent: 'bg-green-100',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        cardBg: 'bg-white',
        cardBorder: 'border-green-200',
        navigation: 'bg-gradient-to-r from-green-600 to-emerald-600',
    },
    orange: {
        id: 'orange',
        name: 'Warm Orange',
        primary: 'from-orange-600 to-red-500',
        primarySolid: 'bg-orange-600',
        primaryLight: 'from-orange-50 to-red-50',
        primaryBorder: 'border-orange-300',
        primaryText: 'text-orange-700',
        accent: 'bg-orange-100',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        cardBg: 'bg-white',
        cardBorder: 'border-orange-200',
        navigation: 'bg-gradient-to-r from-orange-600 to-red-500',
    },
    teal: {
        id: 'teal',
        name: 'Ocean Teal',
        primary: 'from-teal-600 to-cyan-600',
        primarySolid: 'bg-teal-600',
        primaryLight: 'from-teal-50 to-cyan-50',
        primaryBorder: 'border-teal-300',
        primaryText: 'text-teal-700',
        accent: 'bg-teal-100',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        cardBg: 'bg-white',
        cardBorder: 'border-teal-200',
        navigation: 'bg-gradient-to-r from-teal-600 to-cyan-600',
    },
    dark: {
        id: 'dark',
        name: 'Dark Mode',
        primary: 'from-gray-800 to-gray-900',
        primarySolid: 'bg-gray-800',
        primaryLight: 'from-gray-100 to-gray-200',
        primaryBorder: 'border-gray-600',
        primaryText: 'text-gray-100',
        accent: 'bg-gray-700',
        success: 'bg-green-800 text-green-100',
        warning: 'bg-yellow-800 text-yellow-100',
        danger: 'bg-red-800 text-red-100',
        cardBg: 'bg-gray-800',
        cardBorder: 'border-gray-700',
        navigation: 'bg-gradient-to-r from-gray-800 to-gray-900',
    },
};

// Get theme by ID
export const getTheme = (themeId) => {
    return THEME_VARIANTS[themeId] || THEME_VARIANTS.default;
};

// Get all available themes
export const getAllThemes = () => {
    return Object.values(THEME_VARIANTS);
};

// Generate CSS classes for a theme
export const getThemeClasses = (theme) => {
    return {
        navigation: `bg-gradient-to-r ${theme.primary}`,
        card: `${theme.cardBg} border ${theme.cardBorder}`,
        button: `${theme.primarySolid} hover:opacity-90`,
        accent: theme.accent,
        text: theme.primaryText,
        border: theme.primaryBorder,
        light: `bg-gradient-to-br ${theme.primaryLight}`,
    };
};

// Convert legacy program config to theme structure
export const programConfigToTheme = (programConfig) => {
    if (!programConfig) return getTheme('default');
    
    return {
        id: 'custom',
        name: programConfig.name || 'Custom',
        primary: programConfig.color?.replace('bg-gradient-to-r ', '') || 'from-blue-600 to-indigo-600',
        primarySolid: 'bg-blue-600',
        primaryLight: programConfig.lightColor?.replace('bg-gradient-to-br ', '') || 'from-blue-50 to-indigo-50',
        primaryBorder: programConfig.borderColor || 'border-blue-300',
        primaryText: programConfig.textColor || 'text-blue-700',
        accent: 'bg-blue-100',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        cardBg: 'bg-white',
        cardBorder: 'border-blue-200',
        navigation: programConfig.color || 'bg-gradient-to-r from-blue-600 to-indigo-600',
    };
};