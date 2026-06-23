import { router } from "@inertiajs/react";
import { Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";

export default function GroupStudentsManager({ group, storeRoute, destroyRoute, compact = false }) {
    const [studentId, setStudentId] = useState("");

    const addStudent = (event) => {
        event.preventDefault();

        if (!studentId) {
            return;
        }

        router.post(storeRoute(group.id), { student_id: studentId }, {
            preserveScroll: true,
            onSuccess: () => setStudentId(""),
        });
    };

    const removeStudent = (student) => {
        router.delete(destroyRoute(group.id, student.id), {
            preserveScroll: true,
        });
    };

    const isFull = group.students_count >= group.max_students;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{group.students_count}/{group.max_students} students</span>
                </div>
            </div>

            <form onSubmit={addStudent} className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-[1fr_auto]"}`}>
                <select
                    value={studentId}
                    onChange={(event) => setStudentId(event.target.value)}
                    disabled={isFull || group.available_students.length === 0}
                    className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                >
                    <option value="">
                        {isFull
                            ? "Group is full"
                            : group.available_students.length === 0
                                ? "No approved students available"
                                : "Select approved student"}
                    </option>
                    {group.available_students.map((student) => (
                        <option key={student.id} value={student.id}>
                            {student.name} ({student.email})
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    disabled={!studentId || isFull}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    <UserPlus className="h-4 w-4" />
                    Add
                </button>
            </form>

            {group.students.length > 0 && (
                <div className="space-y-2">
                    {group.students.map((student) => (
                        <div
                            key={student.id}
                            className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                        >
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="truncate text-xs text-gray-500">{student.email}</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeStudent(student)}
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                                title="Remove student"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
