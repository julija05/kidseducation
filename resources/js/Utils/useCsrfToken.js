import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage CSRF token and handle token expiration
 */
export function useCsrfToken() {
    const { csrf_token } = usePage().props;
    const tokenRef = useRef(csrf_token);

    useEffect(() => {
        // Update CSRF token in Axios defaults
        if (window.axios && csrf_token) {
            window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf_token;
            tokenRef.current = csrf_token;
        }

        // Update meta tag for Laravel
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag && csrf_token) {
            metaTag.setAttribute('content', csrf_token);
        }
    }, [csrf_token]);

    /**
     * Get the current CSRF token
     */
    const getToken = () => {
        return tokenRef.current || csrf_token || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    };

    /**
     * Refresh CSRF token from server
     */
    const refreshToken = async () => {
        try {
            const response = await fetch('/csrf-token', {
                method: 'GET',
                credentials: 'same-origin',
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.csrf_token) {
                    tokenRef.current = data.csrf_token;
                    
                    // Update Axios defaults
                    if (window.axios) {
                        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = data.csrf_token;
                    }
                    
                    // Update meta tag
                    const metaTag = document.querySelector('meta[name="csrf-token"]');
                    if (metaTag) {
                        metaTag.setAttribute('content', data.csrf_token);
                    }
                    
                    return data.csrf_token;
                }
            }
        } catch (error) {
            console.warn('Failed to refresh CSRF token:', error);
        }
        return null;
    };

    return {
        token: getToken(),
        refreshToken,
    };
}

/**
 * Create a CSRF token refresh endpoint route
 */
export function setupCsrfTokenRefresh() {
    // This would be called from app.jsx to set up the refresh endpoint
    // The actual endpoint needs to be created in Laravel routes
}