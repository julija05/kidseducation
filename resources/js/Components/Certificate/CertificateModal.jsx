import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Award, Download, X, Check, Star, Trophy, 
    Calendar, Target, Zap, FileText, ExternalLink 
} from 'lucide-react';

export default function CertificateModal({ 
    isOpen, 
    onClose, 
    program, 
    enrollment, 
    onGenerate,
    isGenerating = false 
}) {
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
                alert('Failed to generate certificate: ' + result.message);
            }
        } catch (error) {
            console.error('Certificate generation error:', error);
            alert('Failed to generate certificate. Please try again.');
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
                    className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                >
                    {!showSuccess ? (
                        // Initial completion congratulations
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Congratulations!</h2>
                                        <p className="text-sm text-gray-600">Program Completed</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Success Message */}
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <Check className="w-10 h-10 text-green-600" />
                                </motion.div>
                                
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    You completed {program.name}!
                                </h3>
                                <p className="text-gray-600">
                                    Amazing work! You've successfully finished all lessons and earned your certificate.
                                </p>
                            </div>

                            {/* Achievement Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="text-center p-4 bg-blue-50 rounded-xl">
                                    <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                    <div className="text-lg font-bold text-blue-900">
                                        {enrollment?.highest_unlocked_level || 0}
                                    </div>
                                    <div className="text-xs text-blue-700">Levels</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                                    <Zap className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                                    <div className="text-lg font-bold text-yellow-900">
                                        {enrollment?.quiz_points || 0}
                                    </div>
                                    <div className="text-xs text-yellow-700">Points</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-xl">
                                    <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                    <div className="text-lg font-bold text-green-900">100%</div>
                                    <div className="text-xs text-green-700">Complete</div>
                                </div>
                            </div>

                            {/* Certificate Preview */}
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-dashed border-purple-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <Award className="w-6 h-6 text-purple-600" />
                                    <h4 className="font-semibold text-purple-900">Your Certificate</h4>
                                </div>
                                <p className="text-sm text-purple-700 mb-4">
                                    Generate your official completion certificate to celebrate this achievement!
                                </p>
                                <div className="text-xs text-purple-600">
                                    ✨ Includes your name, completion date, levels completed, and total points earned
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleGenerateCertificate}
                                    disabled={isGenerating}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isGenerating ? (
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
                                            <Award className="w-4 h-4" />
                                            Generate Certificate
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Certificate generated success
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Certificate Ready!</h2>
                                        <p className="text-sm text-gray-600">Download Available</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Success Animation */}
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", duration: 0.6 }}
                                    className="relative mx-auto mb-6"
                                >
                                    <div className="w-32 h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg border-4 border-yellow-400 flex items-center justify-center relative">
                                        <Award className="w-12 h-12 text-yellow-600" />
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="absolute -top-2 -right-2"
                                        >
                                            <Star className="w-6 h-6 text-yellow-500 fill-current" />
                                        </motion.div>
                                    </div>
                                </motion.div>
                                
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Certificate Generated!
                                </h3>
                                <p className="text-gray-600">
                                    Your official completion certificate is ready for download.
                                </p>
                            </div>

                            {/* Certificate Details */}
                            {certificateData && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-3">Certificate Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Program:</span>
                                            <span className="font-medium">{certificateData.program_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Completion Date:</span>
                                            <span className="font-medium">{certificateData.completion_date}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Levels Completed:</span>
                                            <span className="font-medium">{certificateData.levels_completed}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Points:</span>
                                            <span className="font-medium">{certificateData.total_points}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Certificate
                                </button>
                            </div>

                            {/* Additional Actions */}
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-500 mb-2">
                                    Share your achievement with family and friends!
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