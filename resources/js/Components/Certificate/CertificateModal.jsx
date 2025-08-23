import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Award, Download, X, Check, Star, Trophy, 
    Calendar, Target, Zap, FileText, ExternalLink 
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function CertificateModal({ 
    isOpen, 
    onClose, 
    program, 
    enrollment, 
    onGenerate,
    isGenerating = false 
}) {
    const { t } = useTranslation();
    const [certificateData, setCertificateData] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleGenerateCertificate = async () => {
        try {
            const response = await fetch(`/certificates/programs/${program.slug}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            const result = await response.json();
            
            if (result.success) {
                setCertificateData(result);
                setShowSuccess(true);
                onGenerate?.(result);
            } else {
                console.error('Certificate generation failed:', result.message);
                alert(t('certificate.generation_failed') + ': ' + result.message);
            }
        } catch (error) {
            console.error('Certificate generation error:', error);
            alert(t('certificate.generation_error'));
        }
    };

    const handleDownload = () => {
        if (certificateData?.download_url) {
            window.open(certificateData.download_url, '_blank');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-yellow-200/50"
                >
                    {!showSuccess ? (
                        // Initial completion congratulations
                        <div className="p-10">
                            {/* Enhanced Header */}
                            <div className="relative text-center mb-8">
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors z-10"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                
                                {/* Certificate Title */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="mb-4"
                                >
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                                        {t('certificate.certificate_of_completion')}
                                    </h1>
                                    <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto"></div>
                                </motion.div>
                                
                                {/* Trophy Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                                    className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                                >
                                    <Trophy className="w-8 h-8 text-white" />
                                </motion.div>
                                
                                {/* Congratulations */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 {t('certificate.congratulations')}</h2>
                                    <p className="text-gray-600 font-medium">{t('certificate.program_completed')}</p>
                                </motion.div>
                            </div>

                            {/* Program Completion Message */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-center mb-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200/50"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    {t('certificate.you_completed', { program: program.translated_name || program.name })}
                                </h3>
                                <p className="text-lg text-gray-700 font-medium">
                                    {t('certificate.amazing_work')}
                                </p>
                            </motion.div>

                            {/* Enhanced Achievement Stats */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="grid grid-cols-3 gap-6 mb-8"
                            >
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200/50 hover:shadow-lg transition-all duration-300"
                                >
                                    <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-blue-900 mb-1">
                                        {enrollment?.highest_unlocked_level || 0}
                                    </div>
                                    <div className="text-sm text-blue-700 font-semibold">{t('certificate.levels')}</div>
                                </motion.div>
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border-2 border-yellow-200/50 hover:shadow-lg transition-all duration-300"
                                >
                                    <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-yellow-900 mb-1">
                                        {enrollment?.quiz_points || 0}
                                    </div>
                                    <div className="text-sm text-yellow-700 font-semibold">{t('certificate.points')}</div>
                                </motion.div>
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200/50 hover:shadow-lg transition-all duration-300"
                                >
                                    <Calendar className="w-8 h-8 text-green-600 mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-green-900 mb-1">100%</div>
                                    <div className="text-sm text-green-700 font-semibold">{t('certificate.complete')}</div>
                                </motion.div>
                            </motion.div>

                            {/* Enhanced Certificate Preview */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border-2 border-dashed border-purple-300/50 relative overflow-hidden"
                            >
                                {/* Background decoration */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-200/20 to-transparent rounded-full blur-2xl"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <motion.div 
                                            animate={{ rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <Award className="w-6 h-6 text-white" />
                                        </motion.div>
                                        <div>
                                            <h4 className="text-xl font-bold text-purple-900">{t('certificate.your_certificate')}</h4>
                                            <p className="text-purple-700">Download Your Certificate</p>
                                        </div>
                                    </div>
                                    <p className="text-purple-800 mb-4 text-lg leading-relaxed">
                                        {t('certificate.generate_description')}
                                    </p>
                                    <div className="text-purple-700 font-medium">
                                        ✨ {t('certificate.includes_details')}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0 }}
                                className="flex gap-4"
                            >
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                                >
                                    {t('common.close')}
                                </button>
                                <button
                                    onClick={handleGenerateCertificate}
                                    disabled={isGenerating}
                                    className="flex-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 font-bold text-lg shadow-lg hover:shadow-xl"
                                >
                                    {isGenerating ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <FileText className="w-5 h-5" />
                                            </motion.div>
                                            {t('certificate.generating')}
                                        </>
                                    ) : (
                                        <>
                                            <Award className="w-5 h-5" />
                                            {t('certificate.generate_certificate')}
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        </div>
                    ) : (
                        // Certificate generated success
                        <div className="p-10">
                            {/* Enhanced Success Header */}
                            <div className="relative text-center mb-8">
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors z-10"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                
                                {/* Certificate Title */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="mb-4"
                                >
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                        {t('certificate.certificate_ready')}
                                    </h1>
                                    <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto"></div>
                                </motion.div>
                                
                                {/* Award Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                                    className="w-16 h-16 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                                >
                                    <Award className="w-8 h-8 text-white" />
                                </motion.div>
                                
                                {/* Success Message */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 {t('certificate.certificate_generated')}</h2>
                                    <p className="text-gray-600 font-medium">{t('certificate.download_available')}</p>
                                </motion.div>
                            </div>

                            {/* Certificate Preview */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-center mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200/50"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", duration: 0.6, delay: 0.5 }}
                                    className="relative mx-auto mb-6"
                                >
                                    <div className="w-40 h-28 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl border-4 border-yellow-400 flex items-center justify-center relative shadow-lg">
                                        <Award className="w-16 h-16 text-yellow-600" />
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.8 }}
                                            className="absolute -top-3 -right-3"
                                        >
                                            <Star className="w-8 h-8 text-yellow-500 fill-current" />
                                        </motion.div>
                                    </div>
                                </motion.div>
                                
                                <p className="text-xl text-gray-700 font-medium">
                                    {t('certificate.ready_for_download')}
                                </p>
                            </motion.div>

                            {/* Certificate Details */}
                            {certificateData && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-3">{t('certificate.certificate_details')}</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">{t('certificate.program')}:</span>
                                            <span className="font-medium">{certificateData.program_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">{t('certificate.completion_date')}:</span>
                                            <span className="font-medium">{certificateData.completion_date}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">{t('certificate.levels_completed')}:</span>
                                            <span className="font-medium">{certificateData.levels_completed}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">{t('certificate.total_points')}:</span>
                                            <span className="font-medium">{certificateData.total_points}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex gap-4"
                            >
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                                >
                                    {t('common.close')}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center gap-3 font-bold text-lg shadow-lg hover:shadow-xl"
                                >
                                    <Download className="w-5 h-5" />
                                    {t('certificate.download_certificate')}
                                </button>
                            </motion.div>

                            {/* Additional Actions */}
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-500 mb-2">
                                    {t('certificate.share_achievement')}
                                </p>
                                <div className="flex justify-center gap-2">
                                    <span className="text-2xl">🎉</span>
                                    <span className="text-2xl">🏆</span>
                                    <span className="text-2xl">⭐</span>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}