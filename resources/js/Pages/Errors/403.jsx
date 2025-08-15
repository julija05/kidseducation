import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Shield, Lock, User, LogIn, Mail } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Error403() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('errors.403.title')} />
            
            <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 flex items-center justify-center p-4">
                {/* Floating Background Elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <motion.div 
                        animate={{ 
                            y: [0, -20, 0],
                            rotate: [0, 8, -8, 0]
                        }}
                        transition={{ duration: 7, repeat: Infinity }}
                        className="absolute top-20 left-20 text-5xl opacity-20"
                    >
                        🔒
                    </motion.div>
                    <motion.div 
                        animate={{ 
                            y: [0, -15, 0],
                            x: [0, 12, 0]
                        }}
                        transition={{ duration: 9, repeat: Infinity, delay: 1 }}
                        className="absolute top-32 right-32 text-6xl opacity-20"
                    >
                        🛡️
                    </motion.div>
                    <motion.div 
                        animate={{ 
                            y: [0, -12, 0],
                            rotate: [0, -6, 6, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
                        className="absolute bottom-32 left-32 text-4xl opacity-20"
                    >
                        🚫
                    </motion.div>
                    <motion.div 
                        animate={{ 
                            y: [0, -18, 0],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
                        className="absolute bottom-20 right-20 text-5xl opacity-20"
                    >
                        ⚠️
                    </motion.div>
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    {/* Main Error Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-orange-200"
                    >
                        {/* 403 Number with Animation */}
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 200 }}
                            className="mb-8"
                        >
                            <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
                                403
                            </div>
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                                className="text-6xl mb-4"
                            >
                                🔐
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
                                {t('errors.403.heading')}
                            </h1>
                            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                                {t('errors.403.message')}
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-2xl mx-auto">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <Shield className="w-5 h-5 text-red-600" />
                                    <p className="text-base font-medium text-red-800">
                                        {t('errors.403.access_denied')}
                                    </p>
                                </div>
                                <p className="text-sm text-red-700">
                                    {t('errors.403.permission_required')}
                                </p>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
                        >
                            <Link href="/login">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <LogIn className="w-5 h-5" />
                                    {t('errors.403.login')}
                                </motion.button>
                            </Link>

                            <Link href="/">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-orange-600 font-semibold rounded-2xl border-2 border-orange-200 hover:border-orange-300 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Home className="w-5 h-5" />
                                    {t('errors.403.go_home')}
                                </motion.button>
                            </Link>

                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.history.back()}
                                className="flex items-center gap-3 px-8 py-4 bg-gray-100 text-gray-600 font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                {t('errors.403.go_back')}
                            </motion.button>
                        </motion.div>

                        {/* Help Information */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="border-t border-gray-200 pt-8"
                        >
                            <h3 className="text-lg font-semibold text-gray-700 mb-6">
                                {t('errors.403.what_can_do')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200"
                                >
                                    <User className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                    <h4 className="font-medium text-blue-900 mb-2">{t('errors.403.check_account')}</h4>
                                    <p className="text-sm text-blue-600">{t('errors.403.check_account_desc')}</p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200"
                                >
                                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
                                    <h4 className="font-medium text-green-900 mb-2">{t('errors.403.request_access')}</h4>
                                    <p className="text-sm text-green-600">{t('errors.403.request_access_desc')}</p>
                                </motion.div>

                                <Link href="/contact">
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:border-purple-300 cursor-pointer transition-all duration-300"
                                    >
                                        <Mail className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                                        <h4 className="font-medium text-purple-900 mb-2">{t('errors.403.contact_admin')}</h4>
                                        <p className="text-sm text-purple-600">{t('errors.403.contact_admin_desc')}</p>
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
                                y: [0, -8, 0],
                                rotate: [0, 2, -2, 0]
                            }}
                            transition={{ duration: 3.5, repeat: Infinity }}
                            className="text-8xl mb-2"
                        >
                            🚧
                        </motion.div>
                        <p className="text-sm text-gray-500">
                            {t('errors.403.mascot_message')}
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
}