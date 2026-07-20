export const RESOURCE_TYPES = {
    VIDEO: "video",
    DOCUMENT: "document",
    LINK: "link",
    DOWNLOAD: "download",
    INTERACTIVE: "interactive",
    QUIZ: "quiz",
};

/**
 * Accent from the Abacoding palette used to colour each resource type.
 *
 * Keeping the mapping here (rather than repeating class names per component)
 * means a resource type is recoloured in exactly one place.
 */
export const RESOURCE_ACCENTS = {
    [RESOURCE_TYPES.VIDEO]: "blue",
    [RESOURCE_TYPES.DOCUMENT]: "green",
    [RESOURCE_TYPES.LINK]: "purple",
    [RESOURCE_TYPES.DOWNLOAD]: "coral",
    [RESOURCE_TYPES.INTERACTIVE]: "purple",
    [RESOURCE_TYPES.QUIZ]: "yellow",
};

/**
 * Accent used when a resource has an unknown type.
 */
export const DEFAULT_RESOURCE_ACCENT = "blue";

/**
 * Tailwind classes per accent, written as complete literals so Tailwind's
 * content scanner keeps them in the build.
 */
export const RESOURCE_ACCENT_STYLES = {
    blue: {
        text: "text-aba-blue",
        softBg: "bg-aba-blue-soft",
        border: "border-aba-blue",
        button: "bg-aba-blue hover:brightness-95",
    },
    green: {
        text: "text-aba-green",
        softBg: "bg-aba-green-soft",
        border: "border-aba-green",
        button: "bg-aba-green hover:brightness-95",
    },
    purple: {
        text: "text-aba-purple",
        softBg: "bg-aba-purple-soft",
        border: "border-aba-purple",
        button: "bg-aba-purple hover:brightness-95",
    },
    yellow: {
        text: "text-aba-yellow",
        softBg: "bg-aba-yellow-soft",
        border: "border-aba-yellow",
        button: "bg-aba-yellow hover:brightness-95",
    },
    coral: {
        text: "text-aba-coral",
        softBg: "bg-aba-coral-soft",
        border: "border-aba-coral",
        button: "bg-aba-coral hover:bg-aba-coral-dark",
    },
};

/**
 * Returns the accent style set for a resource type, falling back to the default
 * accent for unknown types.
 *
 * @param {string} type - One of RESOURCE_TYPES
 * @returns {{text: string, softBg: string, border: string, button: string}}
 */
export const getResourceAccentStyles = (type) =>
    RESOURCE_ACCENT_STYLES[RESOURCE_ACCENTS[type] || DEFAULT_RESOURCE_ACCENT];

export const RESOURCE_ICONS = {
    [RESOURCE_TYPES.VIDEO]: { icon: "Video", color: "text-aba-blue" },
    [RESOURCE_TYPES.DOCUMENT]: { icon: "FileText", color: "text-aba-green" },
    [RESOURCE_TYPES.LINK]: { icon: "ExternalLink", color: "text-aba-purple" },
    [RESOURCE_TYPES.DOWNLOAD]: { icon: "Download", color: "text-aba-coral" },
    [RESOURCE_TYPES.INTERACTIVE]: {
        icon: "Calculator",
        color: "text-aba-purple",
    },
    [RESOURCE_TYPES.QUIZ]: { icon: "Trophy", color: "text-aba-yellow" },
};

export const RESOURCE_COLOR_SCHEMES = {
    [RESOURCE_TYPES.VIDEO]: {
        base: "border-aba-line text-aba-ink",
        selected: "bg-aba-blue-soft border-aba-blue",
        hover: "hover:bg-aba-surface-alt",
    },
    [RESOURCE_TYPES.DOCUMENT]: {
        base: "border-aba-line text-aba-ink",
        selected: "bg-aba-green-soft border-aba-green",
        hover: "hover:bg-aba-surface-alt",
    },
    [RESOURCE_TYPES.LINK]: {
        base: "border-aba-line text-aba-ink",
        selected: "bg-aba-purple-soft border-aba-purple",
        hover: "hover:bg-aba-surface-alt",
    },
    [RESOURCE_TYPES.DOWNLOAD]: {
        base: "border-aba-line text-aba-ink",
        selected: "bg-aba-coral-soft border-aba-coral",
        hover: "hover:bg-aba-surface-alt",
    },
    [RESOURCE_TYPES.INTERACTIVE]: {
        base: "border-aba-line text-aba-ink",
        selected: "bg-aba-purple-soft border-aba-purple",
        hover: "hover:bg-aba-surface-alt",
    },
    [RESOURCE_TYPES.QUIZ]: {
        base: "border-aba-line text-aba-ink",
        selected: "bg-aba-yellow-soft border-aba-yellow",
        hover: "hover:bg-aba-surface-alt",
    },
};
