import React, { useState } from "react";
import Select from "react-select";
import { Users, UserCheck, X, RefreshCw } from "lucide-react";

/**
 * Admin Mentor Reassignment Modal
 * Allows admins to change/reassign a mentor for a student enrollment
 */
export default function AdminMentorReassignmentModal({
    enrollment,
    availableMentors,
    onConfirm,
    onCancel,
}) {
    // Set initial selected mentor based on current assignment
    const initialMentor = enrollment.assigned_mentor
        ? {
              value: enrollment.assigned_mentor.id,
              label: enrollment.assigned_mentor.name,
              email: enrollment.assigned_mentor.email,
          }
        : null;

    const [selectedMentor, setSelectedMentor] = useState(initialMentor);

    /**
     * Prepare mentor options for react-select
     */
    const mentorOptions = availableMentors.map((mentor) => ({
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
            borderRadius: "0.75rem",
            borderWidth: "2px",
            borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
            padding: "0.5rem",
            fontSize: "1rem",
            fontWeight: "600",
            boxShadow: state.isFocused
                ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                : "none",
            "&:hover": {
                borderColor: "#3b82f6",
            },
            cursor: "pointer",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#3b82f6"
                : state.isFocused
                ? "#dbeafe"
                : "white",
            color: state.isSelected ? "white" : "#1e293b",
            fontWeight: state.isSelected ? "700" : "600",
            padding: "1rem",
            cursor: "pointer",
            "&:active": {
                backgroundColor: "#3b82f6",
            },
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "0.75rem",
            overflow: "hidden",
            marginTop: "0.5rem",
            boxShadow:
                "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            border: "2px solid #cbd5e1",
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "#1e293b",
            fontWeight: "600",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#94a3b8",
            fontWeight: "500",
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? "#3b82f6" : "#64748b",
            "&:hover": {
                color: "#3b82f6",
            },
        }),
        indicatorSeparator: () => ({
            display: "none",
        }),
    };

    /**
     * Format option label with mentor details
     */
    const formatOptionLabel = ({ label, email }) => (
        <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-700" />
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

    /**
     * Check if mentor has changed from the original assignment
     */
    const hasChanged =
        selectedMentor?.value !== (enrollment.assigned_mentor?.id || null);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <RefreshCw className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Change Mentor Assignment
                                </h2>
                                <p className="text-blue-100 text-sm mt-1">
                                    Reassign a mentor for this student
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
                    {/* Student Info */}
                    <div className="bg-slate-50 rounded-xl p-5 mb-6 border-2 border-slate-200">
                        <p className="text-slate-700 text-sm font-semibold mb-2">
                            Student:
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                            {enrollment.user?.name || "Unknown Student"}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                            {enrollment.user?.email || "No email"}
                        </p>
                    </div>

                    {/* Program Info */}
                    <div className="bg-blue-50 rounded-xl p-5 mb-6 border-2 border-blue-200">
                        <p className="text-slate-700 text-sm font-semibold mb-1">
                            Program:
                        </p>
                        <p className="text-xl font-bold text-blue-900">
                            {enrollment.program?.name || "Unknown Program"}
                        </p>
                    </div>

                    {/* Current Mentor */}
                    {enrollment.assigned_mentor && (
                        <div className="bg-amber-50 rounded-xl p-5 mb-6 border-2 border-amber-200">
                            <p className="text-slate-700 text-sm font-semibold mb-2">
                                Current Mentor:
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-amber-700" />
                                </div>
                                <div>
                                    <p className="font-bold text-amber-900">
                                        {enrollment.assigned_mentor.name}
                                    </p>
                                    <p className="text-sm text-amber-700">
                                        {enrollment.assigned_mentor.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mentor Selection */}
                    <div className="mb-8">
                        <label className="block text-lg font-bold text-slate-900 mb-3">
                            {enrollment.assigned_mentor
                                ? "Select New Mentor"
                                : "Assign Mentor"}{" "}
                            <span className="text-red-600">*</span>
                        </label>
                        <Select
                            options={mentorOptions}
                            value={selectedMentor}
                            onChange={setSelectedMentor}
                            styles={customSelectStyles}
                            formatOptionLabel={formatOptionLabel}
                            placeholder="Choose a mentor..."
                            isSearchable
                            required
                            className="mentor-select"
                        />
                        <p className="text-sm text-slate-600 mt-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <strong>Note:</strong> Changing the mentor will
                            update the student's assigned mentor. The student
                            will be able to contact and schedule meetings with
                            the new mentor.
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
                        <div className="flex gap-3">
                            <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-blue-900 mb-2">
                                    Admin Responsibilities
                                </h3>
                                <ul className="text-sm text-blue-800 space-y-2">
                                    <li className="flex gap-2">
                                        <span>•</span>
                                        <span>
                                            Ensure the new mentor has capacity
                                            for additional students
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span>•</span>
                                        <span>
                                            Consider notifying both the student
                                            and new mentor about the change
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span>•</span>
                                        <span>
                                            The change takes effect immediately
                                        </span>
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
                            disabled={!selectedMentor || !hasChanged}
                            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                                selectedMentor && hasChanged
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                    : "bg-gray-300 text-gray-500"
                            }`}
                        >
                            {!selectedMentor
                                ? "Please Select a Mentor"
                                : !hasChanged
                                ? "No Changes Made"
                                : "Confirm Change"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
