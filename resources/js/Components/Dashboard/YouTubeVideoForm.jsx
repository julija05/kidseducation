import React, { useState } from "react";
import { Plus, Video, X } from "lucide-react";

export default function YouTubeVideoForm({ lesson, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        youtube_url: "",
        is_required: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = () => {
        setIsSubmitting(true);
        setErrors({});

        // In a real implementation, you would use router.post here
        // router.post(route('admin.lessons.resources.add-youtube', lesson.id), formData, { ... });

        // Simulated success for demo
        setTimeout(() => {
            onSuccess && onSuccess();
            onClose && onClose();
            setIsSubmitting(false);
        }, 1000);
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: null,
            }));
        }
    };

    const extractVideoTitle = (url) => {
        // Simple function to suggest a title based on the URL
        const match = url.match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        );
        if (match) {
            return `Video: ${match[1]}`;
        }
        return "";
    };

    const handleUrlBlur = () => {
        if (formData.youtube_url && !formData.title) {
            const suggestedTitle = extractVideoTitle(formData.youtube_url);
            if (suggestedTitle) {
                setFormData((prev) => ({
                    ...prev,
                    title: suggestedTitle,
                }));
            }
        }
    };

    const isValidForm = formData.youtube_url && formData.title;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <Video className="mr-2 text-red-500" size={24} />
                        <h3 className="text-lg font-semibold">
                            Add YouTube Video
                        </h3>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            YouTube URL *
                        </label>
                        <input
                            type="url"
                            value={formData.youtube_url}
                            onChange={(e) =>
                                handleChange("youtube_url", e.target.value)
                            }
                            onBlur={handleUrlBlur}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.youtube_url
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        />
                        {errors.youtube_url && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.youtube_url}
                            </p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                            For private videos, make sure they're set to
                            "Unlisted" for embedding to work
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Video Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                handleChange("title", e.target.value)
                            }
                            placeholder="Enter a descriptive title for the video"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.title
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                handleChange("description", e.target.value)
                            }
                            placeholder="Brief description of what this video covers"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_required"
                            checked={formData.is_required}
                            onChange={(e) =>
                                handleChange("is_required", e.target.checked)
                            }
                            className="mr-2"
                        />
                        <label
                            htmlFor="is_required"
                            className="text-sm text-gray-700"
                        >
                            Required for lesson completion
                        </label>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !isValidForm}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                "Adding..."
                            ) : (
                                <>
                                    <Plus size={16} className="mr-1" />
                                    Add Video
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <h4 className="font-medium text-blue-900 mb-1">
                        YouTube Privacy Settings:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>
                            • <strong>Unlisted:</strong> Video can be embedded
                            and viewed by anyone with the link
                        </li>
                        <li>
                            • <strong>Private:</strong> Only you can view, won't
                            work for students
                        </li>
                        <li>
                            • <strong>Public:</strong> Anyone can find and view
                            the video
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
