import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, BookOpen, Star, Heart } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Error404() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('errors.404.title')} />
            
            <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center p-4">
                {/* Floating Background Elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <motion.div 
                        animate={{ 
                            y: [0, -20, 0],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 6, repeat: Infinity }}
                        className="absolute top-20 left-20 text-6xl opacity-20"
                    >
                        🌟
                    </motion.div>
                    <motion.div 
                        animate={{ 
                            y: [0, -15, 0],
                            x: [0, 10, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
                        className="absolute top-32 right-32 text-5xl opacity-20"
                    >
                        🚀
                    </motion.div>
                    <motion.div 
                        animate={{ 
                            y: [0, -10, 0],
                            rotate: [0, -5, 5, 0]
                        }}
                        transition={{ duration: 7, repeat: Infinity, delay: 2 }}
                        className="absolute bottom-32 left-32 text-4xl opacity-20"
                    >
                        🎯
                    </motion.div>
                    <motion.div 
                        animate={{ 
                            y: [0, -12, 0]
                        }}
                        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                        className="absolute bottom-20 right-20 text-7xl opacity-20"
                    >
                        ✨
                    </motion.div>
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    {/* Main Error Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-purple-200"
                    >
                        {/* 404 Number with Animation */}
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 200 }}
                            className="mb-8"
                        >
                            <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
                                404
                            </div>
                            <motion.div
                                animate={{ 
                                    rotate: [0, 5, -5, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="text-6xl mb-4"
                            >
                                🔍
                            </motion.div>
                        </motion.div>

                        {/* Error Message */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="mb-8"
                        >
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                {t('errors.404.heading')}
                            </h1>
                            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                                {t('errors.404.message')}
                            </p>
                            <p className="text-base text-gray-500">
                                {t('errors.404.suggestion')}
                            </p>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
                        >
                            <Link href="/">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Home className="w-5 h-5" />
                                    {t('errors.404.go_home')}
                                </motion.button>
                            </Link>

                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.history.back()}
                                className="flex items-center gap-3 px-8 py-4 bg-white text-purple-600 font-semibold rounded-2xl border-2 border-purple-200 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                {t('errors.404.go_back')}
                            </motion.button>
                        </motion.div>

                        {/* Helpful Links */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="border-t border-gray-200 pt-8"
                        >
                            <h3 className="text-lg font-semibold text-gray-700 mb-6">
                                {t('errors.404.helpful_links')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Link href="/programs">
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-300 transition-all duration-300"
                                    >
                                        <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                        <h4 className="font-medium text-blue-900">{t('nav.programs')}</h4>
                                        <p className="text-sm text-blue-600">{t('errors.404.explore_programs')}</p>
                                    </motion.div>
                                </Link>

                                <Link href="/dashboard">
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:border-green-300 transition-all duration-300"
                                    >
                                        <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                        <h4 className="font-medium text-green-900">{t('nav.dashboard')}</h4>
                                        <p className="text-sm text-green-600">{t('errors.404.view_dashboard')}</p>
                                    </motion.div>
                                </Link>

                                <Link href="/help">
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:border-purple-300 transition-all duration-300"
                                    >
                                        <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                        <h4 className="font-medium text-purple-900">{t('nav.help')}</h4>
                                        <p className="text-sm text-purple-600">{t('errors.404.get_help')}</p>
                                    </motion.div>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Fun Mascot */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, duration: 0.8, type: "spring" }}
                        className="mt-8"
                    >
                        <motion.div
                            animate={{ 
                                y: [0, -10, 0],
                                rotate: [0, 2, -2, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="text-8xl"
                        >
                            🤖
                        </motion.div>
                        <p className="mt-2 text-sm text-gray-500">
                            {t('errors.404.mascot_message')}
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
}