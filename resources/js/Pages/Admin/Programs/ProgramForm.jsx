import { useForm } from "@inertiajs/react";

export default function ProgramForm({ formData = {}, onSubmit }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: formData.name || "",
        description: formData.description || "",
        duration: formData.duration || "",
        price: formData.price || "",
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(data, post, put);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
            <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
                {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                ></textarea>
                {errors.description && (
                    <p className="text-red-500 text-sm">{errors.description}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium">Duration</label>
                <input
                    type="text"
                    value={data.duration}
                    onChange={(e) => setData("duration", e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
                {errors.duration && (
                    <p className="text-red-500 text-sm">{errors.duration}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium">Price (€)</label>
                <input
                    type="number"
                    step="0.01"
                    value={data.price}
                    onChange={(e) => setData("price", e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
                {errors.price && (
                    <p className="text-red-500 text-sm">{errors.price}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium">
                    Image (optional)
                </label>

                {formData.image && (
                    <div className="mb-2">
                        <img
                            src={`/storage/${formData.image}`}
                            alt="Current"
                            className="w-32 h-auto rounded"
                        />
                        <p className="text-sm text-gray-600">Current image</p>
                    </div>
                )}

                <input
                    type="file"
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
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                {processing ? "Saving..." : "Save Program"}
            </button>
        </form>
    );
}
