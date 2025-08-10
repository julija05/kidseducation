import React from "react";
import { Link, usePage } from "@inertiajs/react";
import GuessFrontLayout from "@/Layouts/GuessFrontLayout";
import { useTranslation } from "@/hooks/useTranslation";

export default function ArticleIndex({ articles, currentCategory, categories, categoriesWithArticles, categoryName, currentLocale }) {
    const { props } = usePage();
    const { t, locale } = useTranslation();
    
    // Fallback to categories if categoriesWithArticles is not available yet
    const availableCategories = categoriesWithArticles || categories || {};

    const getCategoryIcon = (category) => {
        const icons = {
            'how_to_use': '📚',
            'tutorials': '🎯', 
            'updates': '📢',
            'news': '📢'
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
    
    const getCategoryTranslationKey = (category) => {
        const keyMap = {
            'how_to_use': 'how_to_use_platform',
            'tutorials': 'tutorials_guides',
            'updates': 'platform_updates',
            'news': 'news_announcements'
        };
        return keyMap[category] || category;
    };

    return (
        <GuessFrontLayout title={`${categoryName} - Abacoding`}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-4 py-12">
                    {/* Check if there are any categories with articles */}
                    {Object.keys(availableCategories).length === 0 ? (
                        // No content message when no categories have articles
                        <div className="text-center py-20">
                            <div className="max-w-2xl mx-auto">
                                <div className="text-8xl mb-8">📚</div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                                    {t('articles.no_content_title')}
                                </h1>
                                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                    {t('articles.no_content_message')}
                                </p>
                                <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-full font-medium">
                                    <span className="mr-2">⏳</span>
                                    {t('articles.coming_soon')}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                    {getCategoryIcon(currentCategory)} {t(`articles.${getCategoryTranslationKey(currentCategory)}`) || categoryName}
                                </h1>
                                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                    {t('articles.helpful_guides_description')}
                                </p>
                                
                                {/* Temporary Language Switcher for Testing */}
                                <div className="mt-4 flex justify-center gap-2">
                                    <a 
                                        href="/language/en"
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                                    >
                                        English
                                    </a>
                                    <a 
                                        href="/language/mk" 
                                        className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm"
                                    >
                                        Македонски
                                    </a>
                                </div>
                            </div>

                            {/* Category Navigation - Only show categories that have articles */}
                            {Object.keys(availableCategories).length > 1 && (
                                <div className="flex flex-wrap justify-center gap-4 mb-12">
                                    {Object.entries(availableCategories).map(([key, label]) => (
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
                            )}

                            {/* Articles Grid */}
                            {articles.data.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">📝</div>
                                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                                        {t('articles.no_articles_yet')}
                                    </h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        {t('articles.articles_coming_soon')}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                    {articles.data.map((article) => (
                                        <article
                                            key={article.id}
                                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
                                        >
                                            {/* Image or Placeholder Section */}
                                            <div className="relative h-48 overflow-hidden">
                                                {article.image ? (
                                                    <img
                                                        src={article.image}
                                                        alt={article.translated_title || article.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full bg-gradient-to-r ${getCategoryColor(article.category)} flex items-center justify-center`}>
                                                        <div className="text-white text-center">
                                                            <div className="text-4xl mb-2">
                                                                {getCategoryIcon(article.category)}
                                                            </div>
                                                            <div className="text-sm font-medium opacity-90">
                                                                {article.category_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Category Badge */}
                                                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getCategoryColor(article.category)} shadow-md`}>
                                                    {getCategoryIcon(article.category)} {article.category_name}
                                                </div>
                                            </div>
                                            
                                            {/* Content Section - Always at bottom with flex-grow */}
                                            <div className="p-6 flex flex-col flex-grow">
                                                <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                                    {article.translated_title || article.title}
                                                </h2>
                                                
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                                                    {((article.translated_content || article.content).length > 150) 
                                                        ? `${(article.translated_content || article.content).substring(0, 150)}...` 
                                                        : (article.translated_content || article.content)
                                                    }
                                                </p>
                                                
                                                {/* Footer - Always at bottom */}
                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(article.published_at || article.created_at).toLocaleDateString()}
                                                    </span>
                                                    
                                                    <Link
                                                        href={route("articles.show", article.slug)}
                                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm group-hover:underline transition-colors"
                                                    >
                                                        {t('articles.read_more')} →
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
                        </>
                    )}
                </div>
            </div>
        </GuessFrontLayout>
    );
}