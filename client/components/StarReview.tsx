import React, { FC } from 'react';
import { Star } from 'lucide-react';

type props = {
  rating: number,
  setRating: (star: number) => void,
  disabled?: boolean
}

const StarRating : FC<props> = ({ rating, setRating, disabled }) => {

  const handleRating = (rate) => {
    if (!disabled) {
      setRating(rate);
    }
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRating(star)}
          className={disabled ? "cursor-default" : "cursor-pointer"}
        >
          {rating >= star ? (
            <Star strokeWidth={1} className='fill-yellow-300'/>
          ) : (
            <Star strokeWidth={1} className='fill-black'/>
          )}
        </button>
      ))}
    </div>
  );
};

export default StarRating;
