import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Award, Download, Calendar, Trophy, Zap, 
    Target, FileText, CheckCircle, ArrowRight 
} from 'lucide-react';
import CertificateLanguageModal from '../CertificateLanguageModal';

export default function CompletedPrograms({ completedEnrollments, onCertificateGenerate }) {
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
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">🎉 Completed Programs</h2>
                    <p className="text-gray-600">Congratulations! Download your certificates below.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedEnrollments.map((enrollment, index) => (
                    <motion.div
                        key={enrollment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-6 border-2 border-yellow-200/50 hover:shadow-lg transition-all duration-300"
                    >
                        {/* Program Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        {enrollment.program.translated_name || enrollment.program.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">Program Completed</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Completed</div>
                                <div className="text-xs text-gray-400">
                                    {enrollment.completed_at ? 
                                        new Date(enrollment.completed_at).toLocaleDateString() : 
                                        'Recently'
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Achievement Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="text-center p-3 bg-white/70 rounded-xl">
                                <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                <div className="text-lg font-bold text-blue-900">
                                    {enrollment.highest_unlocked_level || 0}
                                </div>
                                <div className="text-xs text-blue-700">Levels</div>
                            </div>
                            <div className="text-center p-3 bg-white/70 rounded-xl">
                                <Zap className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                                <div className="text-lg font-bold text-yellow-900">
                                    {enrollment.quiz_points || 0}
                                </div>
                                <div className="text-xs text-yellow-700">Points</div>
                            </div>
                            <div className="text-center p-3 bg-white/70 rounded-xl">
                                <Award className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                <div className="text-lg font-bold text-green-900">100%</div>
                                <div className="text-xs text-green-700">Complete</div>
                            </div>
                        </div>

                        {/* Certificate Section */}
                        <div className="bg-white/80 rounded-xl p-4 border border-yellow-200/50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-600" />
                                    <span className="font-semibold text-gray-800">Certificate</span>
                                </div>
                                <span className="text-xs text-gray-500">Ready to download</span>
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-4">
                                Your official completion certificate with your achievements and completion details.
                            </p>
                            
                            <motion.button
                                onClick={() => handleCertificateClick(enrollment)}
                                disabled={generatingCert[enrollment.id]}
                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {generatingCert[enrollment.id] ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <FileText className="w-4 h-4" />
                                        </motion.div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Download Certificate
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* Access Program Link */}
                        <div className="mt-4 pt-4 border-t border-yellow-200/50">
                            <a
                                href={`/programs/${enrollment.program.slug}`}
                                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <span>Review program content</span>
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Encouragement Message */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50"
            >
                <h3 className="text-lg font-bold text-gray-800 mb-2">🌟 Amazing Achievement!</h3>
                <p className="text-gray-600 mb-4">
                    You've successfully completed {completedEnrollments.length} program{completedEnrollments.length > 1 ? 's' : ''}. 
                    Each certificate represents your dedication to learning!
                </p>
                <p className="text-sm text-gray-500">
                    Ready for your next challenge? Browse available programs below to continue your learning journey.
                </p>
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