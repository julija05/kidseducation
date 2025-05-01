import React from "react";

const Button = ({
    children,
    variant = "default",
    className = "",
    ...props
}) => {
    const base = "px-4 py-2 rounded-md font-medium transition duration-200";
    const styles = {
        default: "bg-indigo-600 text-white hover:bg-indigo-700",
        ghost: "bg-transparent text-indigo-600 hover:underline",
    };

    return (
        <button
            className={`${base} ${styles[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
