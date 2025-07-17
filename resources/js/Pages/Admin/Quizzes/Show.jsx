import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import QuestionBuilder from '@/Components/Quiz/QuestionBuilder';
import QuestionList from '@/Components/Quiz/QuestionList';
import { ArrowLeft, Edit, Plus, Settings, Clock, Users, Award, Eye, EyeOff } from 'lucide-react';

export default function ShowQuiz({ quiz, quiz_types }) {
    const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    const handleAddQuestion = () => {
        setEditingQuestion(null);
        setShowQuestionBuilder(true);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
        setShowQuestionBuilder(true);
    };

    const handleQuestionSaved = () => {
        setShowQuestionBuilder(false);
        setEditingQuestion(null);
        // Refresh the page to get updated questions
        router.reload({ only: ['quiz'] });
    };

    const handleDeleteQuestion = (question) => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(route('admin.quizzes.questions.destroy', [quiz.id, question.id]), {
                onSuccess: () => {
                    router.reload({ only: ['quiz'] });
                }
            });
        }
    };

    const handleReorderQuestions = async (reorderedQuestions) => {
        try {
            const response = await fetch(route('admin.quizzes.questions.reorder', quiz.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    questions: reorderedQuestions
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Reload the quiz data to reflect the new order
                router.reload({ only: ['quiz'] });
            } else {
                console.error('Failed to reorder questions:', data.message);
                alert('Failed to reorder questions. Please try again.');
            }
        } catch (error) {
            console.error('Error reordering questions:', error);
            alert('An error occurred while reordering questions.');
        }
    };

    const toggleQuizStatus = () => {
        router.patch(route('admin.quizzes.update', quiz.id), {
            ...quiz,
            is_active: !quiz.is_active
        });
    };

    return (
        <AdminLayout>
            <Head title={`Quiz: ${quiz.title}`} />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                            <Link
                                href={route('admin.quizzes.index')}
                                className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Quizzes
                            </Link>
                        </div>
                        <div className="flex items-center space-x-3">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                                {quiz.title}
                            </h2>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                                quiz.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {quiz.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            {quiz.lesson?.program?.title} - {quiz.lesson?.title}
                        </p>
                    </div>
                    <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
                        <button
                            onClick={toggleQuizStatus}
                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                                quiz.is_active 
                                    ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                                    : 'text-green-700 bg-green-100 hover:bg-green-200'
                            }`}
                        >
                            {quiz.is_active ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                            {quiz.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link
                            href={route('admin.quizzes.student-results', quiz.id)}
                            className="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm bg-indigo-50 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            View Results
                        </Link>
                        <Link
                            href={route('admin.quizzes.edit', quiz.id)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Quiz
                        </Link>
                    </div>
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
                                    <Settings className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{quiz.passing_score}%</div>
                                <div className="text-sm text-gray-500">Passing Score</div>
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

                        {quiz.description && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                                <p className="text-sm text-gray-600">{quiz.description}</p>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Quiz Settings</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Type:</span>
                                    <span className="ml-2 text-gray-600">{quiz.type_display}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Max Attempts:</span>
                                    <span className="ml-2 text-gray-600">{quiz.max_attempts}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Show Results:</span>
                                    <span className="ml-2 text-gray-600">
                                        {quiz.show_results_immediately ? 'Immediately' : 'After grading'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Shuffle Questions:</span>
                                    <span className="ml-2 text-gray-600">
                                        {quiz.shuffle_questions ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions Section */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">
                                Questions ({quiz.questions.length})
                            </h3>
                            <button
                                onClick={handleAddQuestion}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Question
                            </button>
                        </div>
                    </div>

                    {quiz.questions.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by adding your first question to this quiz.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={handleAddQuestion}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add First Question
                                </button>
                            </div>
                        </div>
                    ) : (
                        <QuestionList
                            questions={quiz.questions}
                            quizType={quiz.type}
                            onEdit={handleEditQuestion}
                            onDelete={handleDeleteQuestion}
                            onReorder={handleReorderQuestions}
                        />
                    )}
                </div>
            </div>

            {/* Question Builder Modal */}
            {showQuestionBuilder && (
                <QuestionBuilder
                    quiz={quiz}
                    question={editingQuestion}
                    quizTypes={quiz_types}
                    onSave={handleQuestionSaved}
                    onCancel={() => setShowQuestionBuilder(false)}
                />
            )}
        </AdminLayout>
    );
}