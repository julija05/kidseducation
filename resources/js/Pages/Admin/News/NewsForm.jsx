import { useEffect } from "react";
import { useForm } from "@inertiajs/react";

export default function NewsForm({ formData = {}, onSubmit }) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: formData.title || "",
        content: formData.content || "",
        image: null,
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
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm mt-1"
                    required
                />
                {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium">Content</label>
                <textarea
                    value={data.content}
                    onChange={(e) => setData("content", e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm mt-1"
                    rows="5"
                    required
                />
                {errors.content && (
                    <p className="text-red-500 text-sm">{errors.content}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium">
                    Image (optional)
                </label>

                {formData.image && (
                    <div className="mb-2">
                        <img
                            src={formData.image}
                            alt="Current"
                            className="w-32 h-auto rounded"
                            onError={(e) => (e.target.style.display = "none")}
                        />
                        <p className="text-sm text-gray-600">Current image</p>
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setData("image", e.target.files[0])}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
                {errors.image && (
                    <p className="text-red-500 text-sm">{errors.image}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={processing}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {processing
                    ? "Saving..."
                    : formData.id
                    ? "Update Post"
                    : "Create Post"}
            </button>
        </form>
    );
}
