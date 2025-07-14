import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Edit, Trash2, Eye, Copy, Clock, FileText, Users } from 'lucide-react';

export default function QuizzesIndex({ quizzes, pagination }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const handleDelete = (quiz) => {
        if (confirm(`Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`)) {
            router.delete(route('admin.quizzes.destroy', quiz.id), {
                onSuccess: () => {
                    // Success handled by flash message
                }
            });
        }
    };

    const filteredQuizzes = quizzes.data?.filter(quiz => {
        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            quiz.lesson?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            quiz.lesson?.program?.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !typeFilter || quiz.type === typeFilter;
        return matchesSearch && matchesType;
    }) || [];

    const getTypeColor = (type) => {
        const colors = {
            mental_arithmetic: 'bg-blue-100 text-blue-800',
            multiple_choice: 'bg-green-100 text-green-800',
            text_answer: 'bg-purple-100 text-purple-800',
            true_false: 'bg-orange-100 text-orange-800',
            mixed: 'bg-gray-100 text-gray-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout>
            <Head title="Quiz Management" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Quiz Management
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Create and manage quizzes for your lessons
                        </p>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        <Link
                            href={route('admin.quizzes.create')}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Quiz
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search Quizzes
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by title, lesson, or program..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Filter by Type
                                </label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">All Types</option>
                                    <option value="mental_arithmetic">Mental Arithmetic</option>
                                    <option value="multiple_choice">Multiple Choice</option>
                                    <option value="text_answer">Text Answer</option>
                                    <option value="true_false">True/False</option>
                                    <option value="mixed">Mixed Questions</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quiz List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {filteredQuizzes.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || typeFilter ? 'Try adjusting your filters' : 'Get started by creating a new quiz'}
                            </p>
                            {!searchTerm && !typeFilter && (
                                <div className="mt-6">
                                    <Link
                                        href={route('admin.quizzes.create')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create First Quiz
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {filteredQuizzes.map((quiz) => (
                                <li key={quiz.id} className="px-6 py-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                                    {quiz.title}
                                                </h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(quiz.type)}`}>
                                                    {quiz.type_display}
                                                </span>
                                                {!quiz.is_active && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                                                {quiz.lesson && (
                                                    <span className="flex items-center">
                                                        <FileText className="w-4 h-4 mr-1" />
                                                        {quiz.lesson.program?.title} - {quiz.lesson.title}
                                                    </span>
                                                )}
                                                <span className="flex items-center">
                                                    <Users className="w-4 h-4 mr-1" />
                                                    {quiz.questions_count} questions
                                                </span>
                                                {quiz.total_points > 0 && (
                                                    <span>
                                                        {quiz.total_points} points
                                                    </span>
                                                )}
                                                {quiz.time_limit && (
                                                    <span className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {quiz.time_limit}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="mt-1 text-xs text-gray-400">
                                                Created {quiz.created_at}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                href={route('admin.quizzes.show', quiz.id)}
                                                className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                title="View Quiz"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                href={route('admin.quizzes.edit', quiz.id)}
                                                className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                title="Edit Quiz"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => router.post(route('admin.quizzes.duplicate', quiz.id))}
                                                className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                title="Duplicate Quiz"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quiz)}
                                                className="inline-flex items-center p-2 border border-red-300 rounded-md shadow-sm bg-white text-sm font-medium text-red-700 hover:bg-red-50"
                                                title="Delete Quiz"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            {pagination.current_page > 1 && (
                                <Link
                                    href={route('admin.quizzes.index', { page: pagination.current_page - 1 })}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Previous
                                </Link>
                            )}
                            {pagination.current_page < pagination.last_page && (
                                <Link
                                    href={route('admin.quizzes.index', { page: pagination.current_page + 1 })}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page {pagination.current_page} of {pagination.last_page}
                                    {' '}({pagination.total} total quizzes)
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                                        <Link
                                            key={page}
                                            href={route('admin.quizzes.index', { page })}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                page === pagination.current_page
                                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}