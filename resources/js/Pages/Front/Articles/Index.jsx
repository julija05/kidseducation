import React from "react";
import { Link, usePage } from "@inertiajs/react";
import GuessFrontLayout from "@/Layouts/GuessFrontLayout";

export default function ArticleIndex({ articles, currentCategory, categories, categoryName }) {
    const { props } = usePage();

    const getCategoryIcon = (category) => {
        const icons = {
            'how_to_use': '📚',
            'tutorials': '🎯', 
            'updates': '📢'
        };
        return icons[category] || '📄';
    };

    const getCategoryColor = (category) => {
        const colors = {
            'how_to_use': 'from-green-400 to-emerald-600',
            'tutorials': 'from-blue-400 to-cyan-600',
            'updates': 'from-purple-400 to-violet-600'
        };
        return colors[category] || 'from-gray-400 to-slate-600';
    };

    return (
        <GuessFrontLayout title={`${categoryName} - Abacoding`}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {getCategoryIcon(currentCategory)} {categoryName}
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Helpful guides and resources to make the most of your learning journey
                        </p>
                    </div>

                    {/* Category Navigation */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {Object.entries(categories).map(([key, label]) => (
                            <Link
                                key={key}
                                href={route("articles.index", { category: key })}
                                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                                    currentCategory === key
                                        ? `bg-gradient-to-r ${getCategoryColor(key)} text-white shadow-lg transform scale-105`
                                        : "bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg border border-gray-200"
                                }`}
                            >
                                {getCategoryIcon(key)} {label}
                            </Link>
                        ))}
                    </div>

                    {/* Articles Grid */}
                    {articles.data.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                                No articles yet
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Articles in this category are coming soon. Check back later for helpful guides and tutorials!
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {articles.data.map((article) => (
                                <article
                                    key={article.id}
                                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                >
                                    {article.image && (
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getCategoryColor(article.category)}`}>
                                                {getCategoryIcon(article.category)} {article.category_name}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="p-6">
                                        {!article.image && (
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getCategoryColor(article.category)} mb-4`}>
                                                {getCategoryIcon(article.category)} {article.category_name}
                                            </div>
                                        )}
                                        
                                        <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                            {article.title}
                                        </h2>
                                        
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {article.content.length > 150 
                                                ? `${article.content.substring(0, 150)}...` 
                                                : article.content
                                            }
                                        </p>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {new Date(article.published_at || article.created_at).toLocaleDateString()}
                                            </span>
                                            
                                            <Link
                                                href={route("articles.show", article.slug)}
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm group-hover:underline"
                                            >
                                                Read more →
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {articles.links && articles.links.length > 3 && (
                        <div className="flex justify-center gap-2 flex-wrap">
                            {articles.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                                            link.active
                                                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                                : "bg-white text-blue-600 border-gray-300 hover:bg-blue-50 hover:border-blue-400 shadow-sm"
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="px-4 py-2 rounded-lg border text-gray-400 border-gray-300 bg-gray-50"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </GuessFrontLayout>
    );
}