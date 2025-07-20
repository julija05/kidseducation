import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Play, Clock, Award, Users, FileText, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function ShowQuiz({ quiz, attempts, attempt_count, can_take_quiz, best_score, has_passed }) {
    const handleStartQuiz = () => {
        router.post(route('student.quiz.start', quiz.id));
    };

    const getAttemptStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'in_progress':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'expired':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'abandoned':
                return <XCircle className="w-5 h-5 text-gray-500" />;
            default:
                return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Quiz: ${quiz.title}`} />

            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href={route('lessons.show', quiz.lesson.id)}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Lesson
                    </Link>
                    
                    <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
                        {has_passed && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Passed
                            </span>
                        )}
                    </div>
                    
                    <p className="text-gray-600">
                        {quiz.lesson.program.title} • {quiz.lesson.title}
                    </p>
                    
                    {quiz.description && (
                        <p className="mt-4 text-gray-700">{quiz.description}</p>
                    )}
                </div>

                {/* Quiz Overview */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Quiz Overview</h3>
                    </div>
                    <div className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{quiz.total_questions}</div>
                                <div className="text-sm text-gray-500">Questions</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                                    <Award className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{quiz.total_points}</div>
                                <div className="text-sm text-gray-500">Total Points</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                                    <CheckCircle className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{quiz.passing_score}%</div>
                                <div className="text-sm text-gray-500">To Pass</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {quiz.formatted_time_limit || 'No limit'}
                                </div>
                                <div className="text-sm text-gray-500">Time Limit</div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Quiz Type:</span>
                                    <span className="ml-2 text-gray-600">{quiz.type_display}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Max Attempts:</span>
                                    <span className="ml-2 text-gray-600">{quiz.max_attempts}</span>
                                </div>
                                {quiz.formatted_question_time_limit && (
                                    <div>
                                        <span className="font-medium text-gray-700">Time per Question:</span>
                                        <span className="ml-2 text-gray-600">{quiz.formatted_question_time_limit}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Status */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Your Progress</h3>
                    </div>
                    <div className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{attempt_count}</div>
                                <div className="text-sm text-gray-500">Attempts Used</div>
                                <div className="text-xs text-gray-400">out of {quiz.max_attempts}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {best_score !== null ? `${parseFloat(best_score).toFixed(1)}%` : '--'}
                                </div>
                                <div className="text-sm text-gray-500">Best Score</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${has_passed ? 'text-green-600' : 'text-gray-900'}`}>
                                    {has_passed ? 'PASSED' : 'NOT PASSED'}
                                </div>
                                <div className="text-sm text-gray-500">Status</div>
                            </div>
                        </div>

                        {can_take_quiz && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleStartQuiz}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Play className="w-5 h-5 mr-2" />
                                    {attempt_count === 0 ? 'Start Quiz' : 'Retake Quiz'}
                                </button>
                            </div>
                        )}

                        {!can_take_quiz && attempt_count >= quiz.max_attempts && (
                            <div className="mt-6 text-center">
                                <p className="text-red-600 font-medium">
                                    You have used all {quiz.max_attempts} attempts for this quiz.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Attempt History */}
                {attempts.length > 0 && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Attempt History</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {attempts.map((attempt, index) => (
                                <div key={attempt.id} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {getAttemptStatusIcon(attempt.status)}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    Attempt #{attempts.length - index}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Started: {new Date(attempt.started_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            {attempt.status === 'completed' && (
                                                <>
                                                    <div className={`text-lg font-bold ${
                                                        attempt.passed ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {parseFloat(attempt.score || 0).toFixed(1)}%
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {attempt.correct_answers}/{attempt.total_questions} correct
                                                    </div>
                                                    {attempt.formatted_time_taken && (
                                                        <div className="text-xs text-gray-400">
                                                            Time: {attempt.formatted_time_taken}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            
                                            {attempt.status === 'in_progress' && (
                                                <Link
                                                    href={route('student.quiz.take', [quiz.id, attempt.id])}
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Continue
                                                </Link>
                                            )}
                                            
                                            {attempt.status === 'completed' && (
                                                <Link
                                                    href={route('student.quiz.result', [quiz.id, attempt.id])}
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                >
                                                    View Results
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}