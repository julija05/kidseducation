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
        console.log('Theme initialized:', savedTheme);
        console.log('Data-theme attribute set to:', document.documentElement.getAttribute('data-theme'));
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

