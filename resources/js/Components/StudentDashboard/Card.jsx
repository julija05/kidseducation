/**
 * Background tokens a Card can be rendered on.
 *
 * Exposed as a prop rather than left to `className` because Tailwind resolves
 * competing background utilities by stylesheet order, not by the order they are
 * listed on the element - so an override passed via `className` would be unreliable.
 */
const CARD_SURFACES = {
    default: "bg-aba-surface",
    alt: "bg-aba-surface-alt",
};

/**
 * Card - Base white rounded-shadow container used throughout the app
 *
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {React.ElementType} as - Element/component to render as (defaults to "div"),
 *   so callers can use semantic tags such as "section" or "article"
 * @param {"default" | "alt"} surface - Background token for the card
 * @param {object} props - Remaining props (id, aria-*, ...) forwarded to the element
 */
export default function Card({
    children,
    className = "",
    as: Component = "div",
    surface = "default",
    ...props
}) {
    const surfaceClass = CARD_SURFACES[surface] || CARD_SURFACES.default;

    return (
        <Component
            className={`${surfaceClass} rounded-aba-lg shadow-aba-card p-6 ${className}`}
            {...props}
        >
            {children}
        </Component>
    );
}

/**
 * CardHead - Header section of a card with title and optional link
 *
 * @param {React.ReactNode} children - Header content
 * @param {string} className - Additional CSS classes
 */
export function CardHead({ children, className = "" }) {
    return (
        <div className={`flex items-center justify-between mb-4 ${className}`}>
            {children}
        </div>
    );
}

/**
 * CardTitle - Title section with icon
 *
 * @param {React.ReactNode} icon - Icon element
 * @param {string} iconBg - Background color class for icon container
 * @param {string} iconColor - Text/stroke color class for icon
 * @param {React.ReactNode} children - Title text
 */
export function CardTitle({ icon, iconBg = "bg-aba-blue-soft", iconColor = "text-aba-blue", children }) {
    return (
        <div className="flex items-center gap-[9px] text-[16.5px] font-bold text-aba-ink font-display">
            {icon && (
                <span
                    className={`w-[30px] h-[30px] rounded-[9px] flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}
                >
                    {icon}
                </span>
            )}
            {children}
        </div>
    );
}

/**
 * CardLink - Link appearing on the right side of card header
 *
 * @param {string} href - Link URL
 * @param {React.ReactNode} children - Link text
 */
export function CardLink({ href = "#", onClick, children }) {
    const handleClick = (e) => {
        if (onClick) {
            e.preventDefault();
            onClick(e);
        }
    };

    return (
        <a
            href={href}
            onClick={handleClick}
            className="ml-auto text-[13px] font-extrabold text-aba-coral no-underline flex items-center gap-1 hover:underline focus:outline-none focus:ring-2 focus:ring-aba-coral focus:ring-offset-2 rounded"
        >
            {children}
            <svg
                viewBox="0 0 24 24"
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
            </svg>
        </a>
    );
}
