import React from "react";
import { useForm } from "@inertiajs/react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";

export default function LessonFormSimple({ 
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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (onSubmit) {
            onSubmit(data, isUpdate ? put : post);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <InputLabel value="Lesson Title" />
                <TextInput
                    type="text"
                    name="title"
                    value={data.title}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('title', e.target.value)}
                    required
                />
                <InputError message={errors.title} className="mt-2" />
            </div>

            {/* Description */}
            <div>
                <InputLabel value="Description" />
                <textarea
                    name="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    rows="3"
                />
                <InputError message={errors.description} className="mt-2" />
            </div>

            {/* Duration */}
            <div>
                <InputLabel value="Duration (minutes)" />
                <TextInput
                    type="number"
                    name="duration_minutes"
                    value={data.duration_minutes}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('duration_minutes', parseInt(e.target.value))}
                    min="1"
                    max="480"
                    required
                />
                <InputError message={errors.duration_minutes} className="mt-2" />
            </div>

            {/* Level */}
            <div>
                <InputLabel value="Level" />
                <select
                    name="level"
                    value={data.level}
                    onChange={(e) => setData('level', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    required
                >
                    {availableLevels.map(level => (
                        <option key={level} value={level}>
                            Level {level}
                        </option>
                    ))}
                </select>
                <InputError message={errors.level} className="mt-2" />
            </div>

            {/* Order in Level */}
            <div>
                <InputLabel value="Order in Level" />
                <TextInput
                    type="number"
                    name="order_in_level"
                    value={data.order_in_level}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('order_in_level', parseInt(e.target.value))}
                    min="1"
                    required
                />
                <InputError message={errors.order_in_level} className="mt-2" />
            </div>

            {/* Content Type */}
            <div>
                <InputLabel value="Content Type" />
                <select
                    name="content_type"
                    value={data.content_type}
                    onChange={(e) => setData('content_type', e.target.value)}
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    required
                >
                    {Object.entries(contentTypes).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
                <InputError message={errors.content_type} className="mt-2" />
            </div>

            {/* Content URL */}
            {(data.content_type === 'video' || data.content_type === 'interactive' || data.content_url) && (
                <div>
                    <InputLabel value="Content URL" />
                    <TextInput
                        type="url"
                        name="content_url"
                        value={data.content_url}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('content_url', e.target.value)}
                    />
                    <InputError message={errors.content_url} className="mt-2" />
                </div>
            )}

            {/* Content Body */}
            {(data.content_type === 'text' || data.content_type === 'quiz' || data.content_type === 'mixed' || data.content_body) && (
                <div>
                    <InputLabel value="Content Body" />
                    <textarea
                        name="content_body"
                        value={data.content_body}
                        onChange={(e) => setData('content_body', e.target.value)}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        rows="8"
                    />
                    <InputError message={errors.content_body} className="mt-2" />
                </div>
            )}

            {/* Active Status */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
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