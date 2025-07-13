export const getCsrfToken = () => {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute("content") : "";
};

export const getResourceTypeColor = (type, isSelected = false) => {
    const { RESOURCE_COLOR_SCHEMES } = require("@/constants/resourceTypes");
    
    const defaultScheme = {
        base: "border-gray-200 text-gray-700",
        selected: "bg-gray-100 border-gray-400",
        hover: "hover:bg-gray-50",
    };

    const scheme = RESOURCE_COLOR_SCHEMES[type] || defaultScheme;
    const selectedClass = isSelected ? scheme.selected : "";

    return `${scheme.base} ${selectedClass} ${scheme.hover} transition-all cursor-pointer`;
};

// resources/js/utils/youtube.js
export const isYouTubeUrl = (url) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
};

export const extractYouTubeVideoId = (url) => {
    const match = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? match[1] : null;
};

export const getYouTubeEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`;
};
