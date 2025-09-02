import { useEffect } from "react";
import { useForm } from "@inertiajs/react";

export default function ArticleForm({ formData = {}, categories = {}, selectedCategory = "how_to_use", supportedLanguages = {}, onSubmit, migrationRequired = false }) {
    const { data, setData, post, put, processing, errors } = useForm({
        title_en: formData.title_en || formData.title || "",
        content_en: formData.content_en || formData.content || "",
        title_mk: formData.title_mk || "",
        content_mk: formData.content_mk || "",
        image: null,
        category: formData.category || selectedCategory,
        is_published: formData.is_published ?? true,
        _method: formData.id ? "PUT" : "POST",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Use FormData only when image is present, otherwise use regular JSON
        const hasImage = data.image && data.image instanceof File;
        
        onSubmit(data, post, put, {
            forceFormData: hasImage,
            preserveScroll: true,
            preserveState: false,
        });
    };

    return (
        <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Translation section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Article Translations</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* English Fields */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 border-b pb-2 text-sm sm:text-base">🇬🇧 English</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title (English)</label>
                                <input
                                    type="text"
                                    value={data.title_en}
                                    onChange={(e) => setData("title_en", e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-base py-3 sm:py-2 min-h-[44px]"
                                    required
                                />
                                {errors.title_en && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title_en}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Content (English)</label>
                                <textarea
                                    value={data.content_en}
                                    onChange={(e) => setData("content_en", e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-base py-3 sm:py-2"
                                    rows="6"
                                    required
                                    placeholder="Write your article content in English..."
                                />
                                {errors.content_en && (
                                    <p className="text-red-500 text-sm mt-1">{errors.content_en}</p>
                                )}
                            </div>
                        </div>

                        {/* Macedonian Fields */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 border-b pb-2 text-sm sm:text-base">🇲🇰 Macedonian (Македонски)</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title (Macedonian)</label>
                                <input
                                    type="text"
                                    value={data.title_mk}
                                    onChange={(e) => setData("title_mk", e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-base py-3 sm:py-2 min-h-[44px]"
                                    placeholder="Наслов на македонски..."
                                />
                                {errors.title_mk && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title_mk}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Content (Macedonian)</label>
                                <textarea
                                    value={data.content_mk}
                                    onChange={(e) => setData("content_mk", e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-base py-3 sm:py-2"
                                    rows="6"
                                    placeholder="Напишете ја содржината на статијата на македонски..."
                                />
                                {errors.content_mk && (
                                    <p className="text-red-500 text-sm mt-1">{errors.content_mk}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-100 rounded-md">
                        <p className="text-xs sm:text-sm text-blue-800">
                            <strong>Translation Guidelines:</strong> English is required and serves as the fallback language. 
                            Macedonian translation is optional but recommended for better user experience.
                        </p>
                    </div>
                </div>

                {/* Category selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                        value={data.category}
                        onChange={(e) => setData("category", e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-base py-3 sm:py-2 min-h-[44px]"
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

                {/* Image upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image (optional)
                    </label>

                    {formData.image && (
                        <div className="mb-4">
                            <img
                                src={formData.image}
                                alt="Current"
                                className="w-full sm:w-48 h-auto rounded border"
                                onError={(e) => (e.target.style.display = "none")}
                            />
                            <p className="text-sm text-gray-600 mt-2">Current image</p>
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setData("image", e.target.files[0])}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-base py-2 min-h-[44px]"
                    />
                    {errors.image && (
                        <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                    )}
                </div>

                {/* Publish checkbox */}
                <div className="flex items-start sm:items-center">
                    <input
                        type="checkbox"
                        id="is_published"
                        checked={data.is_published}
                        onChange={(e) => setData("is_published", e.target.checked)}
                        className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 sm:mt-0 flex-shrink-0"
                    />
                    <label htmlFor="is_published" className="ml-3 sm:ml-2 block text-sm text-gray-700">
                        Publish article immediately
                    </label>
                    {errors.is_published && (
                        <p className="text-red-500 text-sm mt-1">{errors.is_published}</p>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 sm:py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-h-[44px]"
                    >
                        {processing
                            ? "Saving..."
                            : formData.id
                            ? "Update Article"
                            : "Create Article"}
                    </button>
                    
                    <a
                        href="/admin/articles"
                        className="w-full sm:w-auto bg-gray-500 text-white px-6 py-3 sm:py-2 rounded hover:bg-gray-600 font-medium min-h-[44px] flex items-center justify-center text-center"
                    >
                        Cancel
                    </a>
                </div>
            </form>
        </div>
    );
}