import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StarRating from '@/Components/StarRating';
import { ArrowLeft, Star } from 'lucide-react';

export default function CreateReview({ program }) {
    const [selectedRating, setSelectedRating] = useState(0);
    
    const { data, setData, post, processing, errors } = useForm({
        rating: 0,
        comment: '',
    });

    const handleRatingChange = (rating) => {
        setSelectedRating(rating);
        setData('rating', rating);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('reviews.programs.store', program.slug));
    };

    const getRatingDescription = (rating) => {
        const descriptions = {
            1: 'Poor - Not satisfied with the program',
            2: 'Fair - Below expectations',
            3: 'Good - Meets expectations',
            4: 'Very Good - Exceeds expectations',
            5: 'Excellent - Outstanding program!'
        };
        return descriptions[rating] || 'Select a rating';
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Write Review - ${program.name}`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <Link 
                            href={route('programs.show', program.slug)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back to Program
                        </Link>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Write a Review
                    </h1>
                    <p className="text-gray-600">
                        Share your experience with <strong>{program.name}</strong>
                    </p>
                </div>

                {/* Review Form */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Rating Section */}
                        <div>
                            <label className="block text-lg font-medium text-gray-900 mb-4">
                                How would you rate this program?
                            </label>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-center py-6">
                                    <StarRating 
                                        rating={selectedRating}
                                        size={40}
                                        interactive={true}
                                        onRatingChange={handleRatingChange}
                                        className="space-x-2"
                                    />
                                </div>
                                
                                {selectedRating > 0 && (
                                    <div className="text-center">
                                        <p className="text-lg font-medium text-gray-800">
                                            {getRatingDescription(selectedRating)}
                                        </p>
                                    </div>
                                )}
                                
                                {errors.rating && (
                                    <p className="text-red-600 text-sm text-center">
                                        {errors.rating}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Comment Section */}
                        <div>
                            <label 
                                htmlFor="comment" 
                                className="block text-lg font-medium text-gray-900 mb-2"
                            >
                                Tell us about your experience (Optional)
                            </label>
                            <p className="text-sm text-gray-600 mb-4">
                                What did you like most? What could be improved? Your feedback helps other students and helps us improve our programs.
                            </p>
                            
                            <textarea
                                id="comment"
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Share your thoughts about the program..."
                                value={data.comment}
                                onChange={(e) => setData('comment', e.target.value)}
                            />
                            
                            <div className="flex justify-between items-center mt-2">
                                <div className="text-sm text-gray-500">
                                    {data.comment.length}/1000 characters
                                </div>
                                {errors.comment && (
                                    <p className="text-red-600 text-sm">
                                        {errors.comment}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Link
                                href={route('programs.show', program.slug)}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            
                            <button
                                type="submit"
                                disabled={processing || selectedRating === 0}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Star size={18} />
                                        <span>Submit Review</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Guidelines */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-medium text-blue-900 mb-3">Review Guidelines</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Be honest and constructive in your feedback</li>
                        <li>• Focus on your personal experience with the program</li>
                        <li>• Avoid personal attacks or inappropriate language</li>
                        <li>• Help other students make informed decisions</li>
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}