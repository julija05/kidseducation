import "../css/app.css";
import "./bootstrap";
import "./routeOverride"; // Global route override for locale preservation

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { router } from "@inertiajs/react";

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
router.on('error', (event) => {
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
        console.log('CSRF token mismatch or precondition failed, reloading page...')
        
        // Show user-friendly message before reload
        if (detail.response.data && detail.response.data.reload_required) {
            // Optional: Show a brief message before reloading
            const message = detail.response.data.message || 'Session expired. Refreshing page...'
            console.log(message)
        }
        
        // Reload the page to get fresh CSRF tokens
        window.location.reload()
        return false
    }
});

