import { useForm } from "@inertiajs/react";
import FormField from "@/Components/Form/FormField";

export default function LessonForm({ 
    formData = {}, 
    availableLevels = [], 
    contentTypes = {}, 
    onSubmit,
    isUpdate = false 
}) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: formData.title || "",
        description: formData.description || "",
        level: formData.level || 1,
        content_type: formData.content_type || "text",
        content_url: formData.content_url || "",
        content_body: formData.content_body || "",
        duration_minutes: formData.duration_minutes || 30,
        order_in_level: formData.order_in_level || 1,
        is_active: formData.is_active !== undefined ? formData.is_active : true,
        _method: isUpdate ? "PUT" : "POST",
    });

    const handleFieldChange = (e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setData(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const onSuccess = () => {
            console.log(`${isUpdate ? "Update" : "Create"} successful`);
        };

        const onError = (errors) => {
            console.log(`${isUpdate ? "Update" : "Create"} errors:`, errors);
        };

        if (onSubmit) {
            onSubmit(data, isUpdate ? put : post);
        }
    };

    const getLevelHelperText = () => {
        if (data.level === 1) {
            return "Level 1 lessons are accessible immediately to new students.";
        }
        return `Level ${data.level} lessons unlock after completing Level ${data.level - 1}.`;
    };

    const getContentTypeDescription = (type) => {
        const descriptions = {
            video: "Video-based lesson with embedded or external video content",
            text: "Text-based reading material or written content",
            interactive: "Interactive exercises, simulations, or activities",
            quiz: "Assessment with questions and answers",
            mixed: "Combination of multiple content types"
        };
        return descriptions[type] || "";
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    name="title"
                    label="Lesson Title"
                    type="text"
                    required
                    value={data.title}
                    onChange={handleFieldChange}
                    error={errors.title}
                    placeholder="e.g., Introduction to Basic Addition"
                />

                <FormField
                    name="duration_minutes"
                    label="Duration (minutes)"
                    type="number"
                    min="1"
                    max="480"
                    required
                    value={data.duration_minutes}
                    onChange={handleFieldChange}
                    error={errors.duration_minutes}
                    helper="Estimated time to complete this lesson"
                />
            </div>

            {/* Description */}
            <FormField
                name="description"
                label="Description"
                type="textarea"
                rows="3"
                value={data.description}
                onChange={handleFieldChange}
                error={errors.description}
                placeholder="Brief description of what students will learn in this lesson"
            />

            {/* Level and Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <FormField
                        name="level"
                        label="Level"
                        type="select"
                        required
                        value={data.level}
                        onChange={handleFieldChange}
                        error={errors.level}
                        helper={getLevelHelperText()}
                    >
                        {availableLevels.map(level => (
                            <option key={level} value={level}>
                                Level {level}
                            </option>
                        ))}
                    </FormField>
                </div>

                <FormField
                    name="order_in_level"
                    label="Order in Level"
                    type="number"
                    min="1"
                    required
                    value={data.order_in_level}
                    onChange={handleFieldChange}
                    error={errors.order_in_level}
                    helper="Position of this lesson within its level"
                />
            </div>

            {/* Content Type */}
            <div>
                <FormField
                    name="content_type"
                    label="Content Type"
                    type="select"
                    required
                    value={data.content_type}
                    onChange={handleFieldChange}
                    error={errors.content_type}
                    helper={getContentTypeDescription(data.content_type)}
                >
                    {Object.entries(contentTypes).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </FormField>
            </div>

            {/* Content URL - Show for video, interactive, or if selected */}
            {(data.content_type === 'video' || data.content_type === 'interactive' || data.content_url) && (
                <FormField
                    name="content_url"
                    label="Content URL"
                    type="url"
                    value={data.content_url}
                    onChange={handleFieldChange}
                    error={errors.content_url}
                    placeholder="https://example.com/video or external content URL"
                    helper={
                        data.content_type === 'video' 
                            ? "URL to video content (YouTube, Vimeo, etc.)"
                            : "URL to external interactive content"
                    }
                />
            )}

            {/* Content Body - Show for text, quiz, mixed, or if has content */}
            {(data.content_type === 'text' || data.content_type === 'quiz' || data.content_type === 'mixed' || data.content_body) && (
                <FormField
                    name="content_body"
                    label="Content Body"
                    type="textarea"
                    rows="8"
                    value={data.content_body}
                    onChange={handleFieldChange}
                    error={errors.content_body}
                    placeholder={
                        data.content_type === 'text' 
                            ? "Enter the lesson content, instructions, or reading material..."
                            : data.content_type === 'quiz'
                            ? "Enter quiz questions and answers..."
                            : "Enter the main lesson content..."
                    }
                    helper="Main content for the lesson. Supports Markdown formatting."
                />
            )}

            {/* Status */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={data.is_active}
                    onChange={handleFieldChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active (visible to students)
                </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {processing ? (isUpdate ? "Updating..." : "Creating...") : (isUpdate ? "Update Lesson" : "Create Lesson")}
                </button>
            </div>
        </form>
    );
}