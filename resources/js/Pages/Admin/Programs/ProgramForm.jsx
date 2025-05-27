import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import FormField from "@/Components/Form/FormField";
import ImagePreview from "@/Components/ImagePreview/ImagePreview";
import { FormSubmitHandler } from "@/Components/Handlers/FormSubmitHandler";

// Single Responsibility: Manage program form state and render form fields
export default function ProgramForm({ formData = {} }) {
    const { data, setData, post, processing, errors } = useForm({
        name: formData.name || "",
        description: formData.description || "",
        duration: formData.duration || "",
        price: formData.price || "",
        image: null,
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
                image: null, // Always null for file input
                _method: "PUT",
            });
        }
    }, [formData]);

    const submitHandler = new FormSubmitHandler(post, route);
    const isUpdate = Boolean(formData.id);

    const handleFieldChange = (name, value) => {
        setData(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const onSuccess = () => {
            console.log(`${isUpdate ? "Update" : "Create"} successful`);
            // Flash message will be handled by the backend redirect
        };

        const onError = (errors) => {
            console.log(`${isUpdate ? "Update" : "Create"} errors:`, errors);
            // You could add client-side error handling here if needed
        };

        if (isUpdate) {
            submitHandler.handleUpdate(data, formData.id, onSuccess, onError);
        } else {
            submitHandler.handleCreate(data, onSuccess, onError);
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
    ];

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
            {formFields.map((field) => (
                <FormField
                    key={field.name}
                    {...field}
                    value={data[field.name]}
                    onChange={handleFieldChange}
                    error={errors[field.name]}
                />
            ))}

            <div>
                <label className="block text-sm font-medium">
                    Image (optional)
                </label>

                <ImagePreview imagePath={formData.image} />

                <FormField
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFieldChange}
                    error={errors.image}
                    label=""
                />
            </div>

            <button
                type="submit"
                disabled={processing}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {processing
                    ? "Saving..."
                    : isUpdate
                    ? "Update Program"
                    : "Create Program"}
            </button>
        </form>
    );
}
