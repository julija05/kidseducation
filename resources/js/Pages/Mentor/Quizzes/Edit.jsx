import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import MentorLayout from '@/Layouts/MentorLayout';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';

/**
 * EditQuiz Component
 * Allows mentors to edit quiz details and manage questions
 */
export default function Edit({ quiz }) {
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    const { data: quizData, setData: setQuizData, put: updateQuiz, processing: updatingQuiz, errors: quizErrors } = useForm({
        title: quiz.title || '',
        description: quiz.description || '',
        type: quiz.type || 'practice',
        time_limit: quiz.time_limit || '',
        max_attempts: quiz.max_attempts || 3,
        passing_score: quiz.passing_score || 70,
        show_results_immediately: quiz.show_results_immediately ?? true,
        shuffle_questions: quiz.shuffle_questions ?? false,
        shuffle_answers: quiz.shuffle_answers ?? false,
    });

    const { data: questionData, setData: setQuestionData, post: saveQuestion, reset: resetQuestion, processing: savingQuestion, errors: questionErrors } = useForm({
        question_text: '',
        question_type: 'multiple_choice',
        points: 1,
        answers: [
            { answer_text: '', is_correct: true },
            { answer_text: '', is_correct: false },
        ],
    });

    /**
     * Handle updating quiz settings
     */
    const handleUpdateQuiz = (e) => {
        e.preventDefault();
        updateQuiz(route('mentor.quizzes.update', quiz.id));
    };

    /**
     * Handle adding a new question
     */
    const handleAddQuestion = () => {
        setEditingQuestion(null);
        resetQuestion();
        setShowQuestionForm(true);
    };

    /**
     * Handle editing an existing question
     */
    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
        setQuestionData({
            question_text: question.question_text,
            question_type: question.question_type,
            points: question.points,
            answers: question.answers.map(a => ({
                id: a.id,
                answer_text: a.answer_text,
                is_correct: a.is_correct,
            })),
        });
        setShowQuestionForm(true);
    };

    /**
     * Handle saving a question (create or update)
     */
    const handleSaveQuestion = (e) => {
        e.preventDefault();

        if (editingQuestion) {
            // Update existing question
            router.put(route('mentor.quizzes.questions.update', [quiz.id, editingQuestion.id]), questionData, {
                onSuccess: () => {
                    setShowQuestionForm(false);
                    resetQuestion();
                    router.reload({ only: ['quiz'] });
                }
            });
        } else {
            // Create new question
            saveQuestion(route('mentor.quizzes.questions.store', quiz.id), {
                onSuccess: () => {
                    setShowQuestionForm(false);
                    resetQuestion();
                    router.reload({ only: ['quiz'] });
                }
            });
        }
    };

    /**
     * Handle deleting a question
     */
    const handleDeleteQuestion = (question) => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(route('mentor.quizzes.questions.destroy', [quiz.id, question.id]), {
                onSuccess: () => {
                    router.reload({ only: ['quiz'] });
                }
            });
        }
    };

    /**
     * Handle adding a new answer option
     */
    const handleAddAnswer = () => {
        setQuestionData('answers', [...questionData.answers, { answer_text: '', is_correct: false }]);
    };

    /**
     * Handle removing an answer option
     */
    const handleRemoveAnswer = (index) => {
        if (questionData.answers.length > 2) {
            const newAnswers = questionData.answers.filter((_, i) => i !== index);
            setQuestionData('answers', newAnswers);
        }
    };

    /**
     * Handle updating an answer
     */
    const handleUpdateAnswer = (index, field, value) => {
        const newAnswers = [...questionData.answers];
        newAnswers[index][field] = value;

        // If setting this answer as correct, uncheck others for true/false and multiple choice
        if (field === 'is_correct' && value && questionData.question_type !== 'short_answer') {
            newAnswers.forEach((answer, i) => {
                if (i !== index) {
                    answer.is_correct = false;
                }
            });
        }

        setQuestionData('answers', newAnswers);
    };

    return (
        <MentorLayout>
            <Head title={`Edit Quiz - ${quiz.title}`} />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.get(route('mentor.programs.content', quiz.lesson.program.slug))}
                            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Program Content
                        </button>
                        <h1 className="text-3xl font-black text-slate-900">{quiz.title}</h1>
                        <p className="text-slate-600 mt-1">
                            {quiz.lesson.program.name} - {quiz.lesson.title}
                        </p>
                    </div>

                    {/* Quiz Settings */}
                    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Quiz Settings</h2>
                        <form onSubmit={handleUpdateQuiz} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={quizData.title}
                                        onChange={(e) => setQuizData('title', e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Type</label>
                                    <select
                                        value={quizData.type}
                                        onChange={(e) => setQuizData('type', e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                    >
                                        <option value="practice">Practice</option>
                                        <option value="graded">Graded</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Description</label>
                                <textarea
                                    value={quizData.description}
                                    onChange={(e) => setQuizData('description', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                    rows="3"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={updatingQuiz}
                                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {updatingQuiz ? 'Saving...' : 'Save Quiz Settings'}
                            </button>
                        </form>
                    </div>

                    {/* Questions Section */}
                    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Questions ({quiz.questions.length})</h2>
                            <button
                                onClick={handleAddQuestion}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Question
                            </button>
                        </div>

                        {/* Question Form */}
                        {showQuestionForm && (
                            <div className="bg-slate-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {editingQuestion ? 'Edit Question' : 'New Question'}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowQuestionForm(false);
                                            resetQuestion();
                                        }}
                                        className="text-slate-600 hover:text-slate-900"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSaveQuestion} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Question Text</label>
                                        <textarea
                                            value={questionData.question_text}
                                            onChange={(e) => setQuestionData('question_text', e.target.value)}
                                            className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                            rows="3"
                                            required
                                        />
                                        {questionErrors.question_text && (
                                            <p className="text-red-600 text-sm mt-1">{questionErrors.question_text}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Type</label>
                                            <select
                                                value={questionData.question_type}
                                                onChange={(e) => setQuestionData('question_type', e.target.value)}
                                                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                            >
                                                <option value="multiple_choice">Multiple Choice</option>
                                                <option value="true_false">True/False</option>
                                                <option value="short_answer">Short Answer</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-900 mb-2">Points</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={questionData.points}
                                                onChange={(e) => setQuestionData('points', parseFloat(e.target.value))}
                                                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Answers */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Answers</label>
                                        {questionData.answers.map((answer, index) => (
                                            <div key={index} className="flex items-center gap-2 mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={answer.is_correct}
                                                    onChange={(e) => handleUpdateAnswer(index, 'is_correct', e.target.checked)}
                                                    className="w-5 h-5 text-purple-500 rounded border-2 border-slate-300"
                                                    title="Mark as correct answer"
                                                />
                                                <input
                                                    type="text"
                                                    value={answer.answer_text}
                                                    onChange={(e) => handleUpdateAnswer(index, 'answer_text', e.target.value)}
                                                    className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-400 focus:outline-none"
                                                    placeholder={`Answer ${index + 1}`}
                                                    required
                                                />
                                                {questionData.answers.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAnswer(index)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {questionData.answers.length < 6 && (
                                            <button
                                                type="button"
                                                onClick={handleAddAnswer}
                                                className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                                            >
                                                + Add Answer Option
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={savingQuestion}
                                            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            {savingQuestion ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Save Question
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowQuestionForm(false);
                                                resetQuestion();
                                            }}
                                            className="px-6 py-2 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Questions List */}
                        {quiz.questions.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-600">No questions yet. Click "Add Question" to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {quiz.questions.map((question, index) => (
                                    <div key={question.id} className="border-2 border-slate-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-3 py-1 bg-slate-200 text-slate-700 font-bold text-sm rounded">
                                                        Q{index + 1}
                                                    </span>
                                                    <span className="text-sm text-slate-600 font-semibold">
                                                        {question.question_type.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                    <span className="text-sm text-purple-600 font-semibold">
                                                        {question.points} pts
                                                    </span>
                                                </div>
                                                <p className="text-slate-900 font-medium">{question.question_text}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditQuestion(question)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit question"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteQuestion(question)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete question"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Answers */}
                                        <div className="mt-3 space-y-1">
                                            {question.answers.map((answer, ansIndex) => (
                                                <div
                                                    key={answer.id}
                                                    className={`flex items-center gap-2 text-sm px-3 py-2 rounded ${
                                                        answer.is_correct
                                                            ? 'bg-green-50 text-green-900 font-semibold'
                                                            : 'bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    <span className="w-6 text-center">{String.fromCharCode(65 + ansIndex)}.</span>
                                                    <span>{answer.answer_text}</span>
                                                    {answer.is_correct && (
                                                        <span className="ml-auto text-green-600 font-bold text-xs">✓ CORRECT</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MentorLayout>
    );
}
