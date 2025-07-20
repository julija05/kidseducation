import React, { useState, useRef } from 'react';
import { Edit, Trash2, GripVertical, Calculator, CheckCircle, FileText, HelpCircle } from 'lucide-react';

export default function QuestionList({ questions, quizType, onEdit, onDelete, onReorder }) {
    const [isDragging, setIsDragging] = useState(false);
    const [draggedQuestionId, setDraggedQuestionId] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [isReordering, setIsReordering] = useState(false);
    const draggedElementRef = useRef(null);
    
    const handleDragStart = (e, question, index) => {
        setIsDragging(true);
        setDraggedQuestionId(question.id);
        draggedElementRef.current = e.target;
        
        // Set drag data
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        
        // Add some visual feedback
        e.target.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        setIsDragging(false);
        setDraggedQuestionId(null);
        setDragOverIndex(null);
        
        // Reset visual feedback
        e.target.style.opacity = '1';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDragLeave = (e) => {
        // Only clear drag over if we're leaving the actual drop zone
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverIndex(null);
        }
    };

    const handleDrop = async (e, targetIndex) => {
        e.preventDefault();
        setDragOverIndex(null);
        
        if (!draggedQuestionId || isReordering) return;
        
        const draggedIndex = questions.findIndex(q => q.id === draggedQuestionId);
        if (draggedIndex === -1 || draggedIndex === targetIndex) return;
        
        try {
            setIsReordering(true);
            
            // Create new order array
            const newQuestions = [...questions];
            const [draggedQuestion] = newQuestions.splice(draggedIndex, 1);
            newQuestions.splice(targetIndex, 0, draggedQuestion);
            
            // Update orders
            const reorderedQuestions = newQuestions.map((question, index) => ({
                id: question.id,
                order: index + 1
            }));
            
            // Call parent function to handle reordering
            if (onReorder) {
                await onReorder(reorderedQuestions);
            }
        } catch (error) {
            console.error('Error reordering questions:', error);
        } finally {
            setIsReordering(false);
        }
    };

    const getQuestionIcon = (type) => {
        const icons = {
            mental_arithmetic: Calculator,
            multiple_choice: CheckCircle,
            text_answer: FileText,
            true_false: HelpCircle,
        };
        return icons[type] || HelpCircle;
    };

    const getTypeColor = (type) => {
        const colors = {
            mental_arithmetic: 'bg-blue-100 text-blue-800',
            multiple_choice: 'bg-green-100 text-green-800',
            text_answer: 'bg-purple-100 text-purple-800',
            true_false: 'bg-orange-100 text-orange-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const formatQuestionPreview = (question) => {
        switch (question.type) {
            case 'mental_arithmetic':
                return question.question_data?.display_sequence 
                    ? `Calculate: ${question.question_data.display_sequence} = ${question.correct_answer}`
                    : question.question_text;
            
            case 'multiple_choice':
                const optionCount = Object.keys(question.answer_options || {}).length;
                return `${question.question_text} (${optionCount} options)`;
            
            case 'true_false':
                return `${question.question_text} (${question.correct_answer === 'true' ? 'True' : 'False'})`;
            
            case 'text_answer':
                return `${question.question_text} (Answer: ${question.correct_answer})`;
            
            default:
                return question.question_text;
        }
    };

    if (questions.length === 0) {
        return (
            <div className="p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No questions yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Add questions to make this quiz interactive.
                </p>
            </div>
        );
    }

    return (
        <div>
            {questions.length > 1 && (
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <GripVertical className="w-4 h-4" />
                        <span>Drag and drop questions to reorder them</span>
                    </div>
                </div>
            )}
            
            <div className="divide-y divide-gray-200">
                {questions.map((question, index) => {
                const Icon = getQuestionIcon(question.type);
                const isBeingDragged = draggedQuestionId === question.id;
                const isDropTarget = dragOverIndex === index;
                
                return (
                    <div
                        key={question.id}
                        className={`p-6 transition-colors ${
                            isBeingDragged 
                                ? 'opacity-50 bg-gray-100' 
                                : isDropTarget 
                                    ? 'bg-blue-50 border-blue-200' 
                                    : 'hover:bg-gray-50'
                        } ${isDropTarget ? 'border-l-4 border-blue-500' : ''}`}
                        draggable={!isReordering}
                        onDragStart={(e) => handleDragStart(e, question, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        <div className="flex items-start space-x-4">
                            {/* Drag Handle */}
                            <div className={`flex-shrink-0 pt-1 ${isReordering ? 'opacity-50' : 'cursor-move'}`}>
                                <GripVertical className={`w-5 h-5 ${
                                    isReordering ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600'
                                }`} />
                            </div>

                            {/* Question Icon & Order */}
                            <div className="flex-shrink-0">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-600">
                                            {question.order || index + 1}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-indigo-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Question Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
                                        {question.type_display}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {question.points} point{question.points !== 1 ? 's' : ''}
                                    </span>
                                    {question.time_limit && (
                                        <span className="text-sm text-gray-500">
                                            • {question.formatted_time_limit}
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-sm text-gray-900 mb-2">
                                    {formatQuestionPreview(question)}
                                </p>

                                {question.explanation && (
                                    <p className="text-sm text-gray-500">
                                        <span className="font-medium">Explanation:</span> {question.explanation}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0 flex items-center space-x-2">
                                {isReordering && (
                                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span>Reordering...</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => onEdit(question)}
                                    disabled={isReordering}
                                    className={`p-2 rounded-md ${
                                        isReordering 
                                            ? 'text-gray-300 cursor-not-allowed' 
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }`}
                                    title="Edit question"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(question)}
                                    disabled={isReordering}
                                    className={`p-2 rounded-md ${
                                        isReordering 
                                            ? 'text-gray-300 cursor-not-allowed' 
                                            : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                                    }`}
                                    title="Delete question"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
            </div>
        </div>
    );
}