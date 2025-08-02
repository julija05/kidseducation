import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";

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
