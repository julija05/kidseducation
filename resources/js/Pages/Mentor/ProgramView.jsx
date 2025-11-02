import MentorLayout from "@/Layouts/MentorLayout";
import { Head, router } from "@inertiajs/react";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Download,
    Edit,
    Trash2,
    FileText,
    Video,
    File,
    Maximize2,
    X,
    Users,
    TrendingUp,
    Award,
    Calendar,
    Search,
    Layers,
    FileStack,
    ArrowUpDown,
    BarChart3,
    Target,
    Sparkles,
    Plus,
    PlusCircle,
} from "lucide-react";
import MentorResourceViewer from "@/Components/Lessons/Resources/Viewers/MentorResourceViewer";
import { motion, AnimatePresence } from "framer-motion";

// UI Constants for better maintainability
const UI_CONSTANTS = {
    TABS: {
        LESSONS: 'lessons',
        STUDENTS: 'students',
    },
    COLORS: {
        PRIMARY: 'emerald',
        SECONDARY: 'slate',
    },
    SORT_OPTIONS: {
        NAME_ASC: 'name_asc',
        NAME_DESC: 'name_desc',
        PROGRESS_ASC: 'progress_asc',
        PROGRESS_DESC: 'progress_desc',
        POINTS_ASC: 'points_asc',
        POINTS_DESC: 'points_desc',
        LEVEL_ASC: 'level_asc',
        LEVEL_DESC: 'level_desc',
        DATE_ASC: 'date_asc',
        DATE_DESC: 'date_desc',
    },
    ITEMS_PER_PAGE: 20,
};

// Sort function factory following SOLID principles
const createSortFunction = (sortOption) => {
    const sortFunctions = {
        [UI_CONSTANTS.SORT_OPTIONS.NAME_ASC]: (a, b) => a.name.localeCompare(b.name),
        [UI_CONSTANTS.SORT_OPTIONS.NAME_DESC]: (a, b) => b.name.localeCompare(a.name),
        [UI_CONSTANTS.SORT_OPTIONS.PROGRESS_ASC]: (a, b) => (a.progress || 0) - (b.progress || 0),
        [UI_CONSTANTS.SORT_OPTIONS.PROGRESS_DESC]: (a, b) => (b.progress || 0) - (a.progress || 0),
        [UI_CONSTANTS.SORT_OPTIONS.POINTS_ASC]: (a, b) => (a.quiz_points || 0) - (b.quiz_points || 0),
        [UI_CONSTANTS.SORT_OPTIONS.POINTS_DESC]: (a, b) => (b.quiz_points || 0) - (a.quiz_points || 0),
        [UI_CONSTANTS.SORT_OPTIONS.LEVEL_ASC]: (a, b) => (a.highest_unlocked_level || 1) - (b.highest_unlocked_level || 1),
        [UI_CONSTANTS.SORT_OPTIONS.LEVEL_DESC]: (a, b) => (b.highest_unlocked_level || 1) - (a.highest_unlocked_level || 1),
        [UI_CONSTANTS.SORT_OPTIONS.DATE_ASC]: (a, b) => new Date(a.enrolled_at) - new Date(b.enrolled_at),
        [UI_CONSTANTS.SORT_OPTIONS.DATE_DESC]: (a, b) => new Date(b.enrolled_at) - new Date(a.enrolled_at),
    };

    return sortFunctions[sortOption] || sortFunctions[UI_CONSTANTS.SORT_OPTIONS.NAME_ASC];
};

export default function ProgramView({ program, students, lessons, mentorEnrollment }) {
    const { t } = useTranslation();
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [selectedResource, setSelectedResource] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeTab, setActiveTab] = useState(UI_CONSTANTS.TABS.LESSONS);
    const [expandedLevels, setExpandedLevels] = useState(new Set([1])); // First level expanded by default
    const [searchQuery, setSearchQuery] = useState('');

    // Student tab state
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [studentSortOption, setStudentSortOption] = useState(UI_CONSTANTS.SORT_OPTIONS.NAME_ASC);
    const [studentsToShow, setStudentsToShow] = useState(UI_CONSTANTS.ITEMS_PER_PAGE);

    // Convert lessons object to array if needed and group by level
    const lessonsArray = lessons ? Object.values(lessons).flat() : [];

    // Auto-select first lesson on mount
    useEffect(() => {
        if (lessonsArray.length > 0 && !selectedLesson) {
            setSelectedLesson(lessonsArray[0]);
        }
    }, [lessons]);

    // Auto-select first resource when lesson changes
    useEffect(() => {
        if (selectedLesson && selectedLesson.resources && selectedLesson.resources.length > 0) {
            setSelectedResource(selectedLesson.resources[0]);
        } else {
            setSelectedResource(null);
        }
    }, [selectedLesson]);

    // Filter lessons based on search query
    const filteredLessonsArray = useMemo(() => {
        if (!searchQuery.trim()) return lessonsArray;

        const query = searchQuery.toLowerCase();
        return lessonsArray.filter(lesson =>
            lesson.title?.toLowerCase().includes(query) ||
            lesson.description?.toLowerCase().includes(query)
        );
    }, [lessonsArray, searchQuery]);

    // Group lessons by level
    const lessonsByLevel = useMemo(() => {
        return filteredLessonsArray.reduce((acc, lesson) => {
            const level = lesson.level || 1;
            if (!acc[level]) {
                acc[level] = [];
            }
            acc[level].push(lesson);
            return acc;
        }, {});
    }, [filteredLessonsArray]);

    const sortedLevels = Object.keys(lessonsByLevel).sort((a, b) => a - b);

    // Calculate level statistics
    const getLevelStats = (level) => {
        const levelLessons = lessonsByLevel[level] || [];
        const lessonCount = levelLessons.length;
        const resourceCount = levelLessons.reduce((sum, lesson) =>
            sum + (lesson.resources?.length || 0), 0
        );
        return { lessonCount, resourceCount };
    };

    // Toggle level expansion
    const toggleLevel = (level) => {
        const newExpanded = new Set(expandedLevels);
        if (newExpanded.has(level)) {
            newExpanded.delete(level);
        } else {
            newExpanded.add(level);
        }
        setExpandedLevels(newExpanded);
    };

    // Expand all levels
    const expandAllLevels = () => {
        setExpandedLevels(new Set(sortedLevels.map(Number)));
    };

    // Collapse all levels
    const collapseAllLevels = () => {
        setExpandedLevels(new Set());
    };

    // Auto-expand levels when searching
    useEffect(() => {
        if (searchQuery.trim() && sortedLevels.length > 0) {
            // Expand all levels that have matching lessons
            expandAllLevels();
        }
    }, [searchQuery]);

    // Filter and sort students
    const filteredAndSortedStudents = useMemo(() => {
        let filtered = students;

        // Apply search filter
        if (studentSearchQuery.trim()) {
            const query = studentSearchQuery.toLowerCase();
            filtered = students.filter(student =>
                student.name?.toLowerCase().includes(query) ||
                student.email?.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        const sortedStudents = [...filtered].sort(createSortFunction(studentSortOption));

        return sortedStudents;
    }, [students, studentSearchQuery, studentSortOption]);

    // Paginated students
    const paginatedStudents = filteredAndSortedStudents.slice(0, studentsToShow);
    const hasMoreStudents = studentsToShow < filteredAndSortedStudents.length;

    // Student statistics
    const studentStats = useMemo(() => {
        if (!students || students.length === 0) return null;

        const totalStudents = students.length;
        const avgProgress = students.reduce((sum, s) => sum + (s.progress || 0), 0) / totalStudents;
        const avgPoints = students.reduce((sum, s) => sum + (s.quiz_points || 0), 0) / totalStudents;
        const maxLevel = Math.max(...students.map(s => s.highest_unlocked_level || 1));

        return {
            totalStudents,
            avgProgress: Math.round(avgProgress),
            avgPoints: Math.round(avgPoints),
            maxLevel,
        };
    }, [students]);

    // Reset pagination when search/sort changes
    useEffect(() => {
        setStudentsToShow(UI_CONSTANTS.ITEMS_PER_PAGE);
    }, [studentSearchQuery, studentSortOption]);

    // Resource Proposal Handlers
    const handleProposeAddResource = (lessonId) => {
        router.get(route('mentor.proposals.resources.create', lessonId));
    };

    const handleProposeUpdate = (resourceId) => {
        router.get(route('mentor.proposals.resources.edit', resourceId));
    };

    const handleProposeDelete = (resourceId) => {
        if (confirm(t("mentor.resources.confirm_delete") || "Are you sure you want to propose deletion of this resource?")) {
            router.delete(route('mentor.proposals.resources.delete', resourceId), {
                preserveScroll: true,
                onSuccess: () => {
                    // Success handled by flash message
                },
            });
        }
    };

    // Lesson Proposal Handlers
    const handleProposeAddLesson = () => {
        router.get(route('mentor.proposals.lessons.create', program.slug));
    };

    const handleProposeUpdateLesson = (lessonId) => {
        router.get(route('mentor.proposals.lessons.edit', lessonId));
    };

    // Level Proposal Handler
    const handleProposeAddLevel = () => {
        router.get(route('mentor.proposals.levels.create', program.slug));
    };

    const handleDownloadResource = (resourceId) => {
        window.open(route("lesson-resources.download", resourceId), "_blank");
    };

    const getResourceIcon = (resource) => {
        const type = resource.type || resource.resource_type;
        if (type === "video") return <Video className="w-5 h-5" />;
        if (type === "document") return <FileText className="w-5 h-5" />;
        if (type === "link") return <FileText className="w-5 h-5" />;
        return <File className="w-5 h-5" />;
    };

    // Navigation based on filtered lessons for better UX
    const currentLessonIndex = filteredLessonsArray.findIndex(l => l.id === selectedLesson?.id);
    const canGoPrevious = currentLessonIndex > 0;
    const canGoNext = currentLessonIndex >= 0 && currentLessonIndex < (filteredLessonsArray.length - 1);

    const goToPreviousLesson = () => {
        if (canGoPrevious) {
            setSelectedLesson(filteredLessonsArray[currentLessonIndex - 1]);
        }
    };

    const goToNextLesson = () => {
        if (canGoNext) {
            setSelectedLesson(filteredLessonsArray[currentLessonIndex + 1]);
        }
    };

    return (
        <MentorLayout>
            <Head title={`${t("mentor.program_view.title") || "Teaching"} - ${program.name}`} />

            <div className="min-h-screen bg-slate-50 flex">
                {/* Left Sidebar - Lessons or Students */}
                <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-black text-slate-900">{program.name}</h2>
                        <p className="text-sm text-slate-600 mt-1">
                            {lessonsArray.length} Lessons • {students.length} Students
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab(UI_CONSTANTS.TABS.LESSONS)}
                            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                                activeTab === UI_CONSTANTS.TABS.LESSONS
                                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <BookOpen className="w-4 h-4 inline mr-2" />
                            Lessons
                        </button>
                        <button
                            onClick={() => setActiveTab(UI_CONSTANTS.TABS.STUDENTS)}
                            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                                activeTab === UI_CONSTANTS.TABS.STUDENTS
                                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            Students
                        </button>
                    </div>

                    {/* Lessons Tab Content */}
                    {activeTab === UI_CONSTANTS.TABS.LESSONS && (
                        <div className="flex-1 flex flex-col">
                            {/* Search and Controls */}
                            <div className="p-4 space-y-3 border-b border-slate-200">
                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search lessons..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none text-sm"
                                    />
                                </div>

                                {/* Expand/Collapse Controls */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-600">
                                        {sortedLevels.length} Levels
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={expandAllLevels}
                                            className="px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                        >
                                            Expand All
                                        </button>
                                        <button
                                            onClick={collapseAllLevels}
                                            className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded transition-colors"
                                        >
                                            Collapse All
                                        </button>
                                    </div>
                                </div>

                                {/* Propose New Level Button */}
                                <button
                                    onClick={handleProposeAddLevel}
                                    className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Propose New Level
                                </button>
                            </div>

                            {/* Levels Accordion */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {sortedLevels.length > 0 ? (
                                    sortedLevels.map((level) => {
                                        const levelNum = Number(level);
                                        const isExpanded = expandedLevels.has(levelNum);
                                        const stats = getLevelStats(level);

                                        return (
                                            <div key={level} className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white">
                                                {/* Level Header */}
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => toggleLevel(levelNum)}
                                                        className="flex-1 px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                                                                {level}
                                                            </div>
                                                            <div className="text-left">
                                                                <h3 className="text-sm font-bold text-slate-900">
                                                                    Level {level}
                                                                </h3>
                                                                <p className="text-xs text-slate-600">
                                                                    {stats.lessonCount} lesson{stats.lessonCount !== 1 ? 's' : ''} · {stats.resourceCount} resource{stats.resourceCount !== 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-5 h-5 text-slate-400" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-slate-400" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleProposeAddLesson();
                                                        }}
                                                        className="px-3 py-3 hover:bg-emerald-50 transition-colors border-l border-slate-200 text-emerald-600 hover:text-emerald-700"
                                                        title="Propose new lesson"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Level Content - Collapsible */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="border-t border-slate-200"
                                                        >
                                                            <div className="p-3 space-y-1">
                                                                {lessonsByLevel[level].map((lesson) => (
                                                                    <div
                                                                        key={lesson.id}
                                                                        className={`rounded-lg transition-all ${
                                                                            selectedLesson?.id === lesson.id
                                                                                ? "bg-emerald-50 border-2 border-emerald-400"
                                                                                : "bg-slate-50 border-2 border-slate-200 hover:border-slate-300"
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-stretch">
                                                                            <button
                                                                                onClick={() => setSelectedLesson(lesson)}
                                                                                className="flex-1 text-left px-3 py-2.5"
                                                                            >
                                                                                <div className="flex items-start gap-2">
                                                                                    <BookOpen className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                                                                        selectedLesson?.id === lesson.id ? "text-emerald-600" : "text-slate-400"
                                                                                    }`} />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className={`text-sm font-semibold line-clamp-2 ${
                                                                                            selectedLesson?.id === lesson.id ? "text-emerald-900" : "text-slate-900"
                                                                                        }`}>
                                                                                            {lesson.title}
                                                                                        </p>
                                                                                        <p className="text-xs text-slate-600 mt-0.5">
                                                                                            {lesson.resources?.length || 0} resource{lesson.resources?.length !== 1 ? 's' : ''}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleProposeUpdateLesson(lesson.id);
                                                                                }}
                                                                                className={`px-2 flex items-center border-l transition-colors ${
                                                                                    selectedLesson?.id === lesson.id
                                                                                        ? "border-emerald-300 text-emerald-600 hover:bg-emerald-100"
                                                                                        : "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                                                                }`}
                                                                                title="Propose lesson update"
                                                                            >
                                                                                <Edit className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-12">
                                        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500">
                                            {searchQuery ? 'No lessons match your search' : 'No lessons available'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Students Tab Content */}
                    {activeTab === UI_CONSTANTS.TABS.STUDENTS && (
                        <div className="flex-1 flex flex-col">
                            {/* Statistics Overview */}
                            {studentStats && (
                                <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-cyan-50">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                                                <Users className="w-4 h-4" />
                                                <span className="text-xs font-semibold">Total</span>
                                            </div>
                                            <p className="text-2xl font-bold text-slate-900">{studentStats.totalStudents}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-cyan-600 mb-1">
                                                <BarChart3 className="w-4 h-4" />
                                                <span className="text-xs font-semibold">Avg Progress</span>
                                            </div>
                                            <p className="text-2xl font-bold text-slate-900">{studentStats.avgProgress}%</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                                                <Award className="w-4 h-4" />
                                                <span className="text-xs font-semibold">Avg Points</span>
                                            </div>
                                            <p className="text-2xl font-bold text-slate-900">{studentStats.avgPoints}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-xs font-semibold">Max Level</span>
                                            </div>
                                            <p className="text-2xl font-bold text-slate-900">{studentStats.maxLevel}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Search and Sort Controls */}
                            <div className="p-4 space-y-3 border-b border-slate-200">
                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search students by name or email..."
                                        value={studentSearchQuery}
                                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none text-sm"
                                    />
                                </div>

                                {/* Sort Dropdown */}
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                                    <select
                                        value={studentSortOption}
                                        onChange={(e) => setStudentSortOption(e.target.value)}
                                        className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-400 focus:outline-none text-sm"
                                    >
                                        <option value={UI_CONSTANTS.SORT_OPTIONS.NAME_ASC}>Name (A-Z)</option>
                                        <option value={UI_CONSTANTS.SORT_OPTIONS.NAME_DESC}>Name (Z-A)</option>
                                        <option value={UI_CONSTANTS.SORT_OPTIONS.PROGRESS_DESC}>Progress (High to Low)</option>
                                        <option value={UI_CONSTANTS.SORT_OPTIONS.PROGRESS_ASC}>Progress (Low to High)</option>
                                        <option value={UI_CONSTANTS.SORT_OPTIONS.POINTS_DESC}>Points (High to Low)</option>
                                        <option value={UI_CONSTANTS.SORT_OPTIONS.POINTS_ASC}>Points (Low to High)</option>
                                        <option value={UI_CONSTANTS.SORT_OPTIONS.LEVEL_DESC}>Level (High to Low)</option>
                                        <option value={UI_CONSTANTS.SORT_OPTIONS.LEVEL_ASC}>Level (Low to High)</option>
                                        <option value={UI_CONSTANTS.SORT_OPTIONS.DATE_DESC}>Recently Enrolled</option>
                                        <option value={UI_CONSTANTS.SORT_OPTIONS.DATE_ASC}>Oldest Enrolled</option>
                                    </select>
                                </div>

                                {/* Results Count */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">
                                        Showing {paginatedStudents.length} of {filteredAndSortedStudents.length} students
                                    </span>
                                    {studentSearchQuery && (
                                        <button
                                            onClick={() => setStudentSearchQuery('')}
                                            className="text-emerald-600 hover:text-emerald-700 font-medium"
                                        >
                                            Clear search
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Students List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {paginatedStudents.length > 0 ? (
                                    <>
                                        {paginatedStudents.map((student) => (
                                            <div
                                                key={student.id}
                                                className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-slate-300 transition-all"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-slate-900 text-sm truncate">
                                                            {student.name}
                                                        </h4>
                                                        <p className="text-xs text-slate-600 truncate">
                                                            {student.email}
                                                        </p>

                                                        {/* Progress Bar */}
                                                        <div className="mt-2">
                                                            <div className="flex items-center justify-between text-xs mb-1">
                                                                <span className="text-slate-600">Progress</span>
                                                                <span className="font-semibold text-emerald-600">
                                                                    {Math.round(student.progress || 0)}%
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all"
                                                                    style={{ width: `${student.progress || 0}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Stats */}
                                                        <div className="mt-3 flex items-center gap-3 text-xs">
                                                            <div className="flex items-center gap-1 text-slate-600">
                                                                <Award className="w-3 h-3" />
                                                                <span>{student.quiz_points || 0} pts</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-slate-600">
                                                                <TrendingUp className="w-3 h-3" />
                                                                <span>Level {student.highest_unlocked_level || 1}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Load More Button */}
                                        {hasMoreStudents && (
                                            <button
                                                onClick={() => setStudentsToShow(prev => prev + UI_CONSTANTS.ITEMS_PER_PAGE)}
                                                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Load More Students ({filteredAndSortedStudents.length - studentsToShow} remaining)
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500">
                                            {studentSearchQuery ? 'No students match your search' : 'No students enrolled yet'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Center - Preview Area */}
                <div className="flex-1 flex flex-col">
                    {/* Top Bar */}
                    <div className="bg-white border-b border-slate-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">
                                    {selectedLesson?.title || "Select a lesson"}
                                </h1>
                                {selectedLesson && (
                                    <p className="text-sm text-slate-600 mt-1">
                                        {selectedLesson.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={goToPreviousLesson}
                                    disabled={!canGoPrevious}
                                    className={`p-2 rounded-lg transition-colors ${
                                        canGoPrevious
                                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                            : "bg-slate-50 text-slate-300 cursor-not-allowed"
                                    }`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={goToNextLesson}
                                    disabled={!canGoNext}
                                    className={`p-2 rounded-lg transition-colors ${
                                        canGoNext
                                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                            : "bg-slate-50 text-slate-300 cursor-not-allowed"
                                    }`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {selectedResource ? (
                            <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden h-full flex flex-col">
                                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getResourceIcon(selectedResource)}
                                        <div>
                                            <h3 className="font-bold text-slate-900">{selectedResource.title}</h3>
                                            <p className="text-sm text-slate-600">{selectedResource.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsFullscreen(true)}
                                        className="p-2 bg-white hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <Maximize2 className="w-5 h-5 text-slate-700" />
                                    </button>
                                </div>
                                <div className="flex-1 p-6">
                                    <MentorResourceViewer resource={selectedResource} />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 text-lg">
                                        {selectedLesson
                                            ? "No resources available for this lesson"
                                            : "Select a lesson to view resources"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Resources List */}
                <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Resources</h2>
                                <p className="text-sm text-slate-600 mt-1">
                                    {selectedLesson?.resources?.length || 0} items
                                </p>
                            </div>
                        </div>
                        {selectedLesson && (
                            <button
                                onClick={() => handleProposeAddResource(selectedLesson.id)}
                                className="w-full py-2 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Propose New Resource
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {selectedLesson?.resources && selectedLesson.resources.length > 0 ? (
                            selectedLesson.resources.map((resource) => (
                                <div
                                    key={resource.id}
                                    onClick={() => setSelectedResource(resource)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                        selectedResource?.id === resource.id
                                            ? "bg-emerald-50 border-emerald-400"
                                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                                    }`}
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={`p-2 rounded-lg ${
                                            selectedResource?.id === resource.id
                                                ? "bg-emerald-100"
                                                : "bg-slate-100"
                                        }`}>
                                            {getResourceIcon(resource)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-semibold text-sm line-clamp-2 ${
                                                selectedResource?.id === resource.id
                                                    ? "text-emerald-900"
                                                    : "text-slate-900"
                                            }`}>
                                                {resource.title}
                                            </h4>
                                            {resource.description && (
                                                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                                    {resource.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadResource(resource.id);
                                            }}
                                            className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Download
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProposeUpdate(resource.id);
                                            }}
                                            className="p-1.5 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 rounded-lg text-slate-700 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProposeDelete(resource.id);
                                            }}
                                            className="p-1.5 bg-white hover:bg-red-50 border border-slate-300 hover:border-red-300 rounded-lg text-slate-700 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <File className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No resources available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {isFullscreen && selectedResource && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900 flex flex-col"
                    >
                        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-white">
                                {getResourceIcon(selectedResource)}
                                <div>
                                    <h3 className="font-bold">{selectedResource.title}</h3>
                                    <p className="text-sm text-slate-300">{selectedResource.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsFullscreen(false)}
                                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 p-6 overflow-auto">
                            <MentorResourceViewer resource={selectedResource} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </MentorLayout>
    );
}
