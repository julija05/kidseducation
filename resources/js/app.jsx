import "../css/app.css";
import "./bootstrap";
import "./routeOverride"; // Global route override for locale preservation

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { router } from "@inertiajs/react";
import { refreshCsrfToken, initializeCsrfManagement } from './utils/csrf.js';

const appName = import.meta.env.VITE_APP_NAME || "Abacoding";

// Initialize theme from localStorage immediately
function initializeTheme() {
    try {
        const savedTheme = localStorage.getItem('user_theme_preference') || 'default';
        document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (error) {
        console.warn('Could not initialize theme:', error);
        document.documentElement.setAttribute('data-theme', 'default');
    }
}

// Initialize theme before React renders
initializeTheme();

// Initialize CSRF management
initializeCsrfManagement();

// Language switching logic removed to prevent auto-switching issues
// Clear any existing localStorage flags from previous versions
try {
    localStorage.removeItem('pending_language_switch');
    localStorage.removeItem('force_language_reload');
} catch (error) {
    // Ignore localStorage access errors
}


createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: "#4B5563",
    },
});

// Handle authentication and CSRF errors
router.on('error', async (event) => {
    const { detail } = event
    
    // Handle 401 (authentication) errors - session expired
    if (detail.response && detail.response.status === 401) {
        console.log('Session expired, redirecting to login...')
        
        // If the response includes a redirect URL, use it
        if (detail.response.data && detail.response.data.redirect) {
            window.location.href = detail.response.data.redirect
        } else {
            // Fallback to login route
            window.location.href = '/login'
        }
        
        return false // Prevent default error handling
    }
    
    // Handle 412 (Precondition Failed) and 419 (CSRF token mismatch) errors
    if (detail.response && (detail.response.status === 419 || detail.response.status === 412)) {
        console.log('CSRF token mismatch or precondition failed, attempting to refresh token...')
        
        try {
            // Try to refresh the CSRF token instead of immediately reloading
            await refreshCsrfToken()
            console.log('CSRF token refreshed successfully. Please try your action again.')
            
            // Don't reload - let the user retry their action
            return false
        } catch (error) {
            console.error('Failed to refresh CSRF token:', error)
            
            // Only reload as last resort
            console.log('Could not refresh token, reloading page...')
            window.location.reload()
            return false
        }
    }
    
    // Handle 403 (Forbidden) errors to prevent endless polling loops
    if (detail.response && detail.response.status === 403) {
        console.error('403 Forbidden error:', detail.response.data)
        
        // If this is a chat-related 403 error, show user a message and stop polling
        if (detail.request.responseURL && detail.request.responseURL.includes('/admin/chat/')) {
            console.error('Chat access denied. Stopping polling to prevent endless requests.')
            
            // Optional: Show user notification
            if (detail.response.data && detail.response.data.debug_url) {
                console.log('Debug info available at:', detail.response.data.debug_url)
            }
            
            // Don't reload for 403 errors - let the user handle it manually
            return false
        }
    }
});

