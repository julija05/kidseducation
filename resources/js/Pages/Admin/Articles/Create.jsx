import AdminLayout from "@/Layouts/AdminLayout";
import ArticleForm from "./ArticleForm";
import { usePage } from "@inertiajs/react";

export default function Create({ categories, selectedCategory, migrationRequired, supportedLanguages }) {
    const { props } = usePage();
    
    const handleSubmit = (data, post, put, options) => {
        post(route("admin.articles.store"), options);
    };

    return (
        <AdminLayout title="Create Article">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Create New Article</h1>
                <div className="mb-4 text-sm text-gray-600">
                    <p>Create helpful guides and tutorials to help users understand how to use the platform.</p>
                </div>
                <ArticleForm 
                    categories={categories}
                    selectedCategory={selectedCategory}
                    supportedLanguages={supportedLanguages}
                    migrationRequired={migrationRequired}
                    onSubmit={handleSubmit} 
                />
            </div>
        </AdminLayout>
    );
}