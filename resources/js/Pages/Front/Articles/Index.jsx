import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import GuessFrontLayout from "@/Layouts/GuessFrontLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { BookOpen, Target, Megaphone, ArrowRight, Search, Star, Calendar, User, Tag, Sparkles, Library, GraduationCap, Lightbulb } from "lucide-react";

export default function ArticleIndex({ articles, currentCategory, categories, categoriesWithArticles, categoryName, currentLocale }) {
    const { props } = usePage();
    const { t, locale } = useTranslation();
    
    // Fallback to categories if categoriesWithArticles is not available yet
    const availableCategories = categoriesWithArticles || categories || {};

    const getCategoryIcon = (category) => {
        const icons = {
            'how_to_use': <GraduationCap className="w-5 h-5" />,
            'tutorials': <Lightbulb className="w-5 h-5" />,
            'updates': <Megaphone className="w-5 h-5" />,
            'news': <Library className="w-5 h-5" />
        };
        return icons[category] || <BookOpen className="w-5 h-5" />;
    };

    const getCategoryColor = (category) => {
        const colors = {
            'how_to_use': 'from-indigo-500 to-purple-600',
            'tutorials': 'from-blue-500 to-cyan-600',
            'updates': 'from-purple-500 to-pink-600',
            'news': 'from-emerald-500 to-teal-600'
        };
        return colors[category] || 'from-gray-500 to-slate-600';
    };

    const getCategoryBg = (category) => {
        const colors = {
            'how_to_use': 'bg-gradient-to-br from-indigo-50 to-purple-50',
            'tutorials': 'bg-gradient-to-br from-blue-50 to-cyan-50',
            'updates': 'bg-gradient-to-br from-purple-50 to-pink-50',
            'news': 'bg-gradient-to-br from-emerald-50 to-teal-50'
        };
        return colors[category] || 'bg-gradient-to-br from-gray-50 to-slate-50';
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
        <>
            <Head title={t('articles')} />
            <GuessFrontLayout title={`${categoryName} - Abacoding`}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 relative">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-indigo-200/40 to-purple-200/40 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
                    
                    {/* Floating geometric shapes */}
                    <motion.div
                        className="absolute top-32 right-1/4 w-4 h-4 bg-indigo-400 rounded-full opacity-60"
                        animate={{
                            y: [0, -30, 0],
                            rotate: [0, 180, 360],
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute top-64 left-1/3 w-3 h-3 bg-purple-400 rotate-45 opacity-50"
                        animate={{
                            y: [0, -25, 0],
                            x: [0, 20, 0],
                            rotate: [45, 225, 405],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                    />
                </div>

                <div className="container mx-auto px-4 py-16 relative z-10">
                    {/* Check if there are any categories with articles */}
                    {Object.keys(availableCategories).length === 0 ? (
                        // No content message when no categories have articles
                        <motion.div 
                            className="text-center py-24"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="max-w-2xl mx-auto">
                                <motion.div 
                                    className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-8"
                                    animate={{ 
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity }}
                                >
                                    <Library className="w-16 h-16 text-indigo-600" />
                                </motion.div>
                                <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                                    {t('articles.no_content_title')}
                                </h1>
                                <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                                    {t('articles.no_content_message')}
                                </p>
                                <motion.div 
                                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-medium shadow-xl hover:shadow-2xl transition-all duration-300"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Sparkles className="w-5 h-5 mr-3" />
                                    {t('articles.coming_soon')}
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            {/* Hero Header */}
                            <motion.div 
                                className="text-center mb-16"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <motion.div 
                                    className="inline-flex items-center gap-4 mb-6"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    <motion.div
                                        className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    >
                                        {getCategoryIcon(currentCategory)}
                                    </motion.div>
                                    <div>
                                        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            {t(`articles.${getCategoryTranslationKey(currentCategory)}`) || categoryName}
                                        </h1>
                                        <div className="flex items-center justify-center gap-2 mt-2">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <span className="text-gray-500 text-sm ml-1">Knowledge Hub</span>
                                        </div>
                                    </div>
                                </motion.div>
                                
                                <motion.p 
                                    className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                    {t('articles.helpful_guides_description')}
                                </motion.p>
                                
                                {/* Language Switcher */}
                                <motion.div 
                                    className="flex justify-center gap-3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                >
                                    <motion.a 
                                        href="/language/en"
                                        className="px-4 py-2 bg-white/80 backdrop-blur-sm text-indigo-700 rounded-full text-sm font-medium shadow-lg hover:shadow-xl border border-indigo-200 transition-all duration-300"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        🇺🇸 English
                                    </motion.a>
                                    <motion.a 
                                        href="/language/mk" 
                                        className="px-4 py-2 bg-white/80 backdrop-blur-sm text-purple-700 rounded-full text-sm font-medium shadow-lg hover:shadow-xl border border-purple-200 transition-all duration-300"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        🇲🇰 Македонски
                                    </motion.a>
                                </motion.div>
                            </motion.div>

                            {/* Category Navigation */}
                            {Object.keys(availableCategories).length > 1 && (
                                <motion.div 
                                    className="flex flex-wrap justify-center gap-4 mb-16"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                >
                                    {Object.entries(availableCategories).map(([key, label], index) => (
                                        <motion.div
                                            key={key}
                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            whileHover={{ scale: 1.05, y: -3 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Link
                                                href={route("articles.index", { category: key })}
                                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                                                    currentCategory === key
                                                        ? `bg-gradient-to-r ${getCategoryColor(key)} text-white shadow-xl scale-105 border-2 border-white/20`
                                                        : `bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white/90 border border-gray-200/50 hover:border-gray-300/50`
                                                }`}
                                            >
                                                {getCategoryIcon(key)}
                                                <span>{label}</span>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}

                            {/* Articles Grid */}
                            {articles.data.length === 0 ? (
                                <motion.div 
                                    className="text-center py-20"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <motion.div 
                                        className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6"
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    >
                                        <Search className="w-12 h-12 text-gray-400" />
                                    </motion.div>
                                    <h3 className="text-3xl font-bold text-gray-700 mb-4">
                                        {t('articles.no_articles_yet')}
                                    </h3>
                                    <p className="text-gray-500 max-w-md mx-auto text-lg">
                                        {t('articles.articles_coming_soon')}
                                    </p>
                                </motion.div>
                            ) : (
                                <>
                                    <motion.div 
                                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.8, delay: 0.4 }}
                                    >
                                        {articles.data.map((article, index) => (
                                            <motion.article
                                                key={article.id}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 * index }}
                                                whileHover={{ y: -8, scale: 1.02 }}
                                                className="group"
                                            >
                                                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 h-full flex flex-col">
                                                    {/* Article Image */}
                                                    <div className="relative h-56 overflow-hidden">
                                                        {article.image ? (
                                                            <img
                                                                src={article.image}
                                                                alt={article.translated_title || article.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className={`w-full h-full ${getCategoryBg(article.category)} flex items-center justify-center relative overflow-hidden`}>
                                                                <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10" />
                                                                <div className="text-center relative z-10">
                                                                    <motion.div 
                                                                        className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-3"
                                                                        animate={{ rotate: 360 }}
                                                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                                                    >
                                                                        {getCategoryIcon(article.category)}
                                                                    </motion.div>
                                                                    <div className="text-sm font-semibold text-gray-600">
                                                                        {article.category_name}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Category Badge */}
                                                        <motion.div 
                                                            className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(article.category)} shadow-lg backdrop-blur-sm`}
                                                            whileHover={{ scale: 1.05 }}
                                                        >
                                                            {getCategoryIcon(article.category)}
                                                            <span>{article.category_name}</span>
                                                        </motion.div>
                                                    </div>
                                                    
                                                    {/* Article Content */}
                                                    <div className="p-6 flex flex-col flex-grow">
                                                        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                            {article.translated_title || article.title}
                                                        </h2>
                                                        
                                                        <p className="text-gray-600 mb-6 line-clamp-3 flex-grow leading-relaxed">
                                                            {((article.translated_content || article.content).length > 120) 
                                                                ? `${(article.translated_content || article.content).substring(0, 120)}...` 
                                                                : (article.translated_content || article.content)
                                                            }
                                                        </p>
                                                        
                                                        {/* Article Footer */}
                                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <motion.div whileHover={{ x: 5 }}>
                                                                <Link
                                                                    href={route("articles.show", article.slug)}
                                                                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold text-sm group-hover:underline transition-colors"
                                                                >
                                                                    <span>{t('articles.read_more')}</span>
                                                                    <ArrowRight className="w-4 h-4" />
                                                                </Link>
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.article>
                                        ))}
                                    </motion.div>
                                </>
                            )}

                            {/* Pagination */}
                            {articles.links && articles.links.length > 3 && (
                                <motion.div 
                                    className="flex justify-center gap-3 flex-wrap"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                >
                                    {articles.links.map((link, index) =>
                                        link.url ? (
                                            <motion.div
                                                key={index}
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Link
                                                    href={link.url}
                                                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                                                        link.active
                                                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105"
                                                            : "bg-white/80 backdrop-blur-sm text-indigo-600 border border-indigo-200/50 hover:bg-white/90 hover:border-indigo-300 shadow-md hover:shadow-lg"
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            </motion.div>
                                        ) : (
                                            <span
                                                key={index}
                                                className="px-4 py-2 rounded-xl font-medium text-gray-400 bg-gray-50/80 backdrop-blur-sm border border-gray-200"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    )}
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </div>
            </GuessFrontLayout>
        </>
    );
}