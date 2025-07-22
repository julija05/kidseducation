// resources/js/Components/Dashboard/PendingEnrollment.jsx
import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { AlertCircle, X, BookOpen } from "lucide-react";
import { iconMap } from "@/Utils/iconMapping";

export default function PendingEnrollment({ enrollment }) {
    const [isCanceling, setIsCanceling] = useState(false);
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
                    alert("An error occurred. Please try again.");
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
                    title="Cancel enrollment request"
                >
                    <X size={24} />
                </button>

                <div className="text-center">
                    <AlertCircle
                        className="text-yellow-600 mx-auto mb-4"
                        size={64}
                    />
                    <h2 className="text-2xl font-bold text-yellow-800 mb-3">
                        Enrollment Request Pending
                    </h2>
                    <p className="text-lg text-yellow-700 mb-6">
                        Your request to enroll in{" "}
                        <span className="font-semibold">
                            {program.name || "this program"}
                        </span>{" "}
                        has been sent successfully!
                    </p>
                    <p className="text-yellow-600 mb-8">
                        We will review your application and contact you at your
                        email address as soon as possible.
                    </p>

                    <div
                        className={`${lightColor} rounded-lg p-6 inline-block`}
                    >
                        <Icon className={textColor} size={48} />
                        <h3
                            className={`text-xl font-semibold ${textColor} mt-3`}
                        >
                            {program.name || "Program"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                            Requested on:{" "}
                            {enrollment?.created_at
                                ? new Date(
                                      enrollment.created_at
                                  ).toLocaleDateString()
                                : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4 text-center">
                            Cancel Enrollment Request?
                        </h3>
                        <p className="text-gray-600 mb-6 text-center">
                            Are you sure you want to cancel your enrollment
                            request for{" "}
                            <span className="font-semibold">
                                {program.name}
                            </span>
                            ?
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                disabled={isCanceling}
                            >
                                Keep Request
                            </button>
                            <button
                                onClick={handleCancelEnrollment}
                                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                                disabled={isCanceling}
                            >
                                {isCanceling ? "Canceling..." : "Yes, Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
