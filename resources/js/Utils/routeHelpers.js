import { usePage } from '@inertiajs/react';

/**
 * Custom route helper that preserves current locale parameter
 * Usage: routeWithLocale('about.index') -> '/about?locale=en' (if current locale is en)
 */
export function useRouteWithLocale() {
    const page = usePage();
    const currentLocale = page.props.locale?.current;
    
    const routeWithLocale = (routeName, parameters = {}, absolute = false) => {
        try {
            // Get the base route URL
            const baseUrl = route(routeName, parameters, absolute);
            
            // If no current locale or locale is default, return base URL
            if (!currentLocale || currentLocale === 'mk') {
                return baseUrl;
            }
            
            // Add locale parameter to preserve current language
            const url = new URL(baseUrl, window.location.origin);
            url.searchParams.set('locale', currentLocale);
            
            return absolute ? url.toString() : url.pathname + url.search;
        } catch (error) {
            console.warn(`Route '${routeName}' not found`, error);
            return '#';
        }
    };
    
    return { routeWithLocale, currentLocale };
}

/**
 * Standalone function to get route with current locale (for use outside React components)
 */
export function getRouteWithLocale(routeName, parameters = {}, currentLocale = null) {
    try {
        // Get the base route URL
        const baseUrl = route(routeName, parameters);
        
        // If no current locale or locale is default, return base URL
        if (!currentLocale || currentLocale === 'mk') {
            return baseUrl;
        }
        
        // Add locale parameter to preserve current language
        const url = new URL(baseUrl, window.location.origin);
        url.searchParams.set('locale', currentLocale);
        
        return url.pathname + url.search;
    } catch (error) {
        console.warn(`Route '${routeName}' not found`, error);
        return '#';
    }
}

/**
 * Function to preserve current URL parameters when navigating
 */
export function preserveCurrentParams(newUrl, paramsToPreserve = ['locale']) {
    try {
        const currentParams = new URLSearchParams(window.location.search);
        const newUrlObj = new URL(newUrl, window.location.origin);
        
        paramsToPreserve.forEach(param => {
            const currentValue = currentParams.get(param);
            if (currentValue && !newUrlObj.searchParams.has(param)) {
                newUrlObj.searchParams.set(param, currentValue);
            }
        });
        
        return newUrlObj.pathname + newUrlObj.search;
    } catch (error) {
        console.warn('Error preserving URL parameters', error);
        return newUrl;
    }
}