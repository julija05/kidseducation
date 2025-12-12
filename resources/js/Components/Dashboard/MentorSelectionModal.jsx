import React, { useState } from "react";
import Select from "react-select";
import { Users, UserCheck, X } from "lucide-react";
import { getProgramColors } from "@/Utils/programColors";

/**
 * Mentor Selection Modal
 * Allows students to select a mentor when enrolling in a program
 */
export default function MentorSelectionModal({
    program,
    availableMentors,
    onConfirm,
    onCancel,
}) {
    const [selectedMentor, setSelectedMentor] = useState(null);
    const colors = getProgramColors(program?.colorTheme || "blue");

    /**
     * Prepare mentor options for react-select
     */
    const mentorOptions = availableMentors.map(mentor => ({
        value: mentor.id,
        label: mentor.name,
        email: mentor.email,
    }));

    /**
     * Custom styles for react-select to match design
     */
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderRadius: '0.75rem',
            borderWidth: '2px',
            borderColor: state.isFocused ? '#10b981' : '#cbd5e1',
            padding: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
            '&:hover': {
                borderColor: '#10b981',
            },
            cursor: 'pointer',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#10b981'
                : state.isFocused
                ? '#d1fae5'
                : 'white',
            color: state.isSelected ? 'white' : '#1e293b',
            fontWeight: state.isSelected ? '700' : '600',
            padding: '1rem',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#10b981',
            },
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '0.75rem',
            overflow: 'hidden',
            marginTop: '0.5rem',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            border: '2px solid #cbd5e1',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#1e293b',
            fontWeight: '600',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#94a3b8',
            fontWeight: '500',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#10b981' : '#64748b',
            '&:hover': {
                color: '#10b981',
            },
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
    };

    /**
     * Format option label with mentor details
     */
    const formatOptionLabel = ({ label, email }) => (
        <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{label}</p>
                <p className="text-sm text-slate-600 truncate">{email}</p>
            </div>
        </div>
    );

    /**
     * Handle confirm - pass selected mentor to parent
     */
    const handleConfirm = () => {
        if (selectedMentor) {
            onConfirm(selectedMentor.value);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <UserCheck className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Choose Your Mentor
                                </h2>
                                <p className="text-emerald-100 text-sm mt-1">
                                    Select a mentor to guide you through your learning journey
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    {/* Program Info */}
                    <div className={`${colors.lightColor} rounded-xl p-5 mb-6 border-2 ${colors.color.replace('bg-', 'border-')}`}>
                        <p className="text-slate-700 text-sm font-semibold mb-1">
                            Enrolling in:
                        </p>
                        <p className={`text-2xl font-bold ${colors.textColor}`}>
                            {program?.name || "this program"}
                        </p>
                    </div>

                    {/* Mentor Selection */}
                    <div className="mb-8">
                        <label className="block text-lg font-bold text-slate-900 mb-3">
                            Select Your Mentor <span className="text-red-600">*</span>
                        </label>
                        <Select
                            options={mentorOptions}
                            value={selectedMentor}
                            onChange={setSelectedMentor}
                            styles={customSelectStyles}
                            formatOptionLabel={formatOptionLabel}
                            placeholder="Choose a mentor to guide you..."
                            isSearchable
                            required
                            className="mentor-select"
                        />
                        <p className="text-sm text-slate-600 mt-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <strong>Note:</strong> Your mentor will guide you through your learning journey,
                            answer your questions, and help you achieve your goals.
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
                        <div className="flex gap-3">
                            <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-blue-900 mb-2">What happens next?</h3>
                                <ul className="text-sm text-blue-800 space-y-2">
                                    <li className="flex gap-2">
                                        <span>✓</span>
                                        <span>Your enrollment request will be reviewed by our team</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span>✓</span>
                                        <span>You'll receive an email notification once approved</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span>✓</span>
                                        <span>Your chosen mentor will be notified and can start helping you</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 p-6 rounded-b-2xl border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedMentor}
                            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                                selectedMentor
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                                    : 'bg-gray-300 text-gray-500'
                            }`}
                        >
                            {selectedMentor ? 'Confirm & Enroll' : 'Please Select a Mentor'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
