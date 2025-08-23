import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CheckCircle, XCircle, Clock, Award, ArrowLeft, RotateCcw, Eye } from 'lucide-react';

export default function QuizResult({ quiz, attempt, question_results = [], show_detailed_results, can_retake }) {
    const getScoreColor = (score, passingScore) => {
        if (score >= passingScore) return 'text-green-600';
        if (score >= passingScore * 0.7) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBackground = (score, passingScore) => {
        if (score >= passingScore) return 'bg-green-100 border-green-500';
        if (score >= passingScore * 0.7) return 'bg-yellow-100 border-yellow-500';
        return 'bg-red-100 border-red-500';
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Quiz Results: ${quiz.title}`} />

            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={route('student.quiz.show', quiz.id)}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Quiz
                    </Link>
                    
                    <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                    <p className="text-gray-600">{quiz.lesson.title}</p>
                </div>

                {/* Results Overview */}
                <div className={`border-2 rounded-lg p-6 mb-6 ${getScoreBackground(parseFloat(attempt.score || 0), quiz.passing_score)}`}>
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            {attempt.passed ? (
                                <CheckCircle className="w-16 h-16 text-green-600" />
                            ) : (
                                <XCircle className="w-16 h-16 text-red-600" />
                            )}
                        </div>
                        
                        <h2 className="text-3xl font-bold mb-2">
                            {attempt.passed ? 'Congratulations!' : 'Keep Trying!'}
                        </h2>
                        
                        <div className={`text-5xl font-bold mb-4 ${getScoreColor(parseFloat(attempt.score || 0), quiz.passing_score)}`}>
                            {parseFloat(attempt.score || 0).toFixed(1)}%
                        </div>
                        
                        <p className="text-lg text-gray-700">
                            {attempt.passed 
                                ? `You passed! You scored above the ${quiz.passing_score}% threshold.`
                                : `You need ${quiz.passing_score}% to pass. You can retake this quiz.`
                            }
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{attempt.correct_answers}</div>
                        <div className="text-sm text-gray-500">Correct Answers</div>
                        <div className="text-xs text-gray-400">out of {attempt.total_questions}</div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{attempt.earned_points}</div>
                        <div className="text-sm text-gray-500">Points Earned</div>
                        <div className="text-xs text-gray-400">out of {attempt.total_points}</div>
                    </div>
                    
                    {attempt.formatted_time_taken && (
                        <div className="bg-white rounded-lg shadow p-4 text-center">
                            <div className="flex items-center justify-center mb-1">
                                <Clock className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="text-lg font-bold text-gray-900">{attempt.formatted_time_taken}</div>
                            <div className="text-sm text-gray-500">Time Taken</div>
                        </div>
                    )}
                    
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <div className="flex items-center justify-center mb-1">
                            <Award className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {attempt.passed ? 'Passed' : 'Failed'}
                        </div>
                        <div className="text-sm text-gray-500">Status</div>
                    </div>
                </div>

                {/* Detailed Results */}
                {show_detailed_results && question_results.length > 0 && (
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <Eye className="w-5 h-5 mr-2" />
                                Question-by-Question Results
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {question_results.map((result, index) => (
                                <div key={result.question.id} className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {result.question.type_display} • {result.question.points} points
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            {result.is_correct ? (
                                                <CheckCircle className="w-6 h-6 text-green-500" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-red-500" />
                                            )}
                                            <span className="ml-2 text-sm font-medium">
                                                {result.points_earned} / {result.question.points} pts
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <h4 className="font-medium text-gray-900">
                                            {result.question.question_text}
                                        </h4>
                                        
                                        {result.question.type === 'mental_arithmetic' && result.question.mental_arithmetic && (
                                            <div className="mt-2 text-lg font-mono text-indigo-600">
                                                {result.question.mental_arithmetic.sequence}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {result.question.type === 'mental_arithmetic' ? (
                                        // Special display for mental arithmetic
                                        <div className="space-y-3">
                                            <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3">
                                                <div className="text-sm">
                                                    <span className="font-medium text-indigo-900">Result:</span>
                                                    <span className={`ml-2 font-medium ${result.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                                                        {result.user_answer}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Required:</span>
                                                <span className="ml-2">{result.correct_answer}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        // Standard display for other question types
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Your Answer:</span>
                                                <span className={`ml-2 ${result.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                                                    {result.user_answer || 'No answer provided'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Correct Answer:</span>
                                                <span className="ml-2 text-green-600">
                                                    {result.correct_answer}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {result.explanation && (
                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                            <span className="font-medium text-blue-900">Explanation:</span>
                                            <p className="text-blue-800 mt-1">{result.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center space-x-4">
                    <Link
                        href={route('student.quiz.show', quiz.id)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Quiz Overview
                    </Link>
                    
                    {can_retake && !attempt.passed && (
                        <Link
                            href={route('student.quiz.start', quiz.id)}
                            method="post"
                            as="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retake Quiz
                        </Link>
                    )}
                </div>

                {!show_detailed_results && (
                    <div className="mt-6 text-center">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <p className="text-yellow-800">
                                Detailed results will be available after the instructor reviews your submission.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}