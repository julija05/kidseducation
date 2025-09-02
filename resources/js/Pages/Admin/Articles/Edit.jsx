import AdminLayout from "@/Layouts/AdminLayout";
import ArticleForm from "./ArticleForm";

export default function Edit({ article, categories, migrationRequired, supportedLanguages }) {
    const handleSubmit = (data, post, put, options) => {
        const updateRoute = route("admin.articles.update", article.id);
        
        // If forceFormData is true, manually construct FormData to ensure proper serialization
        if (options.forceFormData) {
            const formData = new FormData();
            
            // Add all fields to FormData manually
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    if (data[key] instanceof File) {
                        formData.append(key, data[key]);
                    } else {
                        formData.append(key, String(data[key]));
                    }
                }
            });
            
            // Use post method with _method override for Laravel
            post(updateRoute, {
                ...options,
                data: formData,
                forceFormData: false, // We're handling FormData manually
            });
        } else {
            put(updateRoute, options);
        }
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