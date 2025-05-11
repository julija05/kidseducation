import AdminLayout from "@/Layouts/AdminLayout";
import NewsForm from "./NewsForm";

export default function Create() {
    const handleSubmit = (data, post) => {
        post(route("admin.news.store"));
    };

    return (
        <AdminLayout title="Create News">
            <h1 className="text-2xl font-bold mb-6">Create News</h1>
            <NewsForm onSubmit={handleSubmit} />
        </AdminLayout>
    );
}
