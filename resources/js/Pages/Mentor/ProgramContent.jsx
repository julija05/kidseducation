import MentorLayout from "@/Layouts/MentorLayout";
import { Head, Link, router } from "@inertiajs/react";
import { GraduationCap, Plus, BookOpen, FileText, Brain, Video, FileCheck, ArrowLeft, Send, Trash2, Edit, Eye, ExternalLink, Download, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

/**
 * ProgramContent Component
 * Shows all content (lessons, resources, quizzes) for a program
 * Allows mentors to preview, edit, and delete resources during content development
 * Uses accordions for levels and lessons to reduce visual clutter
 */
export default function ProgramContent({ program, lessonsByLevel, totalLessons, totalResources, totalQuizzes }) {
    const [previewResource, setPreviewResource] = useState(null);

    // Track expanded/collapsed state for levels and lessons
    // By default, expand all levels and the first lesson of each level
    const [expandedLevels, setExpandedLevels] = useState(() => {
        const initial = {};
        lessonsByLevel.forEach(levelGroup => {
            initial[levelGroup.level] = true; // All levels expanded by default
        });
        return initial;
    });

    const [expandedLessons, setExpandedLessons] = useState(() => {
        const initial = {};
        lessonsByLevel.forEach(levelGroup => {
            if (levelGroup.lessons.length > 0) {
                initial[levelGroup.lessons[0].id] = true; // First lesson of each level expanded
            }
        });
        return initial;
    });

    /**
     * Toggle level accordion
     */
    const toggleLevel = (level) => {
        setExpandedLevels(prev => ({
            ...prev,
            [level]: !prev[level]
        }));
    };

    /**
     * Toggle lesson accordion
     */
    const toggleLesson = (lessonId) => {
        setExpandedLessons(prev => ({
            ...prev,
            [lessonId]: !prev[lessonId]
        }));
    };

    /**
     * Expand all levels and lessons
     */
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

    /**
     * Collapse all levels
     */
    const collapseAll = () => {
        setExpandedLevels({});
        setExpandedLessons({});
    };

    /**
     * Handle submit for review
     */
    const handleSubmitForReview = () => {
        if (confirm(`Submit "${program.name}" for final admin review?\n\nMake sure you have added all lessons, resources, and quizzes.\n\nNote: You will not be able to modify the content after submission.`)) {
            router.post(route('mentor.proposals.programs.submit-final-review', program.slug));
        }
    };

    /**
     * Handle delete resource
     */
    const handleDeleteResource = (resource) => {
        if (confirm(`Are you sure you want to delete "${resource.title}"?\n\nThis action cannot be undone.`)) {
            router.delete(route('mentor.proposals.resources.destroy-direct', resource.id), {
                preserveScroll: true,
            });
        }
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

    return (
        <MentorLayout>
            <Head title={`${program.name} - Content`} />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('mentor.proposals.programs.my-programs')}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to My Programs
                        </Link>

                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                    <GraduationCap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900">
                                        {program.name}
                                    </h1>
                                    <p className="text-slate-600 mt-1">
                                        Manage your program content
                                    </p>
                                </div>
                            </div>

                            {program.can_submit_for_review && (
                                <button
                                    onClick={handleSubmitForReview}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-bold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    <Send className="w-5 h-5" />
                                    Submit for Review
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 font-semibold">Lessons</p>
                                    <p className="text-2xl font-black text-slate-900">{totalLessons}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 font-semibold">Resources</p>
                                    <p className="text-2xl font-black text-slate-900">{totalResources}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 font-semibold">Quizzes</p>
                                    <p className="text-2xl font-black text-slate-900">{totalQuizzes}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Lesson Button */}
                    {program.can_add_content && (
                        <div className="mb-6">
                            <Link
                                href={route('mentor.proposals.lessons.create', program.slug)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-lg hover:shadow-xl"
                            >
                                <Plus className="w-5 h-5" />
                                Add New Lesson
                            </Link>
                        </div>
                    )}

                    {/* Expand/Collapse All Buttons */}
                    {lessonsByLevel.length > 0 && (
                        <div className="flex items-center justify-end gap-2 mb-4">
                            <button
                                onClick={expandAll}
                                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                Expand All
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                                onClick={collapseAll}
                                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                Collapse All
                            </button>
                        </div>
                    )}

                    {/* Lessons by Level */}
                    {lessonsByLevel.length === 0 ? (
                        <div className="bg-white rounded-2xl border-2 border-slate-200 p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                No Lessons Yet
                            </h3>
                            <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                Start building your program by adding lessons. Each lesson can contain resources and quizzes.
                            </p>
                            {program.can_add_content && (
                                <Link
                                    href={route('mentor.proposals.lessons.create', program.slug)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Your First Lesson
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lessonsByLevel.map((levelGroup) => (
                                <div key={levelGroup.level} className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                                    {/* Level Header - Clickable Accordion */}
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
                                        {!expandedLevels[levelGroup.level] && (
                                            <span className="text-xs text-slate-400">Click to expand</span>
                                        )}
                                    </button>

                                    {/* Level Content - Collapsible */}
                                    {expandedLevels[levelGroup.level] && (
                                        <div className="px-4 pb-4 space-y-3">
                                            {levelGroup.lessons.map((lesson) => (
                                                <div key={lesson.id} className="border-2 border-slate-100 rounded-xl overflow-hidden hover:border-purple-200 transition-colors">
                                                    {/* Lesson Header - Clickable Accordion */}
                                                    <button
                                                        onClick={() => toggleLesson(lesson.id)}
                                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
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
                                                                {lesson.description && !expandedLessons[lesson.id] && (
                                                                    <p className="text-sm text-slate-500 truncate">
                                                                        {lesson.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                                {lesson.resources_count} resource{lesson.resources_count !== 1 ? 's' : ''}
                                                            </span>
                                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                                {lesson.quizzes_count} quiz{lesson.quizzes_count !== 1 ? 'zes' : ''}
                                                            </span>
                                                        </div>
                                                    </button>

                                                    {/* Lesson Content - Collapsible */}
                                                    {expandedLessons[lesson.id] && (
                                                        <div className="px-4 pb-4 border-t border-slate-100">
                                                            {/* Description */}
                                                            {lesson.description && (
                                                                <p className="text-sm text-slate-600 mt-3 mb-4 pl-9">
                                                                    {lesson.description}
                                                                </p>
                                                            )}

                                                {/* Resources */}
                                                <div className="mb-4 ml-9">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-sm font-bold text-slate-700">
                                                            Resources ({lesson.resources_count})
                                                        </p>
                                                        {program.can_add_content && (
                                                            <Link
                                                                href={route('mentor.proposals.resources.create', lesson.id)}
                                                                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-purple-50 transition-colors"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                                Add Resource
                                                            </Link>
                                                        )}
                                                    </div>
                                                    {lesson.resources.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {lesson.resources.map((resource) => (
                                                                <div key={resource.id} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2.5 group hover:bg-slate-100 transition-colors">
                                                                    {resource.type === 'youtube' && <Video className="w-4 h-4 text-red-500 flex-shrink-0" />}
                                                                    {(resource.type === 'pdf' || resource.type === 'document') && <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                                                                    {resource.type === 'word' && <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                                                                    {resource.type === 'other' && <FileCheck className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                                                                    <span className="flex-1 truncate">{resource.title}</span>

                                                                    {/* Action buttons - always visible with good contrast */}
                                                                    <div className="flex items-center gap-1.5">
                                                                        {/* Preview button - purple outline style for visibility */}
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

                                                                        {/* Edit button - only show if can add content */}
                                                                        {program.can_add_content && (
                                                                            <Link
                                                                                href={route('mentor.proposals.resources.edit-direct', resource.id)}
                                                                                className="p-1.5 bg-amber-100 text-amber-600 hover:bg-amber-200 rounded transition-colors"
                                                                                title="Edit"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <Edit className="w-4 h-4" />
                                                                            </Link>
                                                                        )}

                                                                        {/* Delete button - only show if can add content */}
                                                                        {program.can_add_content && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteResource(resource);
                                                                                }}
                                                                                className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors"
                                                                                title="Delete"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-400 italic">No resources yet</p>
                                                    )}
                                                </div>

                                                {/* Quizzes */}
                                                <div className="ml-9">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-sm font-bold text-slate-700">
                                                            Quizzes ({lesson.quizzes_count})
                                                        </p>
                                                        {program.can_add_content && (
                                                            <Link
                                                                href={route('mentor.quizzes.create', lesson.id)}
                                                                className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                                Add Quiz
                                                            </Link>
                                                        )}
                                                    </div>
                                                    {lesson.quizzes.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {lesson.quizzes.map((quiz) => (
                                                                <div key={quiz.id} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2.5 group hover:bg-slate-100 transition-colors">
                                                                    <Brain className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                                    <span className="flex-1 truncate">{quiz.title}</span>
                                                                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                                                                        {quiz.questions_count} questions
                                                                    </span>
                                                                    {program.can_add_content && (
                                                                        <Link
                                                                            href={route('mentor.quizzes.edit', quiz.id)}
                                                                            className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors"
                                                                            title="Edit Quiz"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-400 italic">No quizzes yet</p>
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

                    {/* Submit Info */}
                    {program.can_submit_for_review && (
                        <div className="mt-8 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <Send className="w-5 h-5 text-emerald-600 mt-0.5" />
                                <div>
                                    <p className="font-bold text-emerald-900 mb-1">
                                        Ready to submit?
                                    </p>
                                    <p className="text-sm text-emerald-700 mb-4">
                                        You have {totalLessons} lesson(s), {totalResources} resource(s), and {totalQuizzes} quiz(zes).
                                        When you're happy with everything, submit your program for admin review.
                                    </p>
                                    <button
                                        onClick={handleSubmitForReview}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                        Submit for Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Resource Preview Modal */}
            {previewResource && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
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
                                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-auto p-4">
                            {/* Description */}
                            {previewResource.description && (
                                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-600">{previewResource.description}</p>
                                </div>
                            )}

                            {/* YouTube Preview */}
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

                            {/* File Preview Info */}
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
                                    <p className="text-sm text-slate-500 mb-4">
                                        File preview is not available. You can download the file to view it.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
                            <div className="text-xs text-slate-500">
                                {previewResource.type === 'youtube' && previewResource.resource_url && (
                                    <a
                                        href={previewResource.resource_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Open on YouTube
                                    </a>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {program.can_add_content && (
                                    <>
                                        <Link
                                            href={route('mentor.proposals.resources.edit-direct', previewResource.id)}
                                            className="px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleDeleteResource(previewResource);
                                                setPreviewResource(null);
                                            }}
                                            className="px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setPreviewResource(null)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MentorLayout>
    );
}
