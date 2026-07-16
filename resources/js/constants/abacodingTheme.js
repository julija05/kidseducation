/**
 * Abacoding design system palette.
 *
 * Single source of truth for the brand colors: `tailwind.config.js` spreads these
 * into `theme.extend.colors` to generate the `aba-*` utility classes, and React
 * components import them directly when a raw CSS color value is required (for
 * example inline `style` props, canvas drawing, or SVG fills) where a Tailwind
 * class cannot be used.
 *
 * Prefer the `aba-*` Tailwind classes in markup; only reach for these constants
 * when a literal color value is unavoidable.
 */
export const ABACODING_COLORS = {
    // Base
    "aba-bg": "#EAF3FF",
    "aba-surface": "#FFFFFF",
    "aba-surface-alt": "#F5F9FF",

    // Ink (text)
    "aba-ink": "#1B2A4A",
    "aba-ink-soft": "#5C6B8A",
    "aba-ink-faint": "#93A2C0",

    // Accent: Coral
    "aba-coral": "#FF6B4D",
    "aba-coral-dark": "#E8543A",
    "aba-coral-soft": "#FFE6DE",

    // Accent: Green
    "aba-green": "#2FAE76",
    "aba-green-soft": "#DEF5EA",

    // Accent: Yellow
    "aba-yellow": "#FFAE1F",
    "aba-yellow-soft": "#FFF1D6",

    // Accent: Purple
    "aba-purple": "#8B6BF2",
    "aba-purple-soft": "#EDE7FF",

    // Accent: Blue
    "aba-blue": "#3D8BFD",
    "aba-blue-soft": "#E3EEFF",

    // Utility
    "aba-rod": "#DCE4F2",
    "aba-line": "#E7EDF7",
};

/**
 * Border radius scale for the design system.
 */
export const ABACODING_RADII = {
    "aba-lg": "26px",
    "aba-md": "18px",
    "aba-sm": "12px",
};

/**
 * Elevation scale for the design system.
 */
export const ABACODING_SHADOWS = {
    "aba-card": "0 10px 30px rgba(27,42,74,0.07)",
    "aba-sm": "0 4px 12px rgba(27,42,74,0.06)",
    "aba-coral": "0 8px 18px rgba(255,107,77,0.35)",
};
