import { RESOURCE_COLOR_SCHEMES } from "@/constants/resourceTypes";

export const getCsrfToken = () => {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute("content") : "";
};

export const getResourceTypeColor = (type, isSelected = false) => {

    const defaultScheme = {
        base: "border-aba-line text-aba-ink",
        selected: "bg-aba-surface-alt border-aba-ink-faint",
        hover: "hover:bg-aba-surface-alt",
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
