// Single Responsibility: Handle individual form field rendering and validation
export default function FormField({
    label,
    name,
    type = "text",
    value,
    onChange,
    error,
    required = false,
    ...props
}) {
    const inputProps = {
        type,
        value: type === "file" ? undefined : value,
        onChange: (e) => {
            const newValue =
                type === "file" ? e.target.files[0] : e.target.value;
            onChange(name, newValue);
        },
        className: "mt-1 block w-full border-gray-300 rounded-md shadow-sm",
        ...props,
    };

    const InputComponent = type === "textarea" ? "textarea" : "input";

    return (
        <div>
            <label className="block text-sm font-medium">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <InputComponent {...inputProps} />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
