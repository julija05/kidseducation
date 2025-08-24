import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Play, 
    Lock, 
    Clock, 
    BookOpen, 
    Video, 
    FileText, 
    ExternalLink,
    Star,
    ArrowRight,
    Calendar,
    Users
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function DemoDashboard({ 
    program, 
    firstLesson, 
    lockedLessons, 
    demoExpiresAt, 
    daysRemaining 
}) {
    const { t } = useTranslation();
    const { post, processing } = useForm();
    
    // Debug logging
    console.log('Demo Dashboard Props:', {
        program,
        firstLesson,
        lockedLessons: lockedLessons?.length,
        demoExpiresAt,
        daysRemaining
    });

    const handleEnrollment = () => {
        post(route('demo.enroll', program.slug));
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4" />;
            case 'document': return <FileText className="h-4 w-4" />;
            case 'link': return <ExternalLink className="h-4 w-4" />;
            default: return <BookOpen className="h-4 w-4" />;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${t('demo.title')} - ${program.translated_name || program.name}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Demo Status Banner */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 sm:p-6 text-white mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold mb-2">
                                {t('demo.welcome_to')} {program.translated_name || program.name}
                            </h1>
                            <p className="text-blue-100 text-sm sm:text-base">
                                {t('demo.currently_in_demo_mode')}
                            </p>
                        </div>
                        <div className="text-left sm:text-right">
                            <div className="flex items-center space-x-2 mb-2">
                                <Calendar className="h-4 h-4 sm:h-5 sm:w-5" />
                                <span className="font-semibold text-sm sm:text-base">
                                    {daysRemaining} {t('time.days_remaining')}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-blue-200">
                                {t('demo.expires_on')} {new Date(demoExpiresAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                        {/* Debug Info */}
                        {!firstLesson && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                <strong className="font-bold">Debug: </strong>
                                <span className="block sm:inline">No first lesson found for demo. Program: {program?.slug}</span>
                            </div>
                        )}
                        
                        {/* Available Lesson */}
                        {firstLesson && (
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="bg-green-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-green-200">
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <div className="bg-green-500 rounded-full p-1.5 sm:p-2">
                                            <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                                {t('demo.available_lesson')}
                                            </h2>
                                            <p className="text-green-700 text-sm sm:text-base">
                                                {t('demo.start_learning_now')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                                {firstLesson.title}
                                            </h3>
                                            {firstLesson.description && (
                                                <p className="text-sm sm:text-base text-gray-600 mb-4">
                                                    {firstLesson.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg shrink-0">
                                            <Clock className="h-4 w-4" />
                                            <span>{firstLesson.duration_minutes} {t('time.minutes')}</span>
                                        </div>
                                    </div>

                                    {/* Lesson Resources */}
                                    {firstLesson.resources && firstLesson.resources.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                                                {t('lessons.resources')}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {firstLesson.resources.map((resource) => (
                                                    <div
                                                        key={resource.id}
                                                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="text-blue-600 shrink-0">
                                                            {getResourceIcon(resource.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {resource.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 capitalize">
                                                                {resource.type}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Lesson Content */}
                                    {firstLesson.content_body && (
                                        <div className="mb-6">
                                            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                                                {t('lessons.content')}
                                            </h4>
                                            <div className="prose prose-sm sm:prose max-w-none text-gray-700 bg-gray-50/50 p-4 rounded-lg">
                                                {firstLesson.content_body.length > 300 
                                                    ? `${firstLesson.content_body.substring(0, 300)}...` 
                                                    : firstLesson.content_body
                                                }
                                            </div>
                                        </div>
                                    )}

                                    <Link
                                        href={`/lessons/${firstLesson.id}`}
                                        className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-105 touch-manipulation"
                                        onClick={() => {
                                            console.log('Demo lesson button clicked', {
                                                lessonId: firstLesson.id,
                                                lessonTitle: firstLesson.title,
                                                routeUrl: `/lessons/${firstLesson.id}`
                                            });
                                        }}
                                    >
                                        <Play className="h-5 w-5 mr-2" />
                                        {t('lessons.start_lesson')}
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Locked Lessons */}
                        {lockedLessons.length > 0 && (
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                        {t('demo.locked_content')}
                                    </h2>
                                    <p className="text-sm sm:text-base text-gray-600">
                                        {t('demo.enroll_to_unlock')}
                                    </p>
                                </div>

                                <div className="p-4 sm:p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        {lockedLessons.slice(0, 6).map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg opacity-60"
                                            >
                                                <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-700 text-sm sm:text-base truncate">
                                                        {lesson.title}
                                                    </h4>
                                                    <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-500">
                                                        <span>{t('lessons.level')} {lesson.level}</span>
                                                        <span>•</span>
                                                        <span>{lesson.duration_minutes} {t('time.min')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {lockedLessons.length > 6 && (
                                        <p className="text-center text-gray-500 mt-4 text-sm">
                                            {t('demo.and_more_lessons', { count: lockedLessons.length - 6 })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Enrollment CTA */}
                        <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-lg p-4 sm:p-6 text-white">
                            <div className="text-center">
                                <Star className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-yellow-300" />
                                <h3 className="text-lg sm:text-xl font-bold mb-2">
                                    {t('demo.ready_to_enroll')}
                                </h3>
                                <p className="text-green-100 mb-4 sm:mb-6 text-xs sm:text-sm">
                                    {t('demo.unlock_all_lessons')}
                                </p>
                                <button
                                    onClick={handleEnrollment}
                                    disabled={processing}
                                    className="w-full bg-white text-green-600 font-bold py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-100 transform transition-all duration-200 hover:scale-105 disabled:opacity-50 text-sm sm:text-base touch-manipulation"
                                >
                                    {processing ? t('form.creating') : t('programs.enroll')}
                                </button>
                            </div>
                        </div>

                        {/* Program Info */}
                        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                                {t('programs.about_program')}
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-start space-x-3">
                                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                                            {program.translated_name || program.name}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                            {program.translated_description || program.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                                            {t('demo.full_program_includes')}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                            {lockedLessons.length + 1} {t('lessons.title')}, {t('demo.teacher_support')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Demo Actions */}
                        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                                {t('demo.demo_actions')}
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    href={route('programs.index')}
                                    className="block w-full text-center px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base touch-manipulation"
                                >
                                    {t('navigation.view_other_programs')}
                                </Link>
                                <form method="POST" action={route('demo.logout')}>
                                    <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]').getAttribute('content')} />
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 sm:py-3 text-sm text-red-600 hover:text-red-800 transition-colors touch-manipulation"
                                    >
                                        {t('demo.exit_demo')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}