/**
 * Chip - Small colored status pill ("Awesome!", "Keep practicing", etc.)
 *
 * @param {React.ReactNode} children - Chip text
 * @param {"green" | "blue" | "yellow" | "purple" | "coral" | "neutral"} variant - Color variant
 * @param {string} className - Additional CSS classes
 */
export default function Chip({ children, variant = "green", className = "" }) {
    const variantStyles = {
        green: "bg-aba-green-soft text-aba-green",
        blue: "bg-aba-blue-soft text-aba-blue",
        yellow: "bg-aba-yellow-soft text-[#B9790A]",
        purple: "bg-aba-purple-soft text-aba-purple",
        coral: "bg-aba-coral-soft text-aba-coral-dark",
        neutral: "bg-aba-surface-alt text-aba-ink-soft",
    };

    return (
        <span
            className={`
                text-[11px] font-extrabold
                py-[5px] px-[10px]
                rounded-[20px]
                text-center whitespace-nowrap
                ${variantStyles[variant] || variantStyles.green}
                ${className}
            `}
        >
            {children}
        </span>
    );
}

/**
 * Returns the appropriate chip variant and label based on percentage
 *
 * @param {number} percent - Progress percentage
 * @returns {{ variant: string, label: string }}
 */
export function getChipForPercent(percent) {
    if (percent >= 75) {
        return { variant: "green", label: "Awesome!" };
    } else if (percent >= 50) {
        return { variant: "blue", label: "Good job!" };
    } else if (percent >= 25) {
        return { variant: "yellow", label: "Keep practicing" };
    } else {
        return { variant: "purple", label: "Starting out" };
    }
}
