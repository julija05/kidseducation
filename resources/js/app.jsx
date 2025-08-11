import "../css/app.css";
import "./bootstrap";

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
        console.log('Theme initialized:', savedTheme);
        console.log('Data-theme attribute set to:', document.documentElement.getAttribute('data-theme'));
    } catch (error) {
        console.warn('Could not initialize theme:', error);
        document.documentElement.setAttribute('data-theme', 'default');
    }
}

// Initialize theme before React renders
initializeTheme();

// Check for pending language switches and force reload if needed
function checkPendingLanguageSwitch() {
    const pendingSwitch = localStorage.getItem('pending_language_switch');
    const forceReload = localStorage.getItem('force_language_reload');
    
    if (pendingSwitch && forceReload) {
        const timestamp = parseInt(forceReload);
        const now = Date.now();
        
        // If the switch was initiated recently (within 10 seconds)
        if ((now - timestamp) < 10000) {
            // Clear the pending switch flags
            localStorage.removeItem('pending_language_switch');
            localStorage.removeItem('force_language_reload');
            
            // Force a hard reload to ensure clean state
            if (performance.navigation.type !== performance.navigation.TYPE_RELOAD) {
                console.log('Forcing reload for language switch...');
                window.location.reload(true);
                return true;
            }
        } else {
            // Clean up old flags
            localStorage.removeItem('pending_language_switch');
            localStorage.removeItem('force_language_reload');
        }
    }
    return false;
}

// Check for pending language switches
if (!checkPendingLanguageSwitch()) {
    // Only continue with normal app initialization if no reload is needed

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

} // End of the if statement for checkPendingLanguageSwitch
