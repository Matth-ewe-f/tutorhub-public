"use client";
import React, { FC, HTMLAttributes, useEffect, useRef, useState } from 'react';
import RatingStars from './RatingStars';
import axios from 'axios';

type Props = {
  review: Review,
  loggedInUserId?: string,
  handleDeleteFunc?: (id: string) => void
} & HTMLAttributes<HTMLDivElement>

const ReviewCard : FC<Props> = (props) => {
  const review = props.review;
  const loggedInUserId = props.loggedInUserId;
  const api = process.env.NEXT_PUBLIC_BACKEND_URL;
  const textRef = useRef<HTMLParagraphElement>(null);

  const [showFull, setShowFull] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const [leftByName, setLeftByName] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const fetchData = async () => {
    const profileEndpoint = `${api}/profiles/${review.reviewerId}`;
    const profileResponse = await axios.get(profileEndpoint);
    const profile = profileResponse.data.data;
    if (profile) {
      setLeftByName(profile.username);
      setAnonymous(props.review.isAnonymous);
    } else {
      setAnonymous(true);
    }

    if (loggedInUserId === review.reviewerId) {
      setShowDeleteButton(true);
    }
  }

  const isTextClamped = (element : Element) => {
    return element.scrollHeight > element.clientHeight;
  }

  useEffect(() => { fetchData() }, [review]);

  useEffect(() => { setIsClamped(isTextClamped(textRef.current)) }, [review])

  const handleDeleteReview = async () => {
    try {
      await axios.delete(`${api}/postReviews/${review._id}`);
      props.handleDeleteFunc(review._id);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  return (
    <div className={`${props.className} px-4 py-3`}>
      <div className='flex md:flex-row flex-col justify-between'>
        <p className='text-xl text-gray-800'>
          {"Review of "}
          <a 
            className='font-bold hover:cursor-pointer hover:underline'
            href={`/post/${review.postType}/${review.postId}`}
          >
            {review.postName}
          </a>
        </p>
        <p className='text-sm mt-0.5 text-gray-800'>
          {showDeleteButton ? 
            <>
              You left this review (
              <button onClick={handleDeleteReview}
              className='underline text-red-500'>
                delete?
              </button>)
            </>
          :
            <>
              {'Left by '}
              {anonymous ?
                <span className='font-bold'>Anonymous</span>
              :
                <>
                  <a className='font-semibold cursor-pointer hover:underline'
                  href={`/profile/${review.reviewerId}`}>
                    {leftByName}
                  </a>
                </>
              }
            </>
          }
        </p>
      </div>
      <RatingStars rating={review.rating} className='mb-2 mt-2 md:mt-0'/>
      <p 
        className={`mt-1 pt-1 md:pt-0 border-t md:border-none
        ${showFull ? '' : 'line-clamp-2'}`} 
        ref={textRef}
      >
        {review.reviewDescription}
      </p>
      {isClamped &&
        <div className='flex justify-center'>
           {showFull ? 
            <button className='mt-1 text-sm text-gray-500 hover:underline' onClick={() => setShowFull(false)}>
              Hide Full Review
            </button>
          :
          <button className='mt-1 text-sm text-gray-500 hover:underline' onClick={() => setShowFull(true)}>
              Show Full Review...
            </button>
          }
        </div>
      
      }
    </div>
  );
}

export default ReviewCard;