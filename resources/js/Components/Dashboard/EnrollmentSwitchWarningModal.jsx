// resources/js/Components/Dashboard/EnrollmentSwitchWarningModal.jsx
import React from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { getProgramColors } from "@/Utils/programColors";
import { useTranslation } from "@/hooks/useTranslation";

export default function EnrollmentSwitchWarningModal({
    currentProgram,
    newProgram,
    onConfirm,
    onCancel,
}) {
    const { t } = useTranslation();
    const colors = getProgramColors(newProgram?.colorTheme || "blue");

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                {/* Warning Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                        <AlertTriangle className="text-yellow-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {t('dashboard.enrollment_switch_warning_title') || 'Switch Programs?'}
                    </h2>
                    <p className="text-gray-600">
                        {t('dashboard.enrollment_switch_warning_subtitle') || 'This will affect your current dashboard'}
                    </p>
                </div>

                {/* Current vs New Program */}
                <div className="space-y-4 mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-800">
                                    {t('dashboard.current_program')}
                                </p>
                                <p className="text-lg font-bold text-red-900">
                                    {currentProgram?.translated_name || currentProgram?.name}
                                </p>
                            </div>
                            <div className="text-red-600 text-sm">
                                {t('dashboard.will_be_marked_completed')}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <ArrowRight className="text-gray-400" size={24} />
                    </div>

                    <div className={`${colors.lightColor} border border-opacity-20 rounded-lg p-4`} 
                         style={{ borderColor: colors.borderColor }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium ${colors.textColor}`}>
                                    {t('dashboard.new_program')}
                                </p>
                                <p className={`text-lg font-bold ${colors.textColor}`}>
                                    {newProgram?.translated_name || newProgram?.name}
                                </p>
                            </div>
                            <div className={`${colors.textColor} text-sm`}>
                                {t('dashboard.new_dashboard')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warning Message */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                        {t('dashboard.important_notice') || 'Important Notice:'}
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-2">
                        <li className="flex items-start">
                            <span className="text-yellow-600 mr-2">•</span>
                            <span>
                                {t('dashboard.current_dashboard_disappear') || 'Your current program dashboard will disappear after enrollment'}
                            </span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-600 mr-2">•</span>
                            <span>
                                {t('dashboard.program_marked_finished') || 'Your current program will be marked as finished'}
                            </span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-600 mr-2">•</span>
                            <span>
                                {t('dashboard.new_dashboard_after_approval') || 'You will get a new dashboard after the enrollment is approved'}
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                    >
                        {t('common.cancel') || 'Cancel'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 ${colors.color} text-white py-3 rounded-lg font-medium transition-opacity hover:opacity-90`}
                    >
                        {t('dashboard.yes_switch_programs') || 'Yes, Switch Programs'}
                    </button>
                </div>
            </div>
        </div>
    );
}