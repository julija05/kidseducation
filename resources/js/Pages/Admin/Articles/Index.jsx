import React from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useEffect, useState } from "react";

export default function ArticleIndex({ articles, currentCategory, categories, migrationRequired }) {
    const { delete: destroy } = useForm();
    const { props } = usePage();
    const [successMessage, setSuccessMessage] = useState(
        props.flash.success || ""
    );
    const [deleteMessage, setDeleteMessage] = useState(
        props.flash.deleted || ""
    );

    useEffect(() => {
        if (successMessage || deleteMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("");
                setDeleteMessage("");
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, deleteMessage]);

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this article?")) {
            destroy(route("admin.articles.destroy", id));
        }
    };

    const getCategoryBadgeColor = (category) => {
        const colors = {
            'how_to_use': 'bg-green-100 text-green-800',
            'tutorials': 'bg-blue-100 text-blue-800',
            'updates': 'bg-purple-100 text-purple-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout className="space-y-8">
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8">
                    {successMessage}
                </div>
            )}
            {deleteMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
                    {deleteMessage}
                </div>
            )}

            {migrationRequired && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-8">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Database Migration Required</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>Article categories and advanced features require database migration. Run: <code className="bg-yellow-200 px-1 rounded">php artisan migrate</code></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Articles Management</h1>
                <Link
                    href={route("admin.articles.create", { category: currentCategory })}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Create New Article
                </Link>
            </div>

            {/* Category Filter - Only show if migration has been applied */}
            {!migrationRequired && (
                <div className="flex flex-wrap gap-2 border-b pb-4">
                    {Object.entries(categories).map(([key, label]) => (
                        <Link
                            key={key}
                            href={route("admin.articles.index", { category: key })}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                                currentCategory === key
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            )}

            {articles.data.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 bg-gray-50 rounded-lg p-8">
                    <h3 className="text-lg font-medium">No articles available</h3>
                    <p className="mt-2">
                        Be the first to{" "}
                        <Link
                            href={route("admin.articles.create", { category: currentCategory })}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            create a new article
                        </Link>{" "}
                        in this category.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {articles.data.map((article) => (
                        <div
                            key={article.id}
                            className="border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-semibold">{article.title_en || article.title}</h2>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(article.category)}`}>
                                            {categories[article.category] || article.category}
                                        </span>
                                        {!article.is_published && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Draft
                                            </span>
                                        )}
                                        {/* Translation status indicators */}
                                        <div className="flex gap-1">
                                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700" title="English">
                                                EN
                                            </span>
                                            {article.title_mk && (
                                                <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700" title="Macedonian">
                                                    MK
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 line-clamp-3">{article.content_en || article.content}</p>
                                    {article.published_at && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            Published: {new Date(article.published_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                {article.image && (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-24 h-16 object-cover rounded ml-4"
                                    />
                                )}
                            </div>

                            <div className="flex gap-4 mt-4 pt-4 border-t">
                                <Link
                                    href={route("admin.articles.edit", article.id)}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={route("admin.articles.show", article.id)}
                                    className="text-green-600 hover:text-green-800 font-medium"
                                >
                                    View
                                </Link>
                                <button
                                    onClick={() => handleDelete(article.id)}
                                    className="text-red-600 hover:text-red-800 font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {articles.links && (
                <div className="mt-8 flex justify-center gap-2 flex-wrap">
                    {articles.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                className={`px-3 py-1 rounded border ${
                                    link.active
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-blue-600 border-gray-300 hover:bg-blue-100"
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={index}
                                className="px-3 py-1 rounded border text-gray-400 border-gray-300"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    )}
                </div>
            )}
        </AdminLayout>
    );
}