import AdminLayout from "@/Layouts/AdminLayout";
import ArticleForm from "./ArticleForm";

export default function Edit({ article, categories, migrationRequired, supportedLanguages }) {
    const handleSubmit = (data, post, put, options) => {
        put(route("admin.articles.update", article.id), options);
    };

    return (
        <AdminLayout title="Edit Article">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Edit Article</h1>
                <div className="mb-4">
                    <nav className="text-sm text-gray-600">
                        <a 
                            href={route("admin.articles.index", { category: article.category })}
                            className="text-blue-600 hover:underline"
                        >
                            ← Back to Articles
                        </a>
                    </nav>
                </div>
                <ArticleForm 
                    formData={article}
                    categories={categories}
                    supportedLanguages={supportedLanguages}
                    migrationRequired={migrationRequired}
                    onSubmit={handleSubmit} 
                />
            </div>
        </AdminLayout>
    );
}