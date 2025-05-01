import React from "react";

const Badge = ({ children, className = "" }) => {
    return (
        <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full bg-indigo-200 text-indigo-800 ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge;
