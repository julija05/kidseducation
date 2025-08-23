export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-lg border border-transparent px-6 py-3 text-sm font-medium text-white shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    disabled && 'opacity-50'
                } ` + className
            }
            style={{
                backgroundColor: `rgb(var(--primary-600, 37 99 235))`,
                borderColor: `rgb(var(--primary-600, 37 99 235))`,
                '--tw-ring-color': `rgb(var(--primary-500, 59 130 246))`,
            }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.target.style.backgroundColor = `rgb(var(--primary-700, 29 78 216))`;
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.target.style.backgroundColor = `rgb(var(--primary-600, 37 99 235))`;
                }
            }}
            onFocus={(e) => {
                if (!disabled) {
                    e.target.style.backgroundColor = `rgb(var(--primary-700, 29 78 216))`;
                }
            }}
            onBlur={(e) => {
                if (!disabled) {
                    e.target.style.backgroundColor = `rgb(var(--primary-600, 37 99 235))`;
                }
            }}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
