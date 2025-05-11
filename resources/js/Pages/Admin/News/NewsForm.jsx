import { useForm } from "@inertiajs/react";

export default function NewsForm({ formData = {} }) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: formData.title || "",
        content: formData.content || "",
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.id) {
            put(route("admin.news.update", formData.id), {
                preserveScroll: true,
            });
        } else {
            post(route("admin.news.store"), {
                preserveScroll: true,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                    className="w-full border rounded"
                />
                {errors.title && (
                    <div className="text-sm text-red-500">{errors.title}</div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium">Content</label>
                <textarea
                    value={data.content}
                    onChange={(e) => setData("content", e.target.value)}
                    className="w-full border rounded"
                />
                {errors.content && (
                    <div className="text-sm text-red-500">{errors.content}</div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium">Image</label>
                <input
                    type="file"
                    onChange={(e) => setData("image", e.target.files[0])}
                />
                {formData.image && (
                    <img
                        src={formData.image}
                        alt="Current"
                        className="w-48 mt-2"
                    />
                )}
                {errors.image && (
                    <div className="text-sm text-red-500">{errors.image}</div>
                )}
            </div>

            <button
                type="submit"
                disabled={processing}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                {formData.id ? "Update Post" : "Create Post"}
            </button>
        </form>
    );
}
