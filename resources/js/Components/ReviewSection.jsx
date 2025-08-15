import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { MessageSquare, Star, Plus, Edit, Trash2, Send } from "lucide-react";
import StarRating from "@/Components/StarRating";
import ReviewCard from "@/Components/ReviewCard";
import { useAvatar } from "@/hooks/useAvatar.jsx";

export default function ReviewSection({ enrolledProgram, program, userReview, canReview }) {
    const { avatarData } = useAvatar();
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        comment: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                setShowReviewForm(false);
                setReviewData({ rating: 5, comment: '' });
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleCancelReview = () => {
        setShowReviewForm(false);
        setReviewData({ rating: 5, comment: '' });
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
                <MessageSquare className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">
                    Program Review
                </h3>
            </div>

            {userReview ? (
                // User has already submitted a review
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Your Review</h4>
                        <ReviewCard 
                            review={{...userReview, is_current_user: true}} 
                            showUserName={false} 
                            currentUserAvatar={avatarData}
                        />
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('reviews.edit', userReview.id)}
                            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit size={16} />
                            <span>Edit Review</span>
                        </Link>
                        <Link
                            href={route('reviews.destroy', userReview.id)}
                            method="delete"
                            className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            data-confirm="Are you sure you want to delete your review?"
                        >
                            <Trash2 size={16} />
                            <span>Delete Review</span>
                        </Link>
                    </div>
                </div>
            ) : showReviewForm ? (
                // Review form
                <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Rating
                        </label>
                        <div className="flex items-center space-x-2">
                            <StarRating 
                                rating={reviewData.rating} 
                                size={24} 
                                interactive={true}
                                onRatingChange={handleRatingChange}
                            />
                            <span className="text-sm text-gray-600">
                                ({reviewData.rating} star{reviewData.rating !== 1 ? 's' : ''})
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Comments (Optional)
                        </label>
                        <textarea
                            value={reviewData.comment}
                            onChange={handleCommentChange}
                            rows={4}
                            maxLength={1000}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Share your experience with this program..."
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">
                            {reviewData.comment.length}/1000 characters
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={16} />
                            <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelReview}
                            className="inline-flex items-center space-x-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : canReview ? (
                // Show option to write a review
                <div className="text-center py-8">
                    <Star className="mx-auto text-yellow-400 mb-4" size={48} />
                    <h4 className="text-lg font-medium text-gray-800 mb-2">
                        Share Your Experience
                    </h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Help other students by writing a review about {enrolledProgram.name}. 
                        Your feedback is valuable to our community.
                    </p>
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus size={18} />
                        <span>Write a Review</span>
                    </button>
                </div>
            ) : (
                // User is not eligible to write a review yet
                <div className="text-center py-8">
                    <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">
                        Complete the Program to Review
                    </h4>
                    <p className="text-gray-500">
                        You'll be able to write a review once you complete more lessons in this program.
                    </p>
                </div>
            )}
        </div>
    );
}