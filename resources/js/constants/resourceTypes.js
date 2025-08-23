export const RESOURCE_TYPES = {
    VIDEO: "video",
    DOCUMENT: "document",
    LINK: "link",
    DOWNLOAD: "download",
    INTERACTIVE: "interactive",
    QUIZ: "quiz",
};

export const RESOURCE_ICONS = {
    [RESOURCE_TYPES.VIDEO]: { icon: "Video", color: "text-blue-600" },
    [RESOURCE_TYPES.DOCUMENT]: { icon: "FileText", color: "text-green-600" },
    [RESOURCE_TYPES.LINK]: { icon: "ExternalLink", color: "text-purple-600" },
    [RESOURCE_TYPES.DOWNLOAD]: { icon: "Download", color: "text-indigo-600" },
    [RESOURCE_TYPES.INTERACTIVE]: {
        icon: "Calculator",
        color: "text-orange-600",
    },
    [RESOURCE_TYPES.QUIZ]: { icon: "Trophy", color: "text-yellow-600" },
};

export const RESOURCE_COLOR_SCHEMES = {
    [RESOURCE_TYPES.VIDEO]: {
        base: "border-blue-200 text-blue-700",
        selected: "bg-blue-100 border-blue-400",
        hover: "hover:bg-blue-50",
    },
    [RESOURCE_TYPES.DOCUMENT]: {
        base: "border-green-200 text-green-700",
        selected: "bg-green-100 border-green-400",
        hover: "hover:bg-green-50",
    },
    [RESOURCE_TYPES.LINK]: {
        base: "border-purple-200 text-purple-700",
        selected: "bg-purple-100 border-purple-400",
        hover: "hover:bg-purple-50",
    },
    [RESOURCE_TYPES.DOWNLOAD]: {
        base: "border-indigo-200 text-indigo-700",
        selected: "bg-indigo-100 border-indigo-400",
        hover: "hover:bg-indigo-50",
    },
    [RESOURCE_TYPES.INTERACTIVE]: {
        base: "border-orange-200 text-orange-700",
        selected: "bg-orange-100 border-orange-400",
        hover: "hover:bg-orange-50",
    },
    [RESOURCE_TYPES.QUIZ]: {
        base: "border-yellow-200 text-yellow-700",
        selected: "bg-yellow-100 border-yellow-400",
        hover: "hover:bg-yellow-50",
    },
};
