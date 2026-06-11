import AbacusSimulator from "@/Components/AbacusSimulator";
import MentorResourceViewer from "@/Components/Lessons/Resources/Viewers/MentorResourceViewer";
import MentorLayout from "@/Layouts/MentorLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Award,
    BarChart3,
    BookOpen,
    Calendar,
    Calculator,
    ChevronLeft,
    ChevronRight,
    Download,
    Edit,
    ExternalLink,
    File,
    FileText,
    Layers,
    Maximize2,
    Plus,
    PlusCircle,
    Search,
    Trash2,
    TrendingUp,
    Users,
    Video,
    X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const TABS = {
    CONTENT: "content",
    STUDENTS: "students",
};

const SORT_OPTIONS = {
    NAME_ASC: "name_asc",
    PROGRESS_DESC: "progress_desc",
    PROGRESS_ASC: "progress_asc",
    POINTS_DESC: "points_desc",
    LEVEL_DESC: "level_desc",
};

const sortStudents = (students, sortOption) => {
    const sorted = [...students];

    return sorted.sort((a, b) => {
        if (sortOption === SORT_OPTIONS.PROGRESS_DESC) return (b.progress || 0) - (a.progress || 0);
        if (sortOption === SORT_OPTIONS.PROGRESS_ASC) return (a.progress || 0) - (b.progress || 0);
        if (sortOption === SORT_OPTIONS.POINTS_DESC) return (b.quiz_points || 0) - (a.quiz_points || 0);
        if (sortOption === SORT_OPTIONS.LEVEL_DESC) {
            return (b.highest_unlocked_level || 1) - (a.highest_unlocked_level || 1);
        }

        return a.name.localeCompare(b.name);
    });
};

const isMentalArithmeticProgram = (program) => {
    const slug = program?.slug?.toLowerCase() || "";
    const name = program?.name?.toLowerCase() || "";

    return slug.includes("mental-arithmetic") || name.includes("mental arithmetic");
};

export default function ProgramView({ program, students = [], lessons = [], mentorEnrollment }) {
    const [activeTab, setActiveTab] = useState(TABS.CONTENT);
    const [lessonSearch, setLessonSearch] = useState("");
    const [studentSearch, setStudentSearch] = useState("");
    const [studentSort, setStudentSort] = useState(SORT_OPTIONS.NAME_ASC);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [selectedResource, setSelectedResource] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showAbacus, setShowAbacus] = useState(false);

    const lessonsArray = useMemo(() => Object.values(lessons || {}).flat(), [lessons]);
    const resourceCount = useMemo(
        () => lessonsArray.reduce((total, lesson) => total + (lesson.resources?.length || 0), 0),
        [lessonsArray]
    );

    useEffect(() => {
        if (!selectedLesson && lessonsArray.length > 0) {
            setSelectedLesson(lessonsArray[0]);
        }
    }, [lessonsArray, selectedLesson]);

    useEffect(() => {
        setSelectedResource(selectedLesson?.resources?.[0] || null);
    }, [selectedLesson]);

    const filteredLessons = useMemo(() => {
        const query = lessonSearch.trim().toLowerCase();
        if (!query) return lessonsArray;

        return lessonsArray.filter((lesson) =>
            lesson.title?.toLowerCase().includes(query) ||
            lesson.description?.toLowerCase().includes(query)
        );
    }, [lessonSearch, lessonsArray]);

    const lessonsByLevel = useMemo(() => {
        return filteredLessons.reduce((groups, lesson) => {
            const level = lesson.level || 1;
            if (!groups[level]) groups[level] = [];
            groups[level].push(lesson);
            return groups;
        }, {});
    }, [filteredLessons]);

    const levelNumbers = Object.keys(lessonsByLevel).sort((a, b) => Number(a) - Number(b));

    const selectedLessonIndex = filteredLessons.findIndex((lesson) => lesson.id === selectedLesson?.id);
    const previousLesson = selectedLessonIndex > 0 ? filteredLessons[selectedLessonIndex - 1] : null;
    const nextLesson =
        selectedLessonIndex >= 0 && selectedLessonIndex < filteredLessons.length - 1
            ? filteredLessons[selectedLessonIndex + 1]
            : null;

    const studentStats = useMemo(() => {
        if (!students.length) {
            return {
                averageProgress: 0,
                averagePoints: 0,
                highestLevel: 0,
            };
        }

        return {
            averageProgress: Math.round(students.reduce((sum, student) => sum + (student.progress || 0), 0) / students.length),
            averagePoints: Math.round(students.reduce((sum, student) => sum + (student.quiz_points || 0), 0) / students.length),
            highestLevel: Math.max(...students.map((student) => student.highest_unlocked_level || 1)),
        };
    }, [students]);

    const filteredStudents = useMemo(() => {
        const query = studentSearch.trim().toLowerCase();
        const filtered = query
            ? students.filter((student) =>
                student.name?.toLowerCase().includes(query) ||
                student.email?.toLowerCase().includes(query)
            )
            : students;

        return sortStudents(filtered, studentSort);
    }, [students, studentSearch, studentSort]);

    const currentLessonNumber = selectedLessonIndex >= 0 ? selectedLessonIndex + 1 : 0;
    const canUseAbacus = isMentalArithmeticProgram(program);

    const handleProposeAddResource = (lessonId) => {
        router.get(route("mentor.proposals.resources.create", lessonId));
    };

    const handleProposeUpdateResource = (resourceId) => {
        router.get(route("mentor.proposals.resources.edit", resourceId));
    };

    const handleProposeDeleteResource = (resourceId) => {
        if (confirm("Propose deleting this resource?")) {
            router.post(route("mentor.proposals.resources.delete", resourceId), {}, { preserveScroll: true });
        }
    };

    const handleProposeAddLesson = () => {
        router.get(route("mentor.proposals.lessons.create", program.slug));
    };

    const handleProposeUpdateLesson = (lessonId) => {
        router.get(route("mentor.proposals.lessons.edit", lessonId));
    };

    const handleProposeAddLevel = () => {
        router.get(route("mentor.proposals.levels.create", program.slug));
    };

    const handleDownloadResource = (resourceId) => {
        window.open(route("lesson-resources.download", resourceId), "_blank");
    };

    return (
        <MentorLayout>
            <Head title={`${program.name} - Mentor Program`} />

            <div className="space-y-6">
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <Link
                                href={route("mentor.dashboard")}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to mentor overview
                            </Link>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">{program.name}</h1>
                                    <p className="mt-1 max-w-3xl text-sm text-slate-600">{program.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={route("mentor.meetings.create")}
                                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                            >
                                <Calendar className="h-4 w-4" />
                                Schedule class
                            </Link>
                            {canUseAbacus && (
                                <button
                                    type="button"
                                    onClick={() => setShowAbacus(true)}
                                    className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                                >
                                    <Calculator className="h-4 w-4" />
                                    Open abacus
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleProposeAddLesson}
                                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                            >
                                <Plus className="h-4 w-4" />
                                Propose lesson
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Metric icon={BookOpen} label="Lessons" value={lessonsArray.length} />
                        <Metric icon={FileText} label="Resources" value={resourceCount} tone="blue" />
                        <Metric icon={Users} label="Students" value={students.length} tone="emerald" />
                        <Metric icon={TrendingUp} label="Avg progress" value={`${studentStats.averageProgress}%`} tone="amber" />
                    </div>
                </section>

                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                    <TabButton
                        active={activeTab === TABS.CONTENT}
                        icon={Layers}
                        label="Lessons & resources"
                        onClick={() => setActiveTab(TABS.CONTENT)}
                    />
                    <TabButton
                        active={activeTab === TABS.STUDENTS}
                        icon={Users}
                        label="Students"
                        onClick={() => setActiveTab(TABS.STUDENTS)}
                    />
                </div>

                {activeTab === TABS.CONTENT ? (
                    <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                        <Panel
                            title="Lesson plan"
                            subtitle="Pick a lesson, then preview or manage its resources."
                            action={
                                <button
                                    type="button"
                                    onClick={handleProposeAddLevel}
                                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    Level
                                </button>
                            }
                        >
                            <div className="border-b border-slate-200 p-4">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="search"
                                        value={lessonSearch}
                                        onChange={(event) => setLessonSearch(event.target.value)}
                                        placeholder="Search lessons"
                                        className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-slate-500 focus:ring-slate-500"
                                    />
                                </div>
                            </div>

                            {levelNumbers.length ? (
                                <div className="max-h-[760px] overflow-y-auto p-4">
                                    <div className="space-y-5">
                                        {levelNumbers.map((level) => (
                                            <div key={level}>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-950">Level {level}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {lessonsByLevel[level].length} lesson
                                                            {lessonsByLevel[level].length === 1 ? "" : "s"}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleProposeAddLesson}
                                                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                        title="Propose lesson"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {lessonsByLevel[level].map((lesson) => (
                                                        <button
                                                            key={lesson.id}
                                                            type="button"
                                                            onClick={() => setSelectedLesson(lesson)}
                                                            className={`w-full rounded-md border p-3 text-left transition ${
                                                                selectedLesson?.id === lesson.id
                                                                    ? "border-slate-900 bg-slate-900 text-white"
                                                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="line-clamp-2 text-sm font-semibold">{lesson.title}</p>
                                                                    <p
                                                                        className={`mt-1 text-xs ${
                                                                            selectedLesson?.id === lesson.id ? "text-slate-300" : "text-slate-500"
                                                                        }`}
                                                                    >
                                                                        {lesson.resources?.length || 0} resource
                                                                        {lesson.resources?.length === 1 ? "" : "s"}
                                                                    </p>
                                                                </div>
                                                                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <EmptyState
                                    icon={BookOpen}
                                    title="No lessons found"
                                    text={lessonSearch ? "Try a different search term." : "This program has no lessons yet."}
                                />
                            )}
                        </Panel>

                        <div className="space-y-6">
                            <Panel
                                title={selectedLesson ? selectedLesson.title : "Select a lesson"}
                                subtitle={
                                    selectedLesson
                                        ? `Lesson ${currentLessonNumber} of ${filteredLessons.length} in the current view`
                                        : "Choose a lesson from the lesson plan."
                                }
                                action={
                                    selectedLesson && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => previousLesson && setSelectedLesson(previousLesson)}
                                                disabled={!previousLesson}
                                                className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                title="Previous lesson"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => nextLesson && setSelectedLesson(nextLesson)}
                                                disabled={!nextLesson}
                                                className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                title="Next lesson"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleProposeUpdateLesson(selectedLesson.id)}
                                                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit proposal
                                            </button>
                                        </div>
                                    )
                                }
                            >
                                {selectedLesson ? (
                                    <div className="p-5">
                                        {selectedLesson.description && (
                                            <p className="mb-5 rounded-md bg-slate-50 p-4 text-sm text-slate-700">
                                                {selectedLesson.description}
                                            </p>
                                        )}

                                        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                                            <div className="rounded-lg border border-slate-200">
                                                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                                                    <div>
                                                        <p className="font-semibold text-slate-950">Resources</p>
                                                        <p className="text-xs text-slate-500">
                                                            {selectedLesson.resources?.length || 0} item
                                                            {selectedLesson.resources?.length === 1 ? "" : "s"}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleProposeAddResource(selectedLesson.id)}
                                                        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                                    >
                                                        Add
                                                    </button>
                                                </div>

                                                <div className="max-h-[560px] space-y-2 overflow-y-auto p-3">
                                                    {selectedLesson.resources?.length ? (
                                                        selectedLesson.resources.map((resource) => (
                                                            <ResourceButton
                                                                key={resource.id}
                                                                resource={resource}
                                                                active={selectedResource?.id === resource.id}
                                                                icon={getResourceIcon(resource)}
                                                                onSelect={() => setSelectedResource(resource)}
                                                                onDownload={() => handleDownloadResource(resource.id)}
                                                                onEdit={() => handleProposeUpdateResource(resource.id)}
                                                                onDelete={() => handleProposeDeleteResource(resource.id)}
                                                            />
                                                        ))
                                                    ) : (
                                                        <EmptyState
                                                            icon={File}
                                                            title="No resources"
                                                            text="Propose a resource so students have material for this lesson."
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="min-h-[560px] rounded-lg border border-slate-200">
                                                {selectedResource ? (
                                                    <div className="flex h-full flex-col">
                                                        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
                                                            <div className="flex min-w-0 items-start gap-3">
                                                                <div className="mt-0.5 text-slate-500">{getResourceIcon(selectedResource)}</div>
                                                                <div className="min-w-0">
                                                                    <p className="font-semibold text-slate-950">{selectedResource.title}</p>
                                                                    {selectedResource.description && (
                                                                        <p className="mt-1 text-sm text-slate-500">{selectedResource.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsFullscreen(true)}
                                                                className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-50"
                                                                title="Fullscreen"
                                                            >
                                                                <Maximize2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                        <div className="flex-1 p-4">
                                                            <MentorResourceViewer resource={selectedResource} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <EmptyState
                                                        icon={FileText}
                                                        title="Select a resource"
                                                        text="Choose a resource from the list to preview it here."
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={BookOpen}
                                        title="No lesson selected"
                                        text="Select a lesson to preview its resources."
                                    />
                                )}
                            </Panel>
                        </div>
                    </section>
                ) : (
                    <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                        <div className="space-y-4">
                            <Metric icon={Users} label="Assigned students" value={students.length} />
                            <Metric icon={BarChart3} label="Average progress" value={`${studentStats.averageProgress}%`} tone="emerald" />
                            <Metric icon={Award} label="Average points" value={studentStats.averagePoints} tone="blue" />
                            <Metric icon={TrendingUp} label="Highest level" value={studentStats.highestLevel} tone="amber" />
                        </div>

                        <Panel
                            title="Student progress"
                            subtitle="Only students under your mentorship appear here."
                            action={
                                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                    <div className="relative sm:w-72">
                                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <input
                                            type="search"
                                            value={studentSearch}
                                            onChange={(event) => setStudentSearch(event.target.value)}
                                            placeholder="Search students"
                                            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-slate-500 focus:ring-slate-500"
                                        />
                                    </div>
                                    <select
                                        value={studentSort}
                                        onChange={(event) => setStudentSort(event.target.value)}
                                        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:ring-slate-500"
                                    >
                                        <option value={SORT_OPTIONS.NAME_ASC}>Name A-Z</option>
                                        <option value={SORT_OPTIONS.PROGRESS_DESC}>Progress high-low</option>
                                        <option value={SORT_OPTIONS.PROGRESS_ASC}>Progress low-high</option>
                                        <option value={SORT_OPTIONS.POINTS_DESC}>Points high-low</option>
                                        <option value={SORT_OPTIONS.LEVEL_DESC}>Level high-low</option>
                                    </select>
                                </div>
                            }
                        >
                            {filteredStudents.length ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Progress</TableHead>
                                                <TableHead>Points</TableHead>
                                                <TableHead>Level</TableHead>
                                                <TableHead>Status</TableHead>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 bg-white">
                                            {filteredStudents.map((student) => (
                                                <tr key={student.id} className="hover:bg-slate-50">
                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
                                                                {student.name?.charAt(0)?.toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-950">{student.name}</p>
                                                                <p className="text-xs text-slate-500">{student.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <Progress value={student.progress || 0} />
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                                                        {student.quiz_points || 0}
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                                                        {student.highest_unlocked_level || 1}
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                                                            {student.status || "active"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Users}
                                    title="No students found"
                                    text={studentSearch ? "Try another search." : "Students assigned to you will appear here."}
                                />
                            )}
                        </Panel>
                    </section>
                )}
            </div>

            <AbacusSimulator isOpen={showAbacus} onClose={() => setShowAbacus(false)} />

            <AnimatePresence>
                {isFullscreen && selectedResource && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col bg-slate-950"
                    >
                        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-5 py-4 text-white">
                            <div className="flex min-w-0 items-center gap-3">
                                {getResourceIcon(selectedResource)}
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">{selectedResource.title}</p>
                                    <p className="truncate text-sm text-slate-400">{selectedResource.description}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsFullscreen(false)}
                                className="rounded-md border border-slate-700 p-2 text-slate-200 hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-5">
                            <MentorResourceViewer resource={selectedResource} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </MentorLayout>
    );
}

function getResourceIcon(resource) {
    const type = resource?.type || resource?.resource_type;
    if (type === "video") return <Video className="h-5 w-5" />;
    if (type === "document") return <FileText className="h-5 w-5" />;
    if (type === "link") return <ExternalLink className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
}

function TabButton({ active, icon: Icon, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition sm:flex-none ${
                active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );
}

function Panel({ title, subtitle, action, children }) {
    return (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-950">{title}</h2>
                    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

function Metric({ icon: Icon, label, value, tone = "slate" }) {
    const tones = {
        slate: "bg-slate-50 text-slate-700",
        blue: "bg-blue-50 text-blue-700",
        emerald: "bg-emerald-50 text-emerald-700",
        amber: "bg-amber-50 text-amber-700",
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-md ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

function ResourceButton({ resource, active, icon, onSelect, onDownload, onEdit, onDelete }) {
    return (
        <div
            className={`rounded-md border p-3 transition ${
                active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
        >
            <button type="button" onClick={onSelect} className="w-full text-left">
                <div className="flex items-start gap-3">
                    <div className={active ? "text-slate-300" : "text-slate-500"}>{icon}</div>
                    <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold">{resource.title}</p>
                        {resource.description && (
                            <p className={`mt-1 line-clamp-2 text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                                {resource.description}
                            </p>
                        )}
                    </div>
                </div>
            </button>
            <div className="mt-3 flex items-center gap-2">
                <IconButton icon={Download} label="Download" onClick={onDownload} active={active} />
                <IconButton icon={Edit} label="Edit proposal" onClick={onEdit} active={active} />
                <IconButton icon={Trash2} label="Delete proposal" onClick={onDelete} active={active} danger />
            </div>
        </div>
    );
}

function IconButton({ icon: Icon, label, onClick, active, danger = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-md border p-2 transition ${
                active
                    ? "border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                    : danger
                        ? "border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
            title={label}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
}

function Progress({ value }) {
    const width = Math.min(Math.max(value, 0), 100);

    return (
        <div className="flex min-w-40 items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-slate-900" style={{ width: `${width}%` }} />
            </div>
            <span className="w-10 text-right text-sm font-semibold text-slate-800">{Math.round(width)}%</span>
        </div>
    );
}

function TableHead({ children }) {
    return (
        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            {children}
        </th>
    );
}

function EmptyState({ icon: Icon, title, text }) {
    return (
        <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{text}</p>
        </div>
    );
}
