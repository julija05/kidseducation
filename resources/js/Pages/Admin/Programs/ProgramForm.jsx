import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import FormField from "@/Components/Form/FormField";
import { iconMap } from "@/Utils/iconMapping";

// Single Responsibility: Manage program form state and render form fields
export default function ProgramForm({ formData = {}, onSubmit }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: formData.name || "",
        description: formData.description || "",
        duration: formData.duration || "",
        price: formData.price || "",
        requires_monthly_payment: formData.requires_monthly_payment || false,
        icon: formData.icon || "BookOpen",
        color: formData.color || "bg-blue-600",
        light_color: formData.light_color || "bg-blue-100",
        border_color: formData.border_color || "border-blue-200",
        text_color: formData.text_color || "text-blue-900",
        _method: formData.id ? "PUT" : "POST",
    });

    // Update form data when formData prop changes
    useEffect(() => {
        if (formData.id) {
            setData({
                name: formData.name || "",
                description: formData.description || "",
                duration: formData.duration || "",
                price: formData.price || "",
                requires_monthly_payment: formData.requires_monthly_payment || false,
                icon: formData.icon || "BookOpen",
                color: formData.color || "bg-blue-600",
                light_color: formData.light_color || "bg-blue-100",
                border_color: formData.border_color || "border-blue-200",
                text_color: formData.text_color || "text-blue-900",
                _method: "PUT",
            });
        }
    }, [formData]);

    const isUpdate = Boolean(formData.id);

    const handleFieldChange = (e) => {
        const name = e.target.name;
        let value;
        
        if (e.target.type === 'file') {
            value = e.target.files[0];
        } else if (e.target.type === 'checkbox') {
            value = e.target.checked;
        } else {
            value = e.target.value;
        }
        
        setData(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (processing) {
            return;
        }
        
        if (onSubmit) {
            onSubmit(data, post, put, {
                forceFormData: true,
                preserveScroll: true,
                preserveState: false,
            });
        }
    };

    const formFields = [
        {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            required: true,
        },
        {
            name: "duration",
            label: "Duration",
            type: "text",
            required: true,
        },
        {
            name: "price",
            label: "Price (€)",
            type: "number",
            step: "0.01",
            required: true,
        },
        {
            name: "requires_monthly_payment",
            label: "Requires Monthly Payment",
            type: "checkbox",
            description: "If checked, admin can block user access for non-payment",
        },
    ];

    return (
        <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Basic form fields */}
                <div className="space-y-4 sm:space-y-6">
                    {formFields.map((field) => (
                        <FormField
                            key={field.name}
                            {...field}
                            value={data[field.name]}
                            checked={field.type === 'checkbox' ? data[field.name] : undefined}
                            onChange={handleFieldChange}
                            error={errors[field.name]}
                        />
                    ))}
                </div>

                {/* Icon Selection */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Program Icon
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                        {Object.entries(iconMap).map(([iconName, IconComponent]) => (
                            <button
                                key={iconName}
                                type="button"
                                onClick={() => setData('icon', iconName)}
                                className={`p-3 sm:p-4 rounded-lg border-2 flex flex-col items-center space-y-1 sm:space-y-2 transition-all min-h-[80px] sm:min-h-[88px] ${
                                    data.icon === iconName
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <IconComponent size={24} className="text-gray-700 sm:w-8 sm:h-8" />
                                <span className="text-xs text-gray-600 text-center leading-tight">
                                    {iconName}
                                </span>
                            </button>
                        ))}
                    </div>
                    {errors.icon && <div className="text-red-500 text-sm mt-1">{errors.icon}</div>}
                </div>

                {/* Color Theme Selection */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Color Theme
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {[
                            { name: 'Blue', color: 'bg-blue-600', light: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-200' },
                            { name: 'Purple', color: 'bg-purple-600', light: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-200' },
                            { name: 'Green', color: 'bg-green-600', light: 'bg-green-100', text: 'text-green-900', border: 'border-green-200' },
                            { name: 'Orange', color: 'bg-orange-600', light: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-200' },
                            { name: 'Pink', color: 'bg-pink-600', light: 'bg-pink-100', text: 'text-pink-900', border: 'border-pink-200' },
                            { name: 'Indigo', color: 'bg-indigo-600', light: 'bg-indigo-100', text: 'text-indigo-900', border: 'border-indigo-200' },
                        ].map((theme) => (
                            <button
                                key={theme.name}
                                type="button"
                                onClick={() => {
                                    setData({
                                        ...data,
                                        color: theme.color,
                                        light_color: theme.light,
                                        text_color: theme.text,
                                        border_color: theme.border,
                                    });
                                }}
                                className={`p-3 sm:p-4 rounded-lg border-2 flex items-center space-x-3 transition-all min-h-[60px] sm:min-h-[68px] ${
                                    data.color === theme.color
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${theme.color} flex-shrink-0`}></div>
                                <div className="text-left min-w-0 flex-1">
                                    <div className="font-medium text-sm sm:text-base">{theme.name}</div>
                                    <div className="text-xs sm:text-sm text-gray-500 truncate">{theme.color}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit button */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 sm:py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium min-h-[44px]"
                    >
                        {processing
                            ? "Saving..."
                            : isUpdate
                            ? "Update Program"
                            : "Create Program"}
                    </button>

                    <a
                        href="/admin/programs"
                        className="w-full sm:w-auto bg-gray-500 text-white px-6 py-3 sm:py-2 rounded hover:bg-gray-600 font-medium min-h-[44px] flex items-center justify-center text-center"
                    >
                        Cancel
                    </a>
                </div>
            </form>
        </div>
    );
}
