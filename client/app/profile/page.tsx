"use client";
import React, { FC, useEffect, useState } from "react";
import axios from 'axios';
import Link from 'next/link'; 
import { useRouter } from "next/navigation";
import "../../styles/global.css";
import { useUser } from '@clerk/clerk-react';
import PostCard from '../../components/PostCard';
import Navbar from "../../components/Navbar"
import Loader from '../../components/Loader';
import RatingStars from "@/components/RatingStars";
import ReviewCard from "@/components/ReviewCard";
import ProfileAnalytics from "@/components/ProfileAnalytics";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Availability from "@/components/Availability";

interface Post {
  _id: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  activityTitle?: string;
  activityDescription?: string;
  courseName?: string;
  description?: string;
  imageUrl?: string;
  price: number;
  courseNumber?: string;
  courseDepartment?: string[];
  gradeReceived?: string;
  semesterTaken?: string;
  professorTakenWith?: string;
  takenAtHopkins?: boolean;
  schoolTakenAt?: string;
  tags?: string[];
  reviews: Review[],
  __v: number;
}

type Review = {
  _id: string,
  postId: string,
  postName?: string,
  postType?: string,
  posterId: string,
  reviewerId: string,
  title?: string,
  reviewDescription: string,
  rating: number,
}

const Page : FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const api = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [posts, setPosts] = useState<Post[]>([]);
  const [bestPosts, setBestPosts] = useState<Post[]>([]);
  const [reviewAvg, setReviewAvg] = useState(5);
  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgUrl, setImgUrl] = useState("../defaultimg.jpeg");
  const [activeSection, setActiveSection] = useState("Posts");
  const reviewSortMethods = [
    "Highest Rating",
    "Lowest Rating"
  ]
  const [reviewSort, setReviewSort] = useState(reviewSortMethods[0]);

  const router = useRouter();

  const fetchData = async () => {
    if (!isLoaded || !isSignedIn) {
      return false;
    }
    try {
      const userInfo = await axios.get(`${api}/profiles/getByEmail/${user.primaryEmailAddress.toString()}`);
      if (userInfo.data.data.length === 0) {
        router.replace('/createAccount');
      }
      setProfileData(userInfo.data.data[0]);
      const posts = await axios.get(`${api}/allPosts/findAllByUserId/${userInfo.data.data[0]._id}`);
      if (posts.data.length !== 0) {
        setPosts(posts.data);
        let reviews : Review[] = [];
        posts.data.forEach((post : Post) => {
          post.reviews.forEach((review) => {
            // @ts-ignore
            review.postName = post.courseName ? post.courseName : post.activityTitle;
            review.postType = 'courseName' in post ? 'course' : 'activity';
            reviews.push(review);
          })
        })
        reviews = sortReviews(reviews);
        setReviews(reviews);
        let sorted : Post[] = posts.data.sort((a : Post, b : Post) => {
          let aValue = 0;
          if (a.reviews.length > 0) {
            a.reviews.forEach((review) => aValue += review.rating);
            aValue /= a.reviews.length;
          }
          let bValue = 0
          if (b.reviews.length > 0) {
            b.reviews.forEach((review) => bValue += review.rating);
            bValue /= b.reviews.length;
          }
          return bValue - aValue;
        })
        let best = sorted.slice(0, Math.min(3, sorted.length));
        best = best.filter((post) => post.reviews.length > 0);
        setBestPosts(best);
      }
      if (userInfo.data.data[0].profilePicKey) {
        const key = userInfo.data.data[0].profilePicKey;
        const url = `https://tutorhubprofilepics.s3.amazonaws.com/${key}`
        setImgUrl(url);
      }
    } catch (error) {
      console.error('Error fetching posts', error);
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    fetchData();
  }, [api, user, isLoaded, isSignedIn]);

  useEffect(() => {
    let ratingTotal = 0;
    reviews.forEach((review) => ratingTotal += review.rating);
    setReviewAvg(ratingTotal / reviews.length);
  }, [reviews])

  const sortReviews = (unsorted : Review[]) => {
    let newReviews = unsorted.slice();
    if (reviewSort === "Lowest Rating") {
      newReviews.sort((a, b) => a.rating - b.rating);
    } else if (reviewSort === "Highest Rating") {
      newReviews.sort((a, b) => b.rating - a.rating);
    }
    return newReviews;
  }

  useEffect(() => { setReviews(sortReviews(reviews)) }, [reviewSort]);

  if (loading || !profileData) {
    return (
      <>
        <Loader />
      </>
    )
  }

  const getTabSection = () => {
    if (activeSection === "Posts") {
      if (posts.length === 0) {
        return <h3 className="mt-8 text-xl">You haven't made any posts yet!</h3>
      }
      return (
        <div 
          className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2
          lg:grid-cols-3 gap-4"
        >
          { posts.map((post) => (
            <PostCard key={post._id} post={post} />
          )) }
        </div>
      )
    } else if (activeSection === "Reviews") {
      if (reviews.length === 0) {
        return <h3 className="mt-8 text-xl">You have no reviews</h3>
      }
      return (
        <div className="flex w-full items-start justify-center">
          <div className="mt-4 mr-8 pt-4 pr-8 min-w-52 h-full border-r border-black"> 
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
          </div>
          <div className="mt-4 flex flex-col justify-center max-w-3xl w-full">
            { reviews.map((review) => (
              <ReviewCard 
                review={review}
                className="mb-4 bg-white rounded-lg shadow-md"
              />
            )) }
          </div>
        </div>
      )
    } else if (activeSection === "Analytics") {
      if (!profileData || !profileData._id) {
        return <></>
      } 
      return <ProfileAnalytics profileId={profileData._id} bestPosts={bestPosts}/>
    } else if (activeSection === "Availability") {
        return (
          <div className="flex flex-col justify-center max-w-3xl w-full">
              <Availability />
          </div>
        )
    }
    else {
      return <></>
    }
  }

  return (
    <>
      <Navbar />
      <div 
        className="flex flex-col md:flex-row justify-evenly items-center
       bg-blue-300 pt-8 pb-6 md:py-16 px-6 md:px-16"
       >
        <div className="hidden md:block flex-1 max-w-xl">
          <h1 className="text-2xl font-extrabold font-sans uppercase text-black">
            {profileData.firstName} {profileData.lastName} - {profileData.department}
            {profileData.graduationYear ? `, ${profileData.graduationYear}` : ''}
          </h1>
          <p className="text-s underline font-light mb-2">{profileData.email}</p>
          <p className="text-gray-700 text-base text-justify">{profileData.description}</p>
        </div>
        <div className="block md:hidden flex-1 max-w-xl">
          <div className="flex justify-center items-center gap-x-1">
            <img
              src={imgUrl}
              alt={`Avatar`}
              className="mr-1 w-12 h-12 rounded-full object-cover"
            />
            <h1 className="text-2xl text-center font-extrabold font-sans uppercase text-black">
              {profileData.firstName} {profileData.lastName}
            </h1>
          </div>
          <p className="text-s text-center font-light mb-2">
            <span className="underline">{profileData.email}</span>
            {" - "}
            {`${profileData.department}${profileData.graduationYear ? `, ${profileData.graduationYear}` : ''}`}
          </p>
          <p className="text-gray-700 text-base text-justify">{profileData.description}</p>
        </div>
        <div className="flex-none flex flex-col items-center">
          <img className="hidden md:block w-48 h-48 object-cover rounded-md" src={imgUrl} alt={`${profileData.firstName}`} />
          { reviews.length > 0 ?
            <RatingStars rating={reviewAvg} starSize={26} numReviews={reviews.length} className="mt-2"/>
          :
            <></>
          }
          <div className="flex mt-2 space-x-4">
            <Link href="/profile/edit" passHref>
              <button className="bg-custom-blue hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md">
                Edit Your Profile
              </button>
            </Link>
            <Link href="/createPost" passHref>
              <button className="bg-custom-blue hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md">
                Create Post
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full bg-blue-300 relative">
        <div className="hidden md:flex ml-8 items-end">
          { ["Posts", "Reviews", "Analytics", "Availability"].map((value, index) => {
            return (
              <button 
                key={`tab-${index}`}
                className={`text-md w-32 mx-1 py-2 rounded-t-lg font-bold 
                transition border-black relative -bottom-2 pb-4
                ${activeSection === value ? 
                  "bg-pageBg border-t border-l border-r z-20" :
                  "hover:-translate-y-2 bg-sky-100"}
                `}
                disabled={activeSection === value}
                onClick={ () => setActiveSection(value) }
              >
                { value }
              </button>
            )
          }) }
        </div>
        <div className="flex md:hidden ml-8 items-end">
          <button 
            className="text-md w-32 mx-1 py-2 rounded-t-lg font-bold 
            transition border-black relative -bottom-2 pb-4
            bg-pageBg border-t border-l border-r z-20"
            disabled={true}
          >
            { activeSection }
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <p 
                className="text-md w-32 mx-1 py-2 rounded-t-lg font-bold 
                transition border-black relative -bottom-2 pb-4 bg-sky-100"
              >
                Others
              </p>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className='bg-sky-100 rounded-xl px-2 py-1.5 border mt-1'
            >
              { ["Posts", "Reviews", "Analytics", "Availability"]
                .filter((value) => value !== activeSection).map((value, index) => {
                return (
                  <DropdownMenuItem 
                    className='p-0 mb-1 hover:cursor-pointer text-lg font-bold
                    rounded-xl overflow-hidden'
                    key={`tab-dropdown-${index}`}
                    onClick={ () => setActiveSection(value) }
                  >
                    <div className='hover:bg-pageBg px-3 py-1 w-full'>
                      {value}
                    </div>
                  </DropdownMenuItem>
                )
              } )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="w-full bg-pageBg absolute h-4 top-[50px] z-30"/>
        <div
          className="relative z-10 border-t border-black bg-pageBg md:px-6 py-8
          flex justify-center"
        >
          { getTabSection() }
        </div>
      </div>
    </>
  );
};

export default Page;
