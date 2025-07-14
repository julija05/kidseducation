import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Calculator, Timer } from 'lucide-react';

// CSS for countdown animation
const countdownStyle = `
@keyframes countdown {
    0% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: 87.96; }
}
`;

// Add the style to document head if not already present
if (typeof document !== 'undefined' && !document.getElementById('flashcard-quiz-styles')) {
    const style = document.createElement('style');
    style.id = 'flashcard-quiz-styles';
    style.textContent = countdownStyle;
    document.head.appendChild(style);
}

export default function FlashCardQuiz({ sessions, onComplete }) {
    const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
    const [currentNumberIndex, setCurrentNumberIndex] = useState(-1); // -1 = not started
    const [sessionAnswer, setSessionAnswer] = useState('');
    const [sessionResults, setSessionResults] = useState([]);
    const [showingNumbers, setShowingNumbers] = useState(false);
    const [waitingForAnswer, setWaitingForAnswer] = useState(false);
    const [allSessionsComplete, setAllSessionsComplete] = useState(false);

    const currentSession = sessions[currentSessionIndex];
    
    useEffect(() => {
        if (showingNumbers && currentNumberIndex < currentSession.numbers.length) {
            const timer = setTimeout(() => {
                if (currentNumberIndex === currentSession.numbers.length - 1) {
                    // Finished showing all numbers in this session
                    setShowingNumbers(false);
                    setWaitingForAnswer(true);
                } else {
                    setCurrentNumberIndex(prev => prev + 1);
                }
            }, currentSession.display_time * 1000);

            return () => clearTimeout(timer);
        }
    }, [showingNumbers, currentNumberIndex, currentSession]);

    const startSession = () => {
        setCurrentNumberIndex(0);
        setShowingNumbers(true);
        setWaitingForAnswer(false);
        setSessionAnswer('');
    };

    const submitSessionAnswer = () => {
        if (!sessionAnswer.trim()) return;
        
        const userAnswer = parseInt(sessionAnswer);
        const correctAnswer = currentSession.correct_answer;
        const isCorrect = userAnswer === correctAnswer;
        
        const result = {
            session_id: currentSession.session_id,
            user_answer: userAnswer,
            correct_answer: correctAnswer,
            is_correct: isCorrect,
            numbers: currentSession.numbers,
        };
        
        const newResults = [...sessionResults, result];
        setSessionResults(newResults);
        
        if (currentSessionIndex === sessions.length - 1) {
            // All sessions complete
            setAllSessionsComplete(true);
            onComplete(newResults);
        } else {
            // Move to next session
            setCurrentSessionIndex(prev => prev + 1);
            setCurrentNumberIndex(-1);
            setShowingNumbers(false);
            setWaitingForAnswer(false);
            setSessionAnswer('');
        }
    };

    const renderSessionStart = () => (
        <div className="text-center py-12">
            <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Session {currentSession.session_id} of {sessions.length}
                </h3>
                <p className="text-gray-600 mb-4">
                    You will see {currentSession.numbers.length} numbers, each for {currentSession.display_time} seconds.
                </p>
                <p className="text-sm text-gray-500">
                    Calculate the operations in your head and enter the final result at the end.
                </p>
            </div>
            
            <button
                onClick={startSession}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <Play className="w-5 h-5 mr-2" />
                Start Session
            </button>
        </div>
    );

    const renderNumberDisplay = () => {
        const currentNumber = currentSession.numbers[currentNumberIndex];
        const isFirstNumber = currentNumberIndex === 0;
        
        let displayNumber, operationText;
        
        if (isFirstNumber) {
            // First number is always just the number
            displayNumber = typeof currentNumber === 'object' ? currentNumber.value : currentNumber;
            operationText = "Start with this number";
        } else {
            // Handle different operation types
            if (typeof currentNumber === 'object') {
                // Multiplication or division
                if (currentNumber.operation === 'multiply') {
                    displayNumber = `×${currentNumber.value}`;
                    operationText = "Multiply by this number";
                } else if (currentNumber.operation === 'divide') {
                    displayNumber = `÷${currentNumber.value}`;
                    operationText = "Divide by this number";
                }
            } else {
                // Addition or subtraction
                displayNumber = currentNumber > 0 ? `+${currentNumber}` : currentNumber;
                operationText = currentNumber > 0 ? "Add this number" : "Subtract this number";
            }
        }
        
        return (
            <div className="text-center py-16">
                <div className="mb-8">
                    <div className="text-sm text-gray-500 mb-4">
                        Session {currentSession.session_id} - Number {currentNumberIndex + 1} of {currentSession.numbers.length}
                    </div>
                    
                    {/* Large number display */}
                    <div className="relative mb-6">
                        <div className="text-9xl font-bold text-indigo-600 mb-2 animate-pulse">
                            {displayNumber}
                        </div>
                        
                        {/* Timer countdown circle */}
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative w-16 h-16">
                                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 32 32">
                                    <circle
                                        cx="16" cy="16" r="14"
                                        fill="transparent"
                                        stroke="#e5e7eb"
                                        strokeWidth="2"
                                    />
                                    <circle
                                        cx="16" cy="16" r="14"
                                        fill="transparent"
                                        stroke="#4f46e5"
                                        strokeWidth="2"
                                        strokeDasharray="87.96"
                                        strokeDashoffset="0"
                                        className="animate-spin"
                                        style={{
                                            animation: `countdown ${currentSession.display_time}s linear forwards`
                                        }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Timer className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-lg text-gray-600 font-medium">
                            {operationText}
                        </div>
                    </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-80 mx-auto bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                        style={{ 
                            width: `${((currentNumberIndex + 1) / currentSession.numbers.length) * 100}%` 
                        }}
                    />
                </div>
                <div className="text-sm text-gray-500 mb-6">
                    Progress: {currentNumberIndex + 1}/{currentSession.numbers.length}
                </div>
                
                {/* Mental calculation hint */}
                <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                    <div className="text-sm text-blue-800 font-medium mb-1">
                        Mental Calculation:
                    </div>
                    <div className="text-blue-700">
                        {currentNumberIndex === 0 
                            ? `Start with: ${displayNumber}`
                            : `Apply operation: ${displayNumber}`
                        }
                    </div>
                </div>
            </div>
        );
    };

    const renderAnswerInput = () => (
        <div className="text-center py-12">
            <div className="mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Session {currentSession.session_id} Complete!
                </h3>
                <p className="text-gray-600 mb-2">
                    You saw this sequence:
                </p>
                <div className="text-2xl font-bold text-indigo-600 mb-6">
                    {currentSession.operations_sequence || currentSession.numbers.map((num, idx) => {
                        if (idx === 0) {
                            return typeof num === 'object' ? num.value : num;
                        }
                        if (typeof num === 'object') {
                            if (num.operation === 'multiply') return ` ×${num.value}`;
                            if (num.operation === 'divide') return ` ÷${num.value}`;
                        }
                        return num > 0 ? ` +${num}` : ` ${num}`;
                    }).join('')}
                </div>
                <p className="text-gray-700 font-medium mb-6">
                    What is the final result of this calculation?
                </p>
                <p className="text-sm text-gray-500 mb-4">
                    Take your time to think and enter your answer below.
                </p>
            </div>
            
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer:
                </label>
                <input
                    type="number"
                    value={sessionAnswer}
                    onChange={(e) => setSessionAnswer(e.target.value)}
                    placeholder="Enter the sum"
                    className="w-48 px-4 py-3 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && sessionAnswer.trim()) {
                            submitSessionAnswer();
                        }
                    }}
                />
            </div>
            
            <div className="space-y-3">
                <button
                    onClick={submitSessionAnswer}
                    disabled={!sessionAnswer.trim()}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Answer
                </button>
                
                <div className="text-xs text-gray-400">
                    Press Enter to submit or click the button above
                </div>
            </div>
        </div>
    );

    const renderResults = () => {
        const correctCount = sessionResults.filter(r => r.is_correct).length;
        const totalSessions = sessionResults.length;
        const percentage = Math.round((correctCount / totalSessions) * 100);
        
        return (
            <div className="text-center py-12">
                <div className="mb-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        percentage >= 70 ? 'bg-green-100' : percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                        <CheckCircle className={`w-10 h-10 ${
                            percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Flash Card Quiz Complete!
                    </h3>
                    <p className="text-lg text-gray-600 mb-2">
                        You completed {totalSessions} sessions
                    </p>
                    <div className={`text-3xl font-bold mb-6 ${
                        percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                        {correctCount}/{totalSessions} correct ({percentage}%)
                    </div>
                    
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                        percentage >= 70 ? 'bg-green-100 text-green-800' : 
                        percentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {percentage >= 70 ? '🎉 Excellent!' : percentage >= 50 ? '👍 Good job!' : '💪 Keep practicing!'}
                    </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Session Results</h4>
                    <div className="space-y-3">
                        {sessionResults.map((result, index) => (
                            <div 
                                key={index}
                                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-md ${
                                    result.is_correct ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
                                }`}
                            >
                                <div className="flex items-center mb-2 sm:mb-0">
                                    <span className="font-medium text-gray-900">Session {result.session_id}:</span>
                                    <span className="ml-2 text-gray-700">
                                        {result.numbers.map((num, idx) => {
                                            if (idx === 0) {
                                                return typeof num === 'object' ? num.value : num;
                                            }
                                            if (typeof num === 'object') {
                                                if (num.operation === 'multiply') return ` ×${num.value}`;
                                                if (num.operation === 'divide') return ` ÷${num.value}`;
                                            }
                                            return num > 0 ? ` +${num}` : ` ${num}`;
                                        }).join('')} = {result.correct_answer}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Your answer: <strong>{result.user_answer}</strong></span>
                                    {result.is_correct ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <span className="text-red-600 font-bold">✗</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="text-sm text-gray-500 mb-6">
                    You can now continue to the next question or review your answers.
                </div>
            </div>
        );
    };

    if (allSessionsComplete) {
        return renderResults();
    }

    if (currentNumberIndex === -1) {
        return renderSessionStart();
    }

    if (showingNumbers) {
        return renderNumberDisplay();
    }

    if (waitingForAnswer) {
        return renderAnswerInput();
    }

    return null;
}