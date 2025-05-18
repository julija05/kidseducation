import AdminLayout from "@/Layouts/AdminLayout";
import NewsForm from "./NewsForm";

export default function Edit({ news }) {
    const handleSubmit = (data, post, put, options) => {
        // Use post method with method spoofing for form data uploads
        // Laravel resource routes expect PUT/PATCH, but form data works better with POST + _method
        post(route("admin.news.update", news.id), {
            ...options,
            onSuccess: () => {
                console.log("Update successful");
            },
            onError: (errors) => {
                console.log("Update errors:", errors);
            },
        });
    };

    return (
        <AdminLayout title="Edit News">
            <h1 className="text-2xl font-bold mb-6">Edit News</h1>
            <NewsForm formData={news} onSubmit={handleSubmit} />
        </AdminLayout>
    );
}
