// resources/js/Components/Dashboard/PendingEnrollment.jsx
import React, { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { AlertCircle, X, BookOpen, Play } from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";
import { useTranslation } from "@/hooks/useTranslation";

export default function PendingEnrollment({ enrollment, userDemoAccess }) {
    const { t } = useTranslation();
    const [isCanceling, setIsCanceling] = useState(false);

    // Debug logging
    console.log('PendingEnrollment rendered with userDemoAccess:', userDemoAccess);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const program = enrollment?.program || {};

    // Safe icon selection with fallback
    const Icon =
        program.icon && iconMap[program.icon]
            ? iconMap[program.icon]
            : BookOpen;

    // Default values if properties are missing
    const lightColor = program.lightColor || "bg-gray-100";
    const textColor = program.textColor || "text-gray-900";

    const handleCancelEnrollment = () => {
        setIsCanceling(true);

        router.post(
            route("enrollments.cancel", enrollment.id),
            {},
            {
                onSuccess: () => {
                    setShowCancelConfirm(false);
                    setIsCanceling(false);
                },
                onError: () => {
                    setIsCanceling(false);
                    alert(t('dashboard.error_occurred'));
                },
            }
        );
    };

    return (
        <>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 relative">
                {/* Cancel button in top right */}
                <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="absolute top-4 right-4 text-yellow-600 hover:text-yellow-800 transition-colors"
                    title={t('dashboard.cancel_enrollment_request')}
                >
                    <X size={24} />
                </button>

                <div className="text-center">
                    <AlertCircle
                        className="text-yellow-600 mx-auto mb-4"
                        size={64}
                    />
                    <h2 className="text-2xl font-bold text-yellow-800 mb-3">
                        {t('dashboard.enrollment_request_pending')}
                    </h2>
                    <p className="text-lg text-yellow-700 mb-6">
                        {t('dashboard.enrollment_request_sent', { program: program.name || 'this program' })}
                    </p>
                    <p className="text-yellow-600 mb-6">
                        {t('dashboard.enrollment_review_message')}
                    </p>

                    {/* Return to Demo Button */}
                    {userDemoAccess && (
                        <div className="mb-6">
                            <Link
                                href={`/demo/${userDemoAccess.program_slug}/dashboard`}
                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-blue-600 font-medium transition-all transform hover:scale-105 shadow-lg"
                            >
                                <Play size={20} />
                                <span>Return to Demo</span>
                            </Link>
                            <p className="text-sm text-yellow-600 mt-2">
                                Continue exploring while waiting for approval
                                {userDemoAccess.days_remaining > 0 && (
                                    <> • {userDemoAccess.days_remaining} days remaining</>
                                )}
                            </p>
                        </div>
                    )}

                    <div
                        className={`${lightColor} rounded-lg p-6 inline-block`}
                    >
                        <Icon className={textColor} size={48} />
                        <h3
                            className={`text-xl font-semibold ${textColor} mt-3`}
                        >
                            {program.name || t('dashboard.program')}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                            {t('dashboard.requested_on')}:{" "}
                            {enrollment?.created_at
                                ? new Date(
                                      enrollment.created_at
                                  ).toLocaleDateString()
                                : t('dashboard.na')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4 text-center">
                            {t('dashboard.cancel_enrollment_title')}
                        </h3>
                        <p className="text-gray-600 mb-6 text-center">
                            {t('dashboard.cancel_enrollment_confirm', { program: program.name })}
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                disabled={isCanceling}
                            >
                                {t('dashboard.keep_request')}
                            </button>
                            <button
                                onClick={handleCancelEnrollment}
                                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                                disabled={isCanceling}
                            >
                                {isCanceling ? t('dashboard.canceling') : t('dashboard.yes_cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
