import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import ParentLayout from "@/Layouts/ParentLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Save } from "lucide-react";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        child_name: "",
        age: "",
        grade_class: "",
        notes: "",
    });

    const submit = (event) => {
        event.preventDefault();
        post(route("parent.child-profiles.store"));
    };

    return (
        <ParentLayout>
            <Head title="Add Child Profile" />

            <div className="mx-auto max-w-3xl space-y-6">
                <Link
                    href={route("parent.dashboard")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to dashboard
                </Link>

                <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h1 className="text-xl font-semibold text-slate-950">Add child profile</h1>
                        <p className="mt-1 text-sm text-slate-600">
                            This creates a child record linked to your parent account without creating a child login.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-5 p-5">
                        <div>
                            <InputLabel htmlFor="child_name" value="Child name" />
                            <input
                                id="child_name"
                                type="text"
                                value={data.child_name}
                                onChange={(event) => setData("child_name", event.target.value)}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                                required
                            />
                            <InputError message={errors.child_name} className="mt-2" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="age" value="Age" />
                                <input
                                    id="age"
                                    type="number"
                                    min="0"
                                    max="25"
                                    value={data.age}
                                    onChange={(event) => setData("age", event.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                                />
                                <InputError message={errors.age} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="grade_class" value="Grade/Class" />
                                <input
                                    id="grade_class"
                                    type="text"
                                    value={data.grade_class}
                                    onChange={(event) => setData("grade_class", event.target.value)}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                                />
                                <InputError message={errors.grade_class} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="notes" value="Notes" />
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={(event) => setData("notes", event.target.value)}
                                rows="5"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500"
                            />
                            <InputError message={errors.notes} className="mt-2" />
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                            <Link
                                href={route("parent.dashboard")}
                                className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                            >
                                <Save className="h-4 w-4" />
                                Save profile
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </ParentLayout>
    );
}
