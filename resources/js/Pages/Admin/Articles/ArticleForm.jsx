import { useEffect } from "react";
import { useForm } from "@inertiajs/react";

export default function ArticleForm({ formData = {}, categories = {}, selectedCategory = "how_to_use", onSubmit, migrationRequired = false }) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: formData.title || "",
        content: formData.content || "",
        image: null,
        category: formData.category || selectedCategory,
        is_published: formData.is_published ?? true,
        _method: formData.id ? "PUT" : "POST",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(data, post, put, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: false,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                />
                {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
            </div>

            {/* Category selection - only show if migration has been applied */}
            {!migrationRequired && Object.keys(categories).length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                        value={data.category}
                        onChange={(e) => setData("category", e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    >
                        {Object.entries(categories).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                    {errors.category && (
                        <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                    )}
                </div>
            )}

            {migrationRequired && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Article categories will be available after running the database migration.
                    </p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                    value={data.content}
                    onChange={(e) => setData("content", e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm mt-1 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    rows="10"
                    required
                    placeholder="Write your article content here. You can use markdown formatting."
                />
                {errors.content && (
                    <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Image (optional)
                </label>

                {formData.image && (
                    <div className="mb-3">
                        <img
                            src={formData.image}
                            alt="Current"
                            className="w-48 h-auto rounded border"
                            onError={(e) => (e.target.style.display = "none")}
                        />
                        <p className="text-sm text-gray-600 mt-1">Current image</p>
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setData("image", e.target.files[0])}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.image && (
                    <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                )}
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="is_published"
                    checked={data.is_published}
                    onChange={(e) => setData("is_published", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">
                    Publish article immediately
                </label>
                {errors.is_published && (
                    <p className="text-red-500 text-sm mt-1">{errors.is_published}</p>
                )}
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {processing
                        ? "Saving..."
                        : formData.id
                        ? "Update Article"
                        : "Create Article"}
                </button>
                
                <a
                    href="/admin/articles"
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                >
                    Cancel
                </a>
            </div>
        </form>
    );
}