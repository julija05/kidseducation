import AdminLayout from "@/Layouts/AdminLayout";
import { Link } from "@inertiajs/react";

export default function Show({ article }) {
    const getCategoryBadgeColor = (category) => {
        const colors = {
            'how_to_use': 'bg-green-100 text-green-800',
            'tutorials': 'bg-blue-100 text-blue-800',
            'updates': 'bg-purple-100 text-purple-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout title={article.title}>
            <div className="max-w-4xl mx-auto">
                {/* Navigation */}
                <div className="mb-6">
                    <Link 
                        href={route("admin.articles.index", { category: article.category })}
                        className="text-blue-600 hover:underline text-sm"
                    >
                        ← Back to Articles
                    </Link>
                </div>

                {/* Article Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryBadgeColor(article.category)}`}>
                            {article.category_name}
                        </span>
                        {!article.is_published && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                Draft
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>Created: {new Date(article.created_at).toLocaleDateString()}</p>
                        {article.published_at && (
                            <p>Published: {new Date(article.published_at).toLocaleDateString()}</p>
                        )}
                        {article.updated_at !== article.created_at && (
                            <p>Last updated: {new Date(article.updated_at).toLocaleDateString()}</p>
                        )}
                    </div>
                </div>

                {/* Article Image */}
                {article.image && (
                    <div className="mb-8">
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                        />
                    </div>
                )}

                {/* Article Content */}
                <div className="prose prose-lg max-w-none mb-8">
                    <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                        {article.content}
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-6">
                    <div className="flex gap-4">
                        <Link
                            href={route("admin.articles.edit", article.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Edit Article
                        </Link>
                        {article.is_published && (
                            <Link
                                href={route("articles.show", article.slug)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                target="_blank"
                            >
                                View Public Page
                            </Link>
                        )}
                        <Link
                            href={route("admin.articles.index", { category: article.category })}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Back to List
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}