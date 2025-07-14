import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Clock, ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import FlashCardQuiz from '@/Components/Quiz/FlashCardQuiz';

export default function TakeQuiz({ quiz, attempt, questions, total_questions, current_question }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(attempt.remaining_time);
    const [questionTimeRemaining, setQuestionTimeRemaining] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];

    // Timer effects
    useEffect(() => {
        if (!timeRemaining) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    useEffect(() => {
        if (!quiz.question_time_limit) return;
        
        setQuestionTimeRemaining(quiz.question_time_limit);
        
        const timer = setInterval(() => {
            setQuestionTimeRemaining(prev => {
                if (prev <= 1) {
                    handleNextQuestion();
                    return quiz.question_time_limit;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuestionIndex, quiz.question_time_limit]);

    const handleTimeUp = () => {
        router.post(route('student.quiz.submit', [quiz.id, attempt.id]));
    };

    const handleAnswerChange = (answer) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: answer
        }));
    };

    const handleNextQuestion = () => {
        // Save current answer if provided
        if (answers[currentQuestion.id]) {
            // For now, just store locally and save all at once when submitting
            // We can implement individual answer saving later if needed
        }
        
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmitQuiz();
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = () => {
        if (isSubmitting) return;
        
        if (confirm('Are you sure you want to submit the quiz? You cannot change your answers after submission.')) {
            setIsSubmitting(true);
            // Submit all answers at once
            router.post(route('student.quiz.submit', [quiz.id, attempt.id]), {
                answers: answers
            });
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderQuestion = () => {
        if (!currentQuestion) return null;

        switch (currentQuestion.type) {
            case 'mental_arithmetic':
                // Check if this is a flash card style question
                if (currentQuestion.question_data && currentQuestion.question_data.sessions) {
                    return (
                        <div>
                            <FlashCardQuiz
                                sessions={currentQuestion.question_data.sessions}
                                onComplete={(results) => {
                                    // Calculate total score from all sessions
                                    const correctCount = results.filter(r => r.is_correct).length;
                                    const totalSessions = results.length;
                                    const percentage = Math.round((correctCount / totalSessions) * 100);
                                    
                                    // Store the results as the answer
                                    handleAnswerChange(JSON.stringify({
                                        type: 'flash_card_sessions',
                                        results: results,
                                        correct_count: correctCount,
                                        total_sessions: totalSessions,
                                        percentage: percentage
                                    }));
                                }}
                            />
                            
                            {/* Show navigation only if flash card quiz is completed */}
                            {answers[currentQuestion.id] && (
                                <div className="mt-6 text-center">
                                    <p className="text-green-600 font-medium mb-4">
                                        Flash card quiz completed! You can now continue.
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                }
                
                // Fall back to traditional mental arithmetic display or show error
                if (currentQuestion.question_data && currentQuestion.question_data.display_sequence) {
                    return (
                        <div className="text-center">
                            <div className="text-lg font-medium text-gray-900 mb-4">
                                Calculate the result of:
                            </div>
                            <div className="text-3xl font-bold text-indigo-600 mb-6">
                                {currentQuestion.question_data.display_sequence}
                            </div>
                            <input
                                type="number"
                                value={answers[currentQuestion.id] || ''}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                                placeholder="Enter your answer"
                                className="w-32 px-4 py-2 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                autoFocus
                            />
                        </div>
                    );
                }
                
                // Error fallback
                return (
                    <div className="text-center py-8">
                        <div className="text-yellow-600 font-medium mb-4">
                            No mental arithmetic content available for this question.
                        </div>
                        <p className="text-gray-600 text-sm">
                            This quiz may not have been properly configured. Please contact your instructor.
                        </p>
                    </div>
                );

            case 'multiple_choice':
                return (
                    <div>
                        <div className="text-lg font-medium text-gray-900 mb-4">
                            {currentQuestion.question_text}
                        </div>
                        <div className="space-y-2">
                            {Object.entries(currentQuestion.answer_options || {}).map(([key, value]) => (
                                <label
                                    key={key}
                                    className={`flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                                        answers[currentQuestion.id] === key ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question_${currentQuestion.id}`}
                                        value={key}
                                        checked={answers[currentQuestion.id] === key}
                                        onChange={(e) => handleAnswerChange(e.target.value)}
                                        className="mr-3"
                                    />
                                    <span className="flex-1">{value}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            case 'true_false':
                return (
                    <div>
                        <div className="text-lg font-medium text-gray-900 mb-4">
                            {currentQuestion.question_text}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <label
                                className={`flex items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-gray-50 ${
                                    answers[currentQuestion.id] === 'true' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question_${currentQuestion.id}`}
                                    value="true"
                                    checked={answers[currentQuestion.id] === 'true'}
                                    onChange={(e) => handleAnswerChange(e.target.value)}
                                    className="mr-2"
                                />
                                True
                            </label>
                            <label
                                className={`flex items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-gray-50 ${
                                    answers[currentQuestion.id] === 'false' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question_${currentQuestion.id}`}
                                    value="false"
                                    checked={answers[currentQuestion.id] === 'false'}
                                    onChange={(e) => handleAnswerChange(e.target.value)}
                                    className="mr-2"
                                />
                                False
                            </label>
                        </div>
                    </div>
                );

            case 'text_answer':
                return (
                    <div>
                        <div className="text-lg font-medium text-gray-900 mb-4">
                            {currentQuestion.question_text}
                        </div>
                        <textarea
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            placeholder={currentQuestion.placeholder || 'Enter your answer'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={4}
                        />
                    </div>
                );

            default:
                return <div>Unsupported question type</div>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Taking Quiz: ${quiz.title}`} />

            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                        <div className="flex items-center space-x-4">
                            {timeRemaining && (
                                <div className="flex items-center text-orange-600">
                                    <Clock className="w-5 h-5 mr-1" />
                                    <span className="font-mono text-lg">
                                        {formatTime(timeRemaining)}
                                    </span>
                                </div>
                            )}
                            {questionTimeRemaining && (
                                <div className="flex items-center text-blue-600">
                                    <AlertTriangle className="w-5 h-5 mr-1" />
                                    <span className="font-mono">
                                        {formatTime(questionTimeRemaining)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestionIndex + 1) / total_questions) * 100}%` }}
                        />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        Question {currentQuestionIndex + 1} of {total_questions}
                    </div>
                </div>

                {/* Question */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    {renderQuestion()}
                </div>

                {/* Navigation - only show if not a flash card question or if flash card is completed */}
                {(!currentQuestion.question_data || !currentQuestion.question_data.sessions || answers[currentQuestion.id]) && (
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Previous
                        </button>

                        <div className="flex space-x-3">
                            {currentQuestionIndex < questions.length - 1 ? (
                                <button
                                    onClick={handleNextQuestion}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Next Question
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmitQuiz}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}