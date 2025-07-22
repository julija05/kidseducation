// Single Responsibility: Handle individual form field rendering and validation
export default function FormField({
    label,
    name,
    type = "text",
    value,
    onChange,
    error,
    required = false,
    helper,
    children,
    ...props
}) {
    const baseClassName = `mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`;
    
    const handleChange = (e) => {
        if (onChange) {
            // Just pass the event directly - let the parent handle it
            onChange(e);
        }
    };

    const renderInput = () => {
        if (type === "textarea") {
            return (
                <textarea
                    name={name}
                    value={value || ""}
                    onChange={handleChange}
                    className={baseClassName}
                    {...props}
                />
            );
        }
        
        if (type === "select") {
            return (
                <select
                    name={name}
                    value={value || ""}
                    onChange={handleChange}
                    className={baseClassName}
                    {...props}
                >
                    {children}
                </select>
            );
        }

        return (
            <input
                type={type}
                name={name}
                value={type === "file" ? undefined : (value || "")}
                onChange={handleChange}
                className={baseClassName}
                {...props}
            />
        );
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {renderInput()}
            {helper && <p className="text-gray-500 text-sm mt-1">{helper}</p>}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
