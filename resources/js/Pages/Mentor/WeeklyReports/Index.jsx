import MentorLayout from "@/Layouts/MentorLayout";
import { Head, router } from "@inertiajs/react";
import { FileText, Filter, RotateCcw } from "lucide-react";
import { useState } from "react";

export default function Index({ reports, groups, students, filters }) {
    const [values, setValues] = useState(filters);

    const submit = (event) => {
        event.preventDefault();
        router.get(route("mentor.weekly-reports.index"), values, { preserveState: true, replace: true });
    };

    const clear = () => {
        const empty = { group_id: "", student_id: "", date_from: "", date_to: "" };
        setValues(empty);
        router.get(route("mentor.weekly-reports.index"), empty, { replace: true });
    };

    return (
        <MentorLayout>
            <Head title="Weekly Reports" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-950">Weekly reports</h1>
                    <p className="mt-1 text-sm text-slate-600">Review reports published for your groups and students.</p>
                </div>

                <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <FilterSelect label="Group" value={values.group_id} onChange={(value) => setValues({ ...values, group_id: value })} options={groups} placeholder="All groups" />
                        <FilterSelect label="Student" value={values.student_id} onChange={(value) => setValues({ ...values, student_id: value })} options={students} placeholder="All students" />
                        <FilterInput label="From date" value={values.date_from} onChange={(value) => setValues({ ...values, date_from: value })} />
                        <FilterInput label="To date" value={values.date_to} onChange={(value) => setValues({ ...values, date_to: value })} />
                    </div>
                    <div className="mt-4 flex gap-3">
                        <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Filter className="h-4 w-4" />Apply filters</button>
                        <button type="button" onClick={clear} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RotateCcw className="h-4 w-4" />Clear</button>
                    </div>
                </form>

                {reports.length ? (
                    <div className="space-y-4">
                        {reports.map((report) => <ReportCard key={report.id} report={report} />)}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
                        <FileText className="mx-auto h-9 w-9 text-slate-400" />
                        <h2 className="mt-3 font-semibold text-slate-950">No reports found</h2>
                        <p className="mt-1 text-sm text-slate-600">Adjust the filters or publish a report from a group dashboard.</p>
                    </div>
                )}
            </div>
        </MentorLayout>
    );
}

function ReportCard({ report }) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-950">Week {report.week_number} · {report.group?.name || "Group unavailable"}</h2>
                    <p className="mt-1 text-sm text-slate-500">{report.audience} · Published {report.published_at}</p>
                </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <ReportSection title="What we learned" text={report.what_we_learned} />
                <ReportSection title="What to practice" text={report.what_to_practice} />
                <ReportSection title="Next week focus" text={report.next_focus} />
            </div>
            {report.individual_notes.length > 0 && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <h3 className="text-sm font-semibold text-blue-950">Individual notes</h3>
                    {report.individual_notes.map((note) => <p key={note.child_id} className="mt-2 whitespace-pre-wrap text-sm text-blue-900"><span className="font-semibold">{note.child_name}:</span> {note.note}</p>)}
                </div>
            )}
        </article>
    );
}

function ReportSection({ title, text }) {
    return <div><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{text}</p></div>;
}

function FilterSelect({ label, value, onChange, options, placeholder }) {
    return <label className="text-sm font-semibold text-slate-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block w-full rounded-md border-slate-300"><option value="">{placeholder}</option>{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>;
}

function FilterInput({ label, value, onChange }) {
    return <label className="text-sm font-semibold text-slate-700">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block w-full rounded-md border-slate-300" /></label>;
}
