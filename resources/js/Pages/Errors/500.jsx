import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Home, RefreshCw, AlertTriangle, Wrench, Mail, Coffee } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Error500() {
    const { t } = useTranslation();

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <>
            <Head title={t('errors.500.title')} />
            
            <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-100 to-yellow-100 flex items-center justify-center p-4">
                {/* Floating Background Elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <motion.div 
                        animate={{ 
                            y: [0, -25, 0],
                            rotate: [0, 15, -15, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="absolute top-20 left-20 text-5xl opacity-20"
                    >
                        ⚙️
                    </motion.div>
                    <motion.div 
                        animate={{ 
                            y: [0, -20, 0],
                            x: [0, 15, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                        className="absolute top-32 right-32 text-6xl opacity-20"
                    >
                        🔧
                    </motion.div>
                    <motion.div 
                        animate={{ 
                            y: [0, -15, 0],
                            rotate: [0, -10, 10, 0]
                        }}
                        transition={{ duration: 9, repeat: Infinity, delay: 2 }}
                        className="absolute bottom-32 left-32 text-4xl opacity-20"
                    >
                        ⚡
                    </motion.div>
                    <motion.div 
                        animate={{ 
                            y: [0, -18, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
                        className="absolute bottom-20 right-20 text-5xl opacity-20"
                    >
                        🛠️
                    </motion.div>
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    {/* Main Error Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-red-200"
                    >
                        {/* 500 Number with Animation */}
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 200 }}
                            className="mb-8"
                        >
                            <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4">
                                500
                            </div>
                            <motion.div
                                animate={{ 
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-6xl mb-4"
                            >
                                ⚠️
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
                                {t('errors.500.heading')}
                            </h1>
                            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                                {t('errors.500.message')}
                            </p>
                            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 max-w-2xl mx-auto">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <Wrench className="w-5 h-5 text-orange-600" />
                                    <p className="text-base font-medium text-orange-800">
                                        {t('errors.500.technical_info')}
                                    </p>
                                </div>
                                <p className="text-sm text-orange-700">
                                    {t('errors.500.working_on_it')}
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
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRefresh}
                                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <RefreshCw className="w-5 h-5" />
                                {t('errors.500.try_again')}
                            </motion.button>

                            <Link href="/">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-red-600 font-semibold rounded-2xl border-2 border-red-200 hover:border-red-300 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Home className="w-5 h-5" />
                                    {t('errors.500.go_home')}
                                </motion.button>
                            </Link>
                        </motion.div>

                        {/* Status and Support */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="border-t border-gray-200 pt-8"
                        >
                            <h3 className="text-lg font-semibold text-gray-700 mb-6">
                                {t('errors.500.what_can_do')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200"
                                >
                                    <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                    <h4 className="font-medium text-blue-900 mb-2">{t('errors.500.wait_retry')}</h4>
                                    <p className="text-sm text-blue-600">{t('errors.500.wait_retry_desc')}</p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200"
                                >
                                    <AlertTriangle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                                    <h4 className="font-medium text-green-900 mb-2">{t('errors.500.check_status')}</h4>
                                    <p className="text-sm text-green-600">{t('errors.500.check_status_desc')}</p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200"
                                >
                                    <Mail className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                                    <h4 className="font-medium text-purple-900 mb-2">{t('errors.500.contact_support')}</h4>
                                    <p className="text-sm text-purple-600">{t('errors.500.contact_support_desc')}</p>
                                </motion.div>
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
                                rotate: [0, 3, -3, 0]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="text-8xl mb-2"
                        >
                            🔧
                        </motion.div>
                        <p className="text-sm text-gray-500">
                            {t('errors.500.mascot_message')}
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
}