// resources/js/Components/Dashboard/EnrollmentConfirmationModal.jsx
import React from "react";
import { getProgramColors } from "@/Utils/programColors";

export default function EnrollmentConfirmationModal({
    program,
    onConfirm,
    onCancel,
}) {
    const colors = getProgramColors(program?.colorTheme || "blue");

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-center">
                    Confirm Enrollment
                </h2>

                <div className={`${colors.lightColor} rounded-lg p-4 mb-6`}>
                    <p className="text-center text-gray-700">
                        Are you sure you want to enroll in
                    </p>
                    <p
                        className={`text-xl font-bold ${colors.textColor} text-center mt-2`}
                    >
                        {program?.name || "this program"}?
                    </p>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">
                            {program?.duration || "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">
                            ${program?.price || "0"}
                        </span>
                    </div>
                </div>

                <p className="text-sm text-gray-500 mb-6 text-center">
                    Your enrollment request will be reviewed by our team. We'll
                    contact you at your email address once approved.
                </p>

                <div className="flex space-x-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 ${colors.color} text-white py-3 rounded-lg font-medium transition-opacity`}
                    >
                        Yes, Enroll Me
                    </button>
                </div>
            </div>
        </div>
    );
}
