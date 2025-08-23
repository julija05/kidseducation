import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, maxRating = 5, size = 16, className = '', showRating = false, interactive = false, onRatingChange = null }) => {
    const handleStarClick = (star) => {
        if (interactive && onRatingChange) {
            onRatingChange(star);
        }
    };

    return (
        <div className={`flex items-center space-x-1 ${className}`}>
            <div className="flex">
                {[...Array(maxRating)].map((_, index) => {
                    const starNumber = index + 1;
                    const isFilled = starNumber <= rating;
                    const isHalfFilled = rating > index && rating < starNumber;

                    return (
                        <button
                            key={index}
                            type="button"
                            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
                            onClick={() => handleStarClick(starNumber)}
                            disabled={!interactive}
                        >
                            <Star
                                size={size}
                                className={`${
                                    isFilled || isHalfFilled
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                } ${interactive ? 'hover:text-yellow-500' : ''}`}
                            />
                        </button>
                    );
                })}
            </div>
            {showRating && (
                <span className="text-sm text-gray-600 ml-2">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;