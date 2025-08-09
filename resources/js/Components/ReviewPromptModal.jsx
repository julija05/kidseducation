import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { X, Star, Send } from "lucide-react";
import StarRating from "@/Components/StarRating";

export default function ReviewPromptModal({ program, onClose, isOpen }) {
    const [reviewData, setReviewData] = useState({
        rating: 5,
        comment: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleRatingChange = (rating) => {
        setReviewData(prev => ({ ...prev, rating }));
    };

    const handleCommentChange = (e) => {
        setReviewData(prev => ({ ...prev, comment: e.target.value }));
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(route('reviews.programs.store', program.slug), reviewData, {
            onSuccess: () => {
                onClose();
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleSkip = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <Star className="text-green-600" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Great Progress! 🎉
                            </h3>
                            <p className="text-sm text-gray-600">
                                You're almost done with the program!
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <div className="text-center">
                        <h4 className="text-lg font-medium text-gray-800 mb-4">
                            How did you like the program so far?
                        </h4>
                        <div className="space-y-3 text-gray-600 text-sm mb-6">
                            <p>• Did you enjoy learning with us? 😊</p>
                            <p>• Would you recommend us to your friends? 👫</p>
                            <p>• How has your experience been with {program.name}?</p>
                        </div>
                        <p className="text-gray-500 text-xs mb-4">
                            Your feedback helps other students decide and helps us improve!
                        </p>
                    </div>

                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Rating
                            </label>
                            <div className="flex items-center justify-center space-x-2">
                                <StarRating 
                                    rating={reviewData.rating} 
                                    size={28} 
                                    interactive={true}
                                    onRatingChange={handleRatingChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Share your thoughts (Optional)
                            </label>
                            <textarea
                                value={reviewData.comment}
                                onChange={handleCommentChange}
                                rows={3}
                                maxLength={500}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Tell us what you enjoyed most, would you recommend us to friends, and how your learning experience has been..."
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">
                                {reviewData.comment.length}/500 characters
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 inline-flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={16} />
                                <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Skip
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}