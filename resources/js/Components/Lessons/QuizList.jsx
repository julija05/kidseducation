import React from 'react';
import { Link } from '@inertiajs/react';
import { Play, Clock, Award, Users, FileQuestion } from 'lucide-react';

export default function QuizList({ quizzes = [] }) {
    if (!quizzes || quizzes.length === 0) {
        return null;
    }

    const getQuizTypeIcon = (type) => {
        const icons = {
            mental_arithmetic: '🧮',
            multiple_choice: '✅',
            text_answer: '✏️',
            true_false: '❓',
            mixed: '📝'
        };
        return icons[type] || '📝';
    };

    return (
        <div className="mt-8">
            <div className="flex items-center mb-4">
                <FileQuestion className="w-6 h-6 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                    Quizzes ({quizzes.length})
                </h3>
            </div>

            <div className="grid gap-4">
                {quizzes.map((quiz) => (
                    <div
                        key={quiz.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-2xl">{getQuizTypeIcon(quiz.type)}</span>
                                    <h4 className="text-lg font-medium text-gray-900">
                                        {quiz.title}
                                    </h4>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        {quiz.type_display}
                                    </span>
                                </div>

                                {quiz.description && (
                                    <p className="text-gray-600 mb-3">{quiz.description}</p>
                                )}

                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        {quiz.total_questions} questions
                                    </div>
                                    <div className="flex items-center">
                                        <Award className="w-4 h-4 mr-1" />
                                        {quiz.total_points} points
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-medium">Pass:</span>
                                        <span className="ml-1">{quiz.passing_score}%</span>
                                    </div>
                                    {quiz.formatted_time_limit && (
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {quiz.formatted_time_limit}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="ml-4">
                                <Link
                                    href={route('student.quiz.show', quiz.id)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Take Quiz
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}