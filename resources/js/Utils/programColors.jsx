export const programColorMap = {
    blue: {
        color: "bg-blue-600 hover:bg-blue-700",
        lightColor: "bg-blue-100",
        textColor: "text-blue-900",
    },
    pink: {
        color: "bg-pink-600 hover:bg-pink-700",
        lightColor: "bg-pink-100",
        textColor: "text-pink-900",
    },
    purple: {
        color: "bg-purple-600 hover:bg-purple-700",
        lightColor: "bg-purple-100",
        textColor: "text-purple-900",
    },
    green: {
        color: "bg-green-600 hover:bg-green-700",
        lightColor: "bg-green-100",
        textColor: "text-green-900",
    },
    // Add more colors as needed
};

export const getProgramColors = (colorKey) => {
    return programColorMap[colorKey] || programColorMap.blue; // Default to blue
};
