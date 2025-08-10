import React from "react";
import { Link } from "@inertiajs/react";
import GuessFrontLayout from "@/Layouts/GuessFrontLayout";

export default function ArticleShow({ article, relatedArticles, currentLocale }) {
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

    const formatContent = () => {
        const translatedContent = article.translated_content || article.content;
        return translatedContent.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                {paragraph}
            </p>
        ));
    };

    return (
        <GuessFrontLayout title={`${article.title} - Abacoding`}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <article className="container mx-auto px-4 py-12 max-w-4xl">
                    {/* Breadcrumb */}
                    <nav className="mb-8 text-sm text-gray-600">
                        <Link
                            href={route("articles.index")}
                            className="hover:text-blue-600"
                        >
                            Articles
                        </Link>
                        {" > "}
                        <Link
                            href={route("articles.index", { category: article.category })}
                            className="hover:text-blue-600"
                        >
                            {article.category_name}
                        </Link>
                        {" > "}
                        <span className="text-gray-800 font-medium">{article.title}</span>
                    </nav>

                    {/* Article Header */}
                    <header className="mb-8">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getCategoryColor(article.category)} mb-4`}>
                            {getCategoryIcon(article.category)} {article.category_name}
                        </div>
                        
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            {article.translated_title || article.title}
                        </h1>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                            {article.published_at && (
                                <p>Published: {new Date(article.published_at).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</p>
                            )}
                            {article.updated_at !== article.created_at && (
                                <p>Last updated: {new Date(article.updated_at).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</p>
                            )}
                        </div>
                    </header>

                    {/* Featured Image */}
                    {article.image && (
                        <div className="mb-8">
                            <img
                                src={article.image}
                                alt={article.title}
                                className="w-full max-w-3xl mx-auto rounded-lg shadow-lg"
                            />
                        </div>
                    )}

                    {/* Article Content */}
                    <div className="prose prose-lg prose-blue max-w-none mb-12">
                        <div className="bg-white rounded-lg p-8 shadow-sm">
                            {formatContent()}
                        </div>
                    </div>

                    {/* Related Articles */}
                    {relatedArticles && relatedArticles.length > 0 && (
                        <section className="border-t pt-12">
                            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                                Related Articles
                            </h3>
                            
                            <div className="grid md:grid-cols-3 gap-6">
                                {relatedArticles.map((related) => (
                                    <Link
                                        key={related.id}
                                        href={route("articles.show", related.slug)}
                                        className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group"
                                    >
                                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getCategoryColor(related.category)} mb-3`}>
                                            {getCategoryIcon(related.category)}
                                        </div>
                                        
                                        <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                            {related.translated_title || related.title}
                                        </h4>
                                        
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {((related.translated_content || related.content).length > 120) 
                                                ? `${(related.translated_content || related.content).substring(0, 120)}...` 
                                                : (related.translated_content || related.content)
                                            }
                                        </p>
                                        
                                        <span className="inline-flex items-center text-blue-600 text-sm font-medium mt-3 group-hover:underline">
                                            Read more →
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Call to Action */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white mt-12">
                        <h3 className="text-2xl font-semibold mb-3">
                            Ready to Start Learning?
                        </h3>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                            Explore our educational programs and start your learning journey today. 
                            From mathematics to coding, we have something for every young learner.
                        </p>
                        <Link
                            href={route("programs.index")}
                            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-full font-medium hover:bg-blue-50 transition-colors"
                        >
                            View Programs →
                        </Link>
                    </div>

                    {/* Back to Articles */}
                    <div className="text-center mt-8">
                        <Link
                            href={route("articles.index", { category: article.category })}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                            ← Back to {article.category_name}
                        </Link>
                    </div>
                </article>
            </div>
        </GuessFrontLayout>
    );
}