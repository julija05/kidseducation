import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Award, Download, Calendar, Trophy, Zap, 
    Target, FileText, CheckCircle, ArrowRight, Star 
} from 'lucide-react';
import CertificateLanguageModal from '../CertificateLanguageModal';
import { useTranslation } from '@/hooks/useTranslation';

export default function CompletedPrograms({ completedEnrollments, onCertificateGenerate }) {
    const { t } = useTranslation();
    const [generatingCert, setGeneratingCert] = useState({});
    const [languageModalOpen, setLanguageModalOpen] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);

    const handleCertificateClick = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setLanguageModalOpen(true);
    };

    const handleLanguageSelect = async (language) => {
        if (!selectedEnrollment) return;
        
        setGeneratingCert(prev => ({ ...prev, [selectedEnrollment.id]: true }));
        
        try {
            const response = await fetch(`/certificates/programs/${selectedEnrollment.program.slug}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ language }),
            });

            const result = await response.json();
            
            if (result.success) {
                // Use view_url for HTML certificates, download_url for PDFs
                const url = result.is_html ? result.view_url : result.download_url;
                if (url) {
                    window.open(url, '_blank');
                    onCertificateGenerate?.(result);
                } else {
                    console.error('No URL provided for certificate');
                    alert('Certificate generated but no download URL provided');
                }
            } else {
                console.error('Certificate generation failed:', result.message);
                alert('Failed to generate certificate: ' + result.message);
            }
        } catch (error) {
            console.error('Certificate generation error:', error);
            alert('Failed to generate certificate. Please try again.');
        } finally {
            setGeneratingCert(prev => ({ ...prev, [selectedEnrollment.id]: false }));
            setLanguageModalOpen(false);
            setSelectedEnrollment(null);
        }
    };

    const handleModalClose = () => {
        setLanguageModalOpen(false);
        setSelectedEnrollment(null);
    };

    if (!completedEnrollments || completedEnrollments.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-10"
        >
            {/* Enhanced Header */}
            <div className="text-center mb-10">
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                    className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                    <Trophy className="w-10 h-10 text-white" />
                </motion.div>
                <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-3"
                >
                    🎉 {t('certificate.congratulations')}
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl text-gray-700 font-medium"
                >
                    {t('certificate.amazing_work')}
                </motion.p>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-2 mt-4 text-lg font-semibold text-gray-600"
                >
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>{completedEnrollments.length} {completedEnrollments.length === 1 ? 'Program' : 'Programs'} {t('certificate.program_completed')}</span>
                    <Star className="w-5 h-5 text-yellow-500" />
                </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {completedEnrollments.map((enrollment, index) => (
                    <motion.div
                        key={enrollment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-3xl p-8 border-2 border-yellow-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-200/30 to-transparent rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/30 to-transparent rounded-full blur-xl"></div>
                        
                        {/* Program Header */}
                        <div className="relative z-10 mb-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <CheckCircle className="w-7 h-7 text-white" />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                                            {enrollment.program.translated_name || enrollment.program.name}
                                        </h3>
                                        <p className="text-green-700 font-semibold text-sm bg-green-100 px-2 py-1 rounded-full inline-block">
                                            ✅ {t('certificate.program_completed')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500 font-medium">{t('certificate.completion_date')}</div>
                                    <div className="text-sm font-bold text-gray-700">
                                        {enrollment.completed_at ? 
                                            new Date(enrollment.completed_at).toLocaleDateString() : 
                                            'Recently'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Achievement Stats */}
                        <div className="relative z-10 grid grid-cols-3 gap-4 mb-8">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="text-center p-4 bg-white/80 rounded-2xl border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-blue-900 mb-1">
                                    {enrollment.highest_unlocked_level || 0}
                                </div>
                                <div className="text-xs text-blue-700 font-semibold">{t('certificate.levels')}</div>
                            </motion.div>
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                className="text-center p-4 bg-white/80 rounded-2xl border border-yellow-200/50 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <Zap className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-yellow-900 mb-1">
                                    {enrollment.quiz_points || 0}
                                </div>
                                <div className="text-xs text-yellow-700 font-semibold">{t('certificate.points')}</div>
                            </motion.div>
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                className="text-center p-4 bg-white/80 rounded-2xl border border-green-200/50 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <Award className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-green-900 mb-1">100%</div>
                                <div className="text-xs text-green-700 font-semibold">{t('certificate.complete')}</div>
                            </motion.div>
                        </div>

                        {/* Enhanced Certificate Section */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            className="relative z-10 bg-gradient-to-r from-white via-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300/50 shadow-lg"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <motion.div 
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-md"
                                    >
                                        <Award className="w-5 h-5 text-white" />
                                    </motion.div>
                                    <div>
                                        <span className="text-lg font-bold text-gray-800">{t('certificate.your_certificate')}</span>
                                        <div className="text-sm text-green-600 font-semibold">
                                            ✨ {t('certificate.certificate_ready')}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                                        {t('certificate.download_available')}
                                    </span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                                {t('certificate.includes_details')}
                            </p>
                            
                            <motion.button
                                onClick={() => handleCertificateClick(enrollment)}
                                disabled={generatingCert[enrollment.id]}
                                className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {generatingCert[enrollment.id] ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <FileText className="w-5 h-5" />
                                        </motion.div>
                                        <span className="text-lg">{t('certificate.generating')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        <span className="text-lg">{t('certificate.download_certificate')}</span>
                                    </>
                                )}
                            </motion.button>
                        </motion.div>

                        {/* Access Program Link */}
                        <div className="relative z-10 mt-6 pt-4 border-t border-yellow-200/50">
                            <a
                                href={`/programs/${enrollment.program.slug}`}
                                className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-all duration-300 hover:gap-3"
                            >
                                <span>{t('certificate.review_program_content')}</span>
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Enhanced Encouragement Message */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-12 text-center p-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl border-2 border-blue-200/50 shadow-lg relative overflow-hidden"
            >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9, type: "spring", stiffness: 150 }}
                        className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                    >
                        <Star className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        🌟 {t('certificate.share_achievement')}
                    </h3>
                    
                    <p className="text-lg text-gray-700 mb-4 font-medium">
                        You've successfully completed <span className="font-bold text-purple-600">{completedEnrollments.length}</span> program{completedEnrollments.length > 1 ? 's' : ''}. 
                        Each certificate represents your dedication to learning!
                    </p>
                    
                    <p className="text-gray-600">
                        {t('certificate.continue_learning_journey')}
                    </p>
                </div>
            </motion.div>

            {/* Language Selection Modal */}
            <CertificateLanguageModal
                isOpen={languageModalOpen}
                onClose={handleModalClose}
                onLanguageSelect={handleLanguageSelect}
                programName={selectedEnrollment?.program?.translated_name || selectedEnrollment?.program?.name || 'Program'}
                isGenerating={selectedEnrollment ? generatingCert[selectedEnrollment.id] : false}
            />
        </motion.div>
    );
}