import { Link, useForm } from "@inertiajs/react";
import { Save, X } from "lucide-react";

const labels = {
    draft: "Draft",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
};

export default function GroupForm({
    programs,
    statuses,
    submitRoute,
    cancelRoute,
    mentors = [],
    showMentor = false,
}) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        program_id: "",
        mentor_id: "",
        start_date: "",
        end_date: "",
        status: "draft",
        max_students: 10,
        description: "",
    });

    const canSubmit = programs.length > 0 && (!showMentor || mentors.length > 0);

    const handleSubmit = (event) => {
        event.preventDefault();
        post(submitRoute);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Group name</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(event) => setData("name", event.target.value)}
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Program</label>
                    <select
                        value={data.program_id}
                        onChange={(event) => setData("program_id", event.target.value)}
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Select program</option>
                        {programs.map((program) => (
                            <option key={program.id} value={program.id}>
                                {program.name}
                            </option>
                        ))}
                    </select>
                    {errors.program_id && <p className="mt-1 text-sm text-red-600">{errors.program_id}</p>}
                </div>

                {showMentor && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mentor</label>
                        <select
                            value={data.mentor_id}
                            onChange={(event) => setData("mentor_id", event.target.value)}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select mentor</option>
                            {mentors.map((mentor) => (
                                <option key={mentor.id} value={mentor.id}>
                                    {mentor.name} ({mentor.email})
                                </option>
                            ))}
                        </select>
                        {errors.mentor_id && <p className="mt-1 text-sm text-red-600">{errors.mentor_id}</p>}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        value={data.status}
                        onChange={(event) => setData("status", event.target.value)}
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {labels[status] || status}
                            </option>
                        ))}
                    </select>
                    {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Start date</label>
                    <input
                        type="date"
                        value={data.start_date}
                        onChange={(event) => setData("start_date", event.target.value)}
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">End date</label>
                    <input
                        type="date"
                        value={data.end_date}
                        onChange={(event) => setData("end_date", event.target.value)}
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Max students</label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={data.max_students}
                        onChange={(event) => setData("max_students", event.target.value)}
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.max_students && <p className="mt-1 text-sm text-red-600">{errors.max_students}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    rows="5"
                    value={data.description}
                    onChange={(event) => setData("description", event.target.value)}
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {!canSubmit && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {showMentor
                        ? "Create at least one active program and mentor before creating a group."
                        : "You need an approved mentor enrollment in an active program before creating a group."}
                </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
                <Link
                    href={cancelRoute}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    <X className="h-4 w-4" />
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={processing || !canSubmit}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                    <Save className="h-4 w-4" />
                    Create group
                </button>
            </div>
        </form>
    );
}
