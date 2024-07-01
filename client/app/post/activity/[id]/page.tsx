"use client";
import "@/styles/global.css";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { FC, useEffect, useRef, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import RatingStars from "@/components/RatingStars";
import Link from "next/link";
import StarReview from "@/components/StarReview";
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, Heading1, SpadeIcon } from "lucide-react";
import { useUser } from '@clerk/clerk-react';
import ReviewCard from "@/components/ReviewCard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import PostAnalytics  from "@/components/PostAnalytics";
import { useRouter } from "next/navigation";
import { set } from "cypress/types/lodash";

type activityPostType = {
  _id? : string,
  userId? : string,
  activityTitle? : string,
  activityDescription? : string,
  price? : number,
  tags? : string[],
}

type userType = {
  firstName? : string,
  lastName? : string,
  description? : string,
}

type review = {
  _id: string,
  postId: string,
  postName?: string,
  postType?: string,
  posterId: string,
  reviewerId: string,
  title?: string,
  isAnonymous?: boolean,
  reviewDescription: string,
  rating: number,
}

const Page : FC = ({ params }: { params : { id: string, type: string }}) => {
	const api : string = process.env.NEXT_PUBLIC_BACKEND_URL;
  const postId = params.id;
  const postType = "activityPosts"

  const [post, setPost] = useState<activityPostType>({});
  const [poster, setPoster] = useState<userType>({});
  // const [imgUrl, setImgUrl] = useState("/jhulogo.jpeg");
  const [loadedPost, setLoadedPost] = useState(false);
  // const [profilePic, setProfilePic] = useState("/defaultimg.jpeg");

  const [posterId, setPosterId] = useState('');
  const [reviewerId, setReviewerId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [reviews, setReviews] = useState<review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  const [visitorId, setVisitorId] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [onPage, setOnPage] = useState(true);
  const [showEditButton, setShowEditButton] = useState(false);
  const [postDeleted, setPostDeleted] = useState(false);
  const postDeletedRef = useRef(postDeleted);

  useEffect(() => {
    postDeletedRef.current = postDeleted;
  }, [postDeleted]);
  
  const timeSpentRef = useRef<Number>();
  useEffect(() => {
    timeSpentRef.current = timeSpent;
  }, [timeSpent]);

  const visitorIdRef = useRef<string>();
  useEffect(() => {
    visitorIdRef.current = visitorId;
  }, [visitorId])

  const getVisitor = async () => {
    if (!isLoaded || !isSignedIn || !user) {
      return;
    }
    try {
      const response = await axios.get(`${api}/profiles/getByEmail/${user.primaryEmailAddress.toString()}`);
      const id = response.data.data[0]._id;
      setVisitorId(id);
      if (id === params.id) {
        router.replace('profile');
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => { getVisitor() }, [isLoaded, isSignedIn, user]);

  const updatePostViewsAsync = async () => {
    if (visitorIdRef.current === '' || visitorIdRef.current === posterId || postDeletedRef.current) {
      return;
    }
    const endpoint = `${api}/${postType}/views/${postId}`;
    const body = { 
      viewerId: visitorIdRef.current,
      timestamp: new Date(),
      duration: timeSpentRef.current
    };
    const response = await axios.put(endpoint, body);
    return;
  }

  const updatePostViews = () => {
    if (visitorIdRef.current === '' || visitorIdRef.current === posterId || postDeletedRef.current) {
      return;
    }
    const endpoint = `${api}/${postType}/views/${postId}`;
    const body = { 
      viewerId: visitorIdRef.current,
      timestamp: new Date(),
      duration: timeSpentRef.current
    };
    const response = axios.put(endpoint, body);
    return;
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (onPage) {
        setTimeSpent(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [onPage]);


  const reviewSortMethods = [
    "Highest Rating",
    "Lowest Rating"
  ]
  const [reviewSort, setReviewSort] = useState(reviewSortMethods[0]);

  const loadReviews = async () => {
    try {
        const response = await axios.get(`${api}/postReviews/getByPostId/${postId}`);
        let fetchedReviews = response.data.reviews;

            let sumOfRatings = 0;
            const numberOfReviews = fetchedReviews.length;
            setReviewCount(numberOfReviews);

            if (numberOfReviews > 0) {
                for (let i = 0; i < numberOfReviews; i++) {
                    sumOfRatings += fetchedReviews[i].rating;
                }
                setAverageRating(sumOfRatings / numberOfReviews);
            }
            fetchedReviews.forEach((review) => {
              // @ts-ignore
              review.postName = post.activityTitle;
              review.postType = 'activity';
            });
            fetchedReviews = sortReviews(fetchedReviews);
            setReviews(fetchedReviews); // Set reviews state at the end
        } catch (error) {
        console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    if (postId && post.activityTitle) {
        loadReviews();
    }
  }, [postId, post]);


  const loadOldPost = async () => {
    if (!isLoaded || !isSignedIn) {
      return false;
    }
    const userInfo = await axios.get(`${api}/profiles/getByEmail/${user.primaryEmailAddress.toString()}`);
    setReviewerId(userInfo.data.data[0]._id);

    const response = await axios.get(`${api}/${postType}/findOne/${postId}`);
    setPost(response.data.post);

    const imgKey = response.data.post.coursePostPicKey;
    const profile = await axios.get(`${api}/profiles/${response.data.post.userId}`)
    setPoster(profile.data.data);
    setPosterId(response.data.post.userId);
    if (userInfo.data.data[0]._id === response.data.post.userId) {
      setShowEditButton(true);
    }
    setLoadedPost(true);
  }

  const sortReviews = (unsorted : review[]) => {
    let newReviews = unsorted.slice();
    if (reviewSort === "Lowest Rating") {
      newReviews.sort((a, b) => a.rating - b.rating);
    } else if (reviewSort === "Highest Rating") {
      newReviews.sort((a, b) => b.rating - a.rating);
    }
    return newReviews;
  }

  useEffect(() => { setReviews(sortReviews(reviews)) }, [reviewSort]);

  useEffect(() => { loadOldPost() }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    setIsButtonDisabled(posterId === reviewerId);
  }, [posterId, reviewerId]);

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleCheckedChange = () => {
    setIsAnonymous(!isAnonymous);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${api}/postReviews/${postId}`, {
        postId,
        posterId,
        reviewerId: reviewerId,
        reviewDescription: comment,
        rating,
        isAnonymous: isAnonymous
      });
      const newReview = response.data.review;
      newReview.postName = post.activityTitle;
      setReviews(prevReviews => [...prevReviews, newReview]);
      setAverageRating((averageRating * reviewCount + rating) / (reviewCount + 1));
      setReviewCount(reviewCount + 1);
      setRating(0);
      setComment('');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  useEffect(() => updatePostViews, [])

  useEffect(() => {
    window.addEventListener("blur", () => setOnPage(false));
    window.addEventListener("focus", () => setOnPage(true));
    window.addEventListener("beforeunload", updatePostViewsAsync);
    return () => {
      window.removeEventListener("blur", () => setOnPage(false));
      window.removeEventListener("focus", () => setOnPage(true));
      window.removeEventListener("beforeunload", updatePostViewsAsync);
    }
  }, []);

  const deletePost = async () => {
    try {
      setPostDeleted(true); 
      await axios.delete(`${api}/activityposts/${postId}`);
      alert('Post deleted successfully');
      router.push('/profile');      
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (!loadedPost) {
    return <></>;
  }

  return <>
    <Navbar/>
    <div className="flex flex-col min-h-screen lg:flex-row">
      <div className="flex flex-col w-full px-4 lg:w-2/3 my-14 lg:border-r lg:border-black">
        <div className="pb-10 border-b border-black intro">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">TutorHub</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/browse">Browse</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">{post.activityTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="pt-2 mt-0 mb-1 font-sans text-5xl font-extrabold leading-none uppercase text-slate-800">{post.activityTitle}</h1>
          <h3 className="w-full mb-3 text-xs font-medium leading-tight tracking-wide capitalize text-slate-700">${post.price} / hour</h3>
          <div className="flex items-center justify-between space-x-2">
          {/* <img
            src={profilePic}
            alt={`Avatar`}
            className="w-10 h-10 rounded-full"
          /> */}
          <div className="flex flex-col justify-center flex-grow">
            <span className="text-sm font-semibold">by {poster.firstName} {poster.lastName} - Tutor Hub</span>
            <span className="text-xs text-gray-500">published Mar 30, 2024</span>
          </div>
          <div className="flex flex-col items-end">
            <RatingStars rating={averageRating} starSize={20} />
            <span className="text-sm">
              {averageRating.toFixed(1)} from {reviewCount} reviews
            </span>
          </div>
        </div>
        { showEditButton ? 
          <div className="flex justify-between mt-4">
            <Button className="bg-blue-300 text-color-black hover:bg-blue-500">
              <Link href={`/editPost/activity/${post._id}`}>
                Edit Post
              </Link>
            </Button>
            <Button className="bg-red-500" onClick={deletePost}>
                Delete Post
            </Button>
          </div>
          : 
          <></>
        }
      </div>
      <p className="py-8">{post.activityDescription}</p>
      <div className="flex flex-row gap-x-4 mb-4">
        { reviews.length === 0 ? 
          <h1 className="text-xl font-bold">No Reviews</h1>
        :
          <h1 className="font-sans font-extrabold uppercase text-3xl leading-none mt-0 mb-1 text-slate-800 py-2">Reviews</h1>
        }
        { reviews.length === 0 ? "" :
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div 
                className='px-4 py-2 text-md text-white font-bold bg-custom-blue
                hover:bg-blue-900 rounded-lg flex'
              >
                {reviewSort} <ChevronDown/>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className='bg-blue-300 rounded-xl px-2 py-1.5 border mt-1'
            >
              {
                reviewSortMethods.map((method) => {
                  return (
                    <DropdownMenuItem 
                      key={`sort-${method}`}
                      className='p-0 mb-1 hover:cursor-pointer text-lg font-bold
                      rounded-xl overflow-hidden'
                      onClick={ () => setReviewSort(method) }
                    >
                      <div className='hover:bg-sky-100 px-3 py-1 w-full'>
                        {method}
                      </div>
                    </DropdownMenuItem>
                  );
                })
              }
            </DropdownMenuContent>
          </DropdownMenu>
        }
      </div>
      <div className="flex flex-col justify-center max-w-3xl">
        { reviews.map((review, index) => (
          <ReviewCard 
            key={`review-${index}`}
            review={review}
            loggedInUserId={reviewerId}
            className="mb-4 bg-white rounded-lg shadow-md"
          />
        )) }
      </div>
      <div className="flex flex-row gap-x-4 mb-4">
        { visitorId == posterId ?
          <PostAnalytics postId={postId} postType={postType}/>
        :
          <></>
        }
      </div>
    </div>
      <div className="flex flex-col items-center w-full px-4 lg:w-1/3 lg:my-10">
        <div className="w-full px-4">
          <div className="p-4 mb-6 border-2 border-black info-box lg:mt-10 md:w-2/3" style={{
            boxShadow: '5px 5px 0px rgba(0, 0, 0, 10)',
          }}>
          <h1 className="inline-block p-1 mb-2 font-sans text-lg font-extrabold text-black uppercase bg-blue-300">
            About {poster.firstName} {poster.lastName}
          </h1>
          <p className="mb-4 text-black line-clamp-4 overflow-ellipsis">
            {poster.description}
          </p>
          <Link href={`/profile/` + post.userId}  className="px-4 py-2 mt-4 text-sm text-white uppercase bg-black">
            Learn More
          </Link>
          </div>
          <div className="w-full review-content">
            <h1 className="self-start pt-2 mt-0 mb-1 font-sans text-3xl font-extrabold leading-none uppercase text-slate-800">
              leave a review
            </h1>
            <p>Required fields are marked *</p>
            <h2 className="self-start pt-2 mt-2 mb-0 font-sans font-extrabold leading-none uppercase text-l text-slate-700">tutor rating *</h2>
            <div className="flex py-1 ">
              <StarReview rating={rating} setRating={setRating} />
            </div>
            <h2 className="self-start pt-2 mt-2 mb-0 font-sans font-extrabold leading-none uppercase text-l text-slate-700">Comment *</h2>
            <Textarea className="my-2 rounded resize-none" onChange={handleCommentChange}/>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={isAnonymous} onCheckedChange={handleCheckedChange}/>
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none capitalize peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                make my response anonymous
              </label>
            </div>
            <button 
              onClick={handleSubmit} disabled={isButtonDisabled}
              className={`uppercase info-box max-w p-4 border-2 border-black mt-4 mb-6 font-md font-bold ${isButtonDisabled ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-blue-300 text-black'}`} style={{
                boxShadow: '2px 2px 0px rgba(0, 0, 0, 10)',
              }}>
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  </>;
}

export default Page;