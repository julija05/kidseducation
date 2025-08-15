import React from 'react';
import StarRating from './StarRating';
import { User } from 'lucide-react';

const ReviewCard = ({ review, showUserName = true, currentUserAvatar = null }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {review.user_avatar && review.user_avatar.type === 'emoji' ? (
                            <span className="text-lg">{review.user_avatar.value}</span>
                        ) : currentUserAvatar && currentUserAvatar.type === 'emoji' && review.is_current_user ? (
                            <span className="text-lg">{currentUserAvatar.value}</span>
                        ) : (
                            <span className="text-sm font-bold text-blue-600">
                                {review.user_name ? review.user_name.charAt(0).toUpperCase() : '👤'}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            {showUserName && (
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                    {review.user_name}
                                </p>
                            )}
                            <StarRating rating={review.rating} size={16} />
                        </div>
                        <p className="text-xs text-gray-500">
                            {formatDate(review.created_at)}
                        </p>
                    </div>
                    
                    {review.comment && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                            "{review.comment}"
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;