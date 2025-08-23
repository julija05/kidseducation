import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],
    safelist: [
        "bg-blue-600",
        "bg-blue-700",
        "bg-blue-100",
        "text-blue-900",
        "hover:bg-blue-700",
        "bg-pink-600",
        "bg-pink-700",
        "bg-pink-100",
        "text-pink-900",
        "hover:bg-pink-700",
        "bg-purple-600",
        "bg-purple-700",
        "bg-purple-100",
        "text-purple-900",
        "hover:bg-purple-700",
        "bg-green-600",
        "bg-green-700",
        "bg-green-100",
        "text-green-900",
        "hover:bg-green-700",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
                montserrat: ["Montserrat", "serif"],
                shantell: ["Shantell Sans", "serif"],
            },
        },
    },

    plugins: [forms],
};
