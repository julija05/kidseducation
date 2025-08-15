// Global route override to preserve locale parameters
// This ensures all route() calls automatically preserve the current locale

// Store the original route function
const originalRoute = window.route;

// Override the global route function
window.route = function(name, parameters = {}, absolute = false) {
    try {
        // Get the base URL from the original route function
        const baseUrl = originalRoute(name, parameters, absolute);
        
        // Get current locale from URL
        const currentParams = new URLSearchParams(window.location.search);
        const currentLocale = currentParams.get('locale');
        
        // If no locale or locale is default (mk), return base URL
        if (!currentLocale || currentLocale === 'mk') {
            return baseUrl;
        }
        
        // Add locale parameter to preserve current language
        const url = new URL(baseUrl, window.location.origin);
        
        // Only add locale if it's not already present
        if (!url.searchParams.has('locale')) {
            url.searchParams.set('locale', currentLocale);
        }
        
        return absolute ? url.toString() : url.pathname + url.search;
    } catch (error) {
        // Fallback to original function if there's an error
        console.warn('Error in route override:', error);
        return originalRoute(name, parameters, absolute);
    }
};

// Preserve the original function for cases where we need it
window.originalRoute = originalRoute;