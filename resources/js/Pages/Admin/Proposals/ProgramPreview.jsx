import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    GraduationCap, ArrowLeft, BookOpen, FileText, Brain, Video, FileCheck,
    CheckCircle, XCircle, Clock, DollarSign, Calendar, User, ChevronDown,
    ChevronRight, Eye, HelpCircle, ExternalLink
} from "lucide-react";
import { useState } from "react";

/**
 * ProgramPreview Component
 * Admin preview page for reviewing program content before approval
 */
export default function ProgramPreview({
    program,
    lessonsByLevel,
    totalLessons,
    totalResources,
    totalQuizzes,
    totalQuestions
}) {
    const [previewResource, setPreviewResource] = useState(null);
    const [previewQuiz, setPreviewQuiz] = useState(null);

    // Track expanded/collapsed state for levels and lessons
    const [expandedLevels, setExpandedLevels] = useState(() => {
        const initial = {};
        lessonsByLevel.forEach(levelGroup => {
            initial[levelGroup.level] = true;
        });
        return initial;
    });

    const [expandedLessons, setExpandedLessons] = useState(() => {
        const initial = {};
        lessonsByLevel.forEach(levelGroup => {
            if (levelGroup.lessons.length > 0) {
                initial[levelGroup.lessons[0].id] = true;
            }
        });
        return initial;
    });

    const toggleLevel = (level) => {
        setExpandedLevels(prev => ({ ...prev, [level]: !prev[level] }));
    };

    const toggleLesson = (lessonId) => {
        setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
    };

    const expandAll = () => {
        const levels = {};
        const lessons = {};
        lessonsByLevel.forEach(levelGroup => {
            levels[levelGroup.level] = true;
            levelGroup.lessons.forEach(lesson => {
                lessons[lesson.id] = true;
            });
        });
        setExpandedLevels(levels);
        setExpandedLessons(lessons);
    };

    const collapseAll = () => {
        setExpandedLevels({});
        setExpandedLessons({});
    };

    /**
     * Get YouTube embed URL
     */
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
    };

    /**
     * Format file size
     */
    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    /**
     * Handle approve
     */
    const handleApprove = () => {
        const message = program.is_initial_review
            ? `Approve "${program.name}" for content development?\n\nThe mentor will be able to start adding lessons and resources.`
            : `Fully approve "${program.name}"?\n\nThis will make it active and publicly visible for student enrollment.`;

        if (confirm(message)) {
            router.post(route('admin.programs.approve', program.slug));
        }
    };

    /**
     * Handle reject
     */
    const handleReject = () => {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason && reason.trim()) {
            router.post(route('admin.programs.reject', program.slug), {
                rejection_reason: reason.trim()
            });
        }
    };

    return (
        <AdminLayout>
            <Head title={`Preview: ${program.name}`} />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('admin.programs.proposals')}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Program Proposals
                        </Link>

                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                    <GraduationCap className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-3xl font-black text-slate-900">
                                            {program.name}
                                        </h1>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            program.is_initial_review
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {program.approval_status_label}
                                        </span>
                                    </div>
                                    <p className="text-slate-600">
                                        Admin Preview - Review program content before approval
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleApprove}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    {program.is_initial_review ? 'Approve to Build' : 'Approve & Publish'}
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Program Info Card */}
                    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Program Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Price</p>
                                    <p className="font-bold text-slate-900">
                                        ${program.price}
                                        {program.requires_monthly_payment && <span className="text-xs text-slate-500">/month</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Duration</p>
                                    <p className="font-bold text-slate-900">{program.duration}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Weeks</p>
                                    <p className="font-bold text-slate-900">{program.duration_weeks || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <User className="w-5 h-5 text-amber-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Proposed By</p>
                                    <p className="font-bold text-slate-900">{program.proposed_by?.name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-sm font-bold text-slate-700 mb-2">Description</p>
                            <p className="text-sm text-slate-600">{program.description}</p>
                        </div>
                    </div>

                    {/* Content Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl border-2 border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 font-medium">Lessons</p>
                                    <p className="text-2xl font-black text-slate-900">{totalLessons}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border-2 border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 font-medium">Resources</p>
                                    <p className="text-2xl font-black text-slate-900">{totalResources}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border-2 border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 font-medium">Quizzes</p>
                                    <p className="text-2xl font-black text-slate-900">{totalQuizzes}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border-2 border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 font-medium">Questions</p>
                                    <p className="text-2xl font-black text-slate-900">{totalQuestions}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expand/Collapse All Buttons */}
                    {lessonsByLevel.length > 0 && (
                        <div className="flex items-center justify-end gap-2 mb-4">
                            <button
                                onClick={expandAll}
                                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
                            >
                                Expand All
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                                onClick={collapseAll}
                                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
                            >
                                Collapse All
                            </button>
                        </div>
                    )}

                    {/* Content by Level */}
                    {lessonsByLevel.length === 0 ? (
                        <div className="bg-white rounded-2xl border-2 border-slate-200 p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-10 h-10 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                No Content Yet
                            </h3>
                            <p className="text-slate-600 max-w-md mx-auto">
                                This program doesn't have any lessons yet.
                                {program.is_initial_review
                                    ? " This is an initial proposal - approve to allow the mentor to add content."
                                    : " The mentor hasn't added content yet."
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lessonsByLevel.map((levelGroup) => (
                                <div key={levelGroup.level} className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                                    {/* Level Header */}
                                    <button
                                        onClick={() => toggleLevel(levelGroup.level)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                expandedLevels[levelGroup.level] ? 'bg-purple-100' : 'bg-slate-100'
                                            }`}>
                                                {expandedLevels[levelGroup.level] ? (
                                                    <ChevronDown className="w-5 h-5 text-purple-600" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-slate-500" />
                                                )}
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                Level {levelGroup.level}
                                            </h2>
                                            <span className="text-sm text-slate-500 font-medium">
                                                ({levelGroup.lessons.length} lesson{levelGroup.lessons.length !== 1 ? 's' : ''})
                                            </span>
                                        </div>
                                    </button>

                                    {/* Level Content */}
                                    {expandedLevels[levelGroup.level] && (
                                        <div className="px-4 pb-4 space-y-3">
                                            {levelGroup.lessons.map((lesson) => (
                                                <div key={lesson.id} className="border-2 border-slate-100 rounded-xl overflow-hidden">
                                                    {/* Lesson Header */}
                                                    <button
                                                        onClick={() => toggleLesson(lesson.id)}
                                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                                                                expandedLessons[lesson.id] ? 'bg-blue-100' : 'bg-slate-100'
                                                            }`}>
                                                                {expandedLessons[lesson.id] ? (
                                                                    <ChevronDown className="w-4 h-4 text-blue-600" />
                                                                ) : (
                                                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-lg font-bold text-slate-900 truncate">
                                                                    {lesson.title}
                                                                </h3>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                                {lesson.resources_count} resources
                                                            </span>
                                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                                {lesson.quizzes_count} quizzes
                                                            </span>
                                                        </div>
                                                    </button>

                                                    {/* Lesson Content */}
                                                    {expandedLessons[lesson.id] && (
                                                        <div className="px-4 pb-4 border-t border-slate-100">
                                                            {lesson.description && (
                                                                <p className="text-sm text-slate-600 mt-3 mb-4 pl-9">
                                                                    {lesson.description}
                                                                </p>
                                                            )}

                                                            {/* Resources */}
                                                            <div className="mb-4 ml-9">
                                                                <p className="text-sm font-bold text-slate-700 mb-2">
                                                                    Resources ({lesson.resources_count})
                                                                </p>
                                                                {lesson.resources.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {lesson.resources.map((resource) => (
                                                                            <div key={resource.id} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2.5">
                                                                                {resource.type === 'youtube' && <Video className="w-4 h-4 text-red-500 flex-shrink-0" />}
                                                                                {(resource.type === 'pdf' || resource.type === 'document') && <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                                                                                {resource.type === 'word' && <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                                                                                {resource.type === 'other' && <FileCheck className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                                                                                <span className="flex-1 truncate">{resource.title}</span>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setPreviewResource(resource);
                                                                                    }}
                                                                                    className="p-1.5 border-2 border-purple-400 text-purple-600 bg-white hover:bg-purple-50 rounded transition-colors"
                                                                                    title="Preview"
                                                                                >
                                                                                    <Eye className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-slate-400 italic">No resources</p>
                                                                )}
                                                            </div>

                                                            {/* Quizzes */}
                                                            <div className="ml-9">
                                                                <p className="text-sm font-bold text-slate-700 mb-2">
                                                                    Quizzes ({lesson.quizzes_count})
                                                                </p>
                                                                {lesson.quizzes.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {lesson.quizzes.map((quiz) => (
                                                                            <div key={quiz.id} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2.5">
                                                                                <Brain className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                                                <span className="flex-1 truncate">{quiz.title}</span>
                                                                                <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                                                                                    {quiz.questions_count} questions
                                                                                </span>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setPreviewQuiz(quiz);
                                                                                    }}
                                                                                    className="p-1.5 border-2 border-green-400 text-green-600 bg-white hover:bg-green-50 rounded transition-colors"
                                                                                    title="Preview Quiz"
                                                                                >
                                                                                    <Eye className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-slate-400 italic">No quizzes</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="mt-8 bg-white rounded-2xl border-2 border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-900">
                                    {program.is_initial_review
                                        ? 'Initial Review - Approve to let mentor build content'
                                        : 'Final Review - Approve to publish program'
                                    }
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Proposed by {program.proposed_by?.name} ({program.proposed_by?.email})
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleReject}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </button>
                                <button
                                    onClick={handleApprove}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    {program.is_initial_review ? 'Approve to Build' : 'Approve & Publish'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resource Preview Modal */}
            {previewResource && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                {previewResource.type === 'youtube' && <Video className="w-5 h-5 text-red-500" />}
                                {(previewResource.type === 'pdf' || previewResource.type === 'document') && <FileText className="w-5 h-5 text-blue-500" />}
                                {previewResource.type === 'word' && <FileText className="w-5 h-5 text-blue-600" />}
                                {previewResource.type === 'other' && <FileCheck className="w-5 h-5 text-slate-500" />}
                                <div>
                                    <h3 className="font-bold text-slate-900">{previewResource.title}</h3>
                                    <p className="text-xs text-slate-500 capitalize">{previewResource.type} Resource</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPreviewResource(null)}
                                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {previewResource.description && (
                                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-600">{previewResource.description}</p>
                                </div>
                            )}

                            {previewResource.type === 'youtube' && previewResource.resource_url && (
                                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                    <iframe
                                        src={getYouTubeEmbedUrl(previewResource.resource_url)}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}

                            {previewResource.type !== 'youtube' && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                                        {previewResource.file_name || 'File Resource'}
                                    </h4>
                                    {previewResource.file_size && (
                                        <p className="text-sm text-slate-600 mb-4">
                                            Size: {formatFileSize(previewResource.file_size)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
                            <div>
                                {previewResource.type === 'youtube' && previewResource.resource_url && (
                                    <a
                                        href={previewResource.resource_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Open on YouTube
                                    </a>
                                )}
                            </div>
                            <button
                                onClick={() => setPreviewResource(null)}
                                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz Preview Modal */}
            {previewQuiz && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <Brain className="w-5 h-5 text-green-500" />
                                <div>
                                    <h3 className="font-bold text-slate-900">{previewQuiz.title}</h3>
                                    <p className="text-xs text-slate-500">
                                        {previewQuiz.questions_count} questions
                                        {previewQuiz.passing_score && ` | Pass: ${previewQuiz.passing_score}%`}
                                        {previewQuiz.time_limit && ` | ${previewQuiz.time_limit} min`}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPreviewQuiz(null)}
                                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {previewQuiz.description && (
                                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-600">{previewQuiz.description}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {previewQuiz.questions && previewQuiz.questions.map((question, index) => (
                                    <div key={question.id} className="border border-slate-200 rounded-lg p-4">
                                        <p className="text-sm font-bold text-slate-700 mb-2">
                                            Q{index + 1}. {question.question_text}
                                        </p>
                                        {question.options && (
                                            <div className="space-y-1 ml-4">
                                                {Object.entries(question.options).map(([key, value]) => (
                                                    <p key={key} className={`text-sm ${
                                                        question.correct_answer === key
                                                            ? 'text-green-600 font-semibold'
                                                            : 'text-slate-600'
                                                    }`}>
                                                        {key}. {value}
                                                        {question.correct_answer === key && ' ✓'}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-xs text-slate-400 mt-2">
                                            Points: {question.points || 1}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end p-4 border-t border-slate-200 bg-slate-50">
                            <button
                                onClick={() => setPreviewQuiz(null)}
                                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
