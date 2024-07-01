"use client";
import React, { FC, useEffect, useRef, useState } from "react";
import "@/styles/global.css";
import axios from "axios";
import Navbar from "@/components/Navbar"
import Link from 'next/link';
import Loader from "@/components/Loader";
import PostCard from "@/components/PostCard";
import RatingStars from "@/components/RatingStars";
import ReviewCard from "@/components/ReviewCard";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Profile {
  affiliation: string;
  department: string;
  description: string;
  email: string;
  firstName: string;
  graduationYear: string;
  lastName: string;
  posts: string[];
  availability: number[];
}

interface ActivityPost {
  _id: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  activityTitle: string;
  activityDescription: string;
  reviews: Review[],
  imageUrl: string;
  price: number;
  tags: string[];
  __v: number;
}

interface CoursePost {
  _id: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  courseName: string;
  description: string;
  price: number;
  reviews: Review[],
  courseNumber: string;
  courseDepartment: string[];
  gradeReceived: string;
  semesterTaken: string;
  professorTakenWith: string;
  takenAtHopkins: boolean;
  schoolTakenAt: string;
  __v: number;
}

type Post = ActivityPost | CoursePost;

type Review = {
  postId: string,
  postName?: string,
  postType?: string,
  posterId: string,
  reviewerId: string,
  title?: string,
  reviewDescription: string,
  rating: number,
}

const Page : FC = ({ params }: { params : { id: string }}) => {
  const api = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewAvg, setReviewAvg] = useState(5);
  const [imgUrl, setImgUrl] = useState("../defaultimg.jpeg");
  const [visitorId, setVisitorId] = useState('');

  useEffect(() => {
    let ratingTotal = 0;
    reviews.forEach((review) => ratingTotal += review.rating);
    setReviewAvg(ratingTotal / reviews.length);
  }, [reviews])
  
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const fetchData = async () => {
    try {
      if (!user) {
        return;
      }
      const email = user.primaryEmailAddress.toString();
      const mongooseUserIdResponse = await axios.get(`${api}/profiles/getByEmail/${email}`)
      const mongooseUserId = mongooseUserIdResponse.data.data[0]._id;
      const userInfo = await axios.get(`${api}/profiles/${mongooseUserId}`);
      setProfile(userInfo.data.data);
      const profileId = userInfo.data.data._id
      const bookmarksResponse = await axios.get(`${api}/profiles/allBookmarks/${profileId}`);
      const coursePostBookmarkIds = bookmarksResponse.data.data.courseBookmarks
      const activityPostBookmarkIds = bookmarksResponse.data.data.activityBookmarks
      const bookmarks = coursePostBookmarkIds.concat(activityPostBookmarkIds);

      const postsResponse = await axios.get(`${api}/allPosts/`);
      const filteredPosts = postsResponse.data.filter(post => bookmarks.includes(post._id));
      if (filteredPosts.length !== 0) {
        setPosts(filteredPosts);
        let reviews : Review[] = [];
        filteredPosts.forEach((post : Post) => {
            post.reviews.forEach((review) => {
                // @ts-ignore
                review.postName = post.courseName ? post.courseName : post.activityTitle;
                review.postType = 'courseName' in post ? 'course' : 'activity';
                reviews.push(review);
            })
        })
        setReviews(reviews);
        const profileId = userInfo.data.data._id;
        const reviewEndpoint = `${api}/postReviews/getByProfileId/${profileId}`;
        await axios.get(reviewEndpoint);
      }
      if (userInfo.data.data.profilePicKey) {
        // const picUrl = await axios.get(`${api}/profilePics/get/${userInfo.data.data.profilePicKey}`);
        // setImgUrl(picUrl.data.imageUrl);
        const key = userInfo.data.data.profilePicKey;
        const url = `https://tutorhubprofilepics.s3.amazonaws.com/${key}`
        setImgUrl(url);
      }
    } catch (error) {
      console.error('Error fetching posts', error);
    } finally {
      setLoading(false);
    };
  };

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

  /* Somewhat different than handleBookmarkUpdate in other pages due to removal of post from display if unbookmarked */
  const handleBookmarkUpdate = async (bookmark: string, isCourse: boolean) => {
    try {
      const allBookmarks = await axios.get(`${api}/profiles/allBookmarks/${visitorId}`)
      let bookmarkIds;
      if (isCourse) {
        bookmarkIds = new Set(allBookmarks.data.data.courseBookmarks);
      } else {
        bookmarkIds = new Set(allBookmarks.data.data.activityBookmarks);
      }
      if (bookmarkIds.has(bookmark)) {
        await axios.put(`${api}/profiles/deleteBookmark/${visitorId}`, { bookmark: bookmark, isCourse: isCourse });
        
        // Remove the unbookmarked post from the state
        setPosts(prevPosts => prevPosts.filter(post => post._id !== bookmark));
      } else {
        await axios.put(`${api}/profiles/addBookmark/${visitorId}`, { bookmark: bookmark, isCourse: isCourse });
      }
    } catch (error) {
      console.error('Error updating bookmark status:', error);
    }
  };  

  useEffect(() => { getVisitor() }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !profile) return ( <> <Loader /> </>);

  return (
    <>
      <Navbar />
      <div className="bg-blue-300 py-16 px-16">
        <div className="max-w-4xl mx-auto flex items-center">
          <div className="flex-1">
            <div>
              <h1 className="text-2xl font-extrabold font-sans uppercase text-black">
                {profile.firstName} {profile.lastName} - {profile.department}
                {profile.graduationYear ? `, ${profile.graduationYear}` : ''}
              </h1>
              <p className="text-s underline font-light mb-2">{profile.email}</p>
              <p className="text-gray-700 text-base">{profile.description}</p>
            </div>
          </div>
          <div className="flex-none flex items-center">
            <img className="w-24 h-24 rounded-full ml-8 object-cover" src={imgUrl} alt={`${profile.firstName}`} />
          </div>
        </div>
      </div>
      <div className="container px-6 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onUpdateBookmark={handleBookmarkUpdate} />
          ))}
        </div>
      </div>
    </>
  );  
};

export default Page;
