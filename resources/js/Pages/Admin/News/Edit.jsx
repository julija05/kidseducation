import AdminLayout from "@/Layouts/AdminLayout";
import NewsForm from "./NewsForm";

export default function Edit({ news }) {
    const handleSubmit = (data, post, put) => {
        put(route("admin.news.update", news.id));
    };

    return (
        <AdminLayout title="Edit News">
            <h1 className="text-2xl font-bold mb-6">Edit News</h1>
            <NewsForm formData={news} onSubmit={handleSubmit} />
        </AdminLayout>
    );
}
