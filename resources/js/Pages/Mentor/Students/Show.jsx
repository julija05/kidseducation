import MentorLayout from "@/Layouts/MentorLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, BookOpen, CalendarClock } from "lucide-react";

export default function Show({ student, group, notes = [], noteOptions = {} }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        note: "",
        lesson_id: "",
        live_session_id: "",
        visible_to_parent: false,
    });

    const submit = (event) => {
        event.preventDefault();
        post(route("mentor.learning-groups.students.notes.store", [group.id, student.id]), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <MentorLayout>
            <Head title={`${student.name} - Mentor notes`} />
            <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <div>
                    <Link href={route("mentor.learning-groups.show", group.id)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
                        <ArrowLeft className="h-4 w-4" /> Back to {group.name}
                    </Link>
                    <h1 className="mt-4 text-3xl font-bold text-slate-950">{student.name}</h1>
                    <p className="mt-1 text-slate-600">{student.email} · Progress: {student.progress ?? 0}%</p>
                </div>

                <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-950">Add mentor note</h2>
                    <p className="mt-1 text-sm text-slate-500">The group and student are recorded automatically. Lesson and live session are optional.</p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <Field label="Lesson (optional)" error={errors.lesson_id}>
                            <select value={data.lesson_id} onChange={(e) => setData("lesson_id", e.target.value)} className="w-full rounded-lg border-slate-300">
                                <option value="">No lesson</option>
                                {(noteOptions.lessons || []).map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
                            </select>
                        </Field>
                        <Field label="Live session (optional)" error={errors.live_session_id}>
                            <select value={data.live_session_id} onChange={(e) => setData("live_session_id", e.target.value)} className="w-full rounded-lg border-slate-300">
                                <option value="">No live session</option>
                                {(noteOptions.liveSessions || []).map((session) => <option key={session.id} value={session.id}>{session.title} · {session.date}</option>)}
                            </select>
                        </Field>
                    </div>
                    <Field label="Note" error={errors.note} className="mt-4">
                        <textarea value={data.note} onChange={(e) => setData("note", e.target.value)} rows={5} required className="w-full rounded-lg border-slate-300" placeholder="Write an observation about this student..." />
                    </Field>
                    <label className="mt-4 flex items-start gap-3 rounded-lg border border-slate-200 p-4">
                        <input type="checkbox" checked={data.visible_to_parent} onChange={(e) => setData("visible_to_parent", e.target.checked)} className="mt-1 rounded border-slate-300 text-sky-600" />
                        <span><span className="block font-semibold text-slate-900">Visible to parent</span><span className="text-sm text-slate-500">If unchecked, only you can see this note.</span></span>
                    </label>
                    <button disabled={processing} className="mt-5 rounded-lg bg-sky-600 px-4 py-2.5 font-semibold text-white hover:bg-sky-700 disabled:opacity-50">Save note</button>
                </form>

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-6"><h2 className="text-lg font-bold text-slate-950">Mentor notes</h2></div>
                    {notes.length ? <div className="divide-y divide-slate-100">{notes.map((note) => (
                        <article key={note.id} className="p-6">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                                <span>{note.created_at}</span>
                                <span className={`rounded-full px-2 py-1 ${note.visible_to_parent ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{note.visible_to_parent ? "Visible to parent" : "Private"}</span>
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-slate-800">{note.note}</p>
                            {(note.lesson || note.live_session) && <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">{note.lesson && <span className="inline-flex gap-1"><BookOpen className="h-4 w-4" />{note.lesson.title}</span>}{note.live_session && <span className="inline-flex gap-1"><CalendarClock className="h-4 w-4" />{note.live_session.title}</span>}</div>}
                        </article>
                    ))}</div> : <p className="p-8 text-center text-slate-500">No notes recorded for this student in {group.name}.</p>}
                </section>
            </div>
        </MentorLayout>
    );
}

function Field({ label, error, className = "", children }) {
    return <label className={`block ${className}`}><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>{children}{error && <span className="mt-1 block text-sm text-red-600">{error}</span>}</label>;
}
