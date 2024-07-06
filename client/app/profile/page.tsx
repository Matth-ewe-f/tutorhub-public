"use client";
import React, { FC, useEffect, useState } from "react";
import axios from 'axios';
import Link from 'next/link'; 
import { useRouter } from "next/navigation";
import "../../styles/global.css";
import PostCard from '../../components/PostCard';
import Navbar from "../../components/Navbar"
import Loader from '../../components/Loader';
import RatingStars from "@/components/RatingStars";
import ReviewCard from "@/components/ReviewCard";
import ProfileAnalytics from "@/components/ProfileAnalytics";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Cookies from "universal-cookie";
import PostExpanded from "@/components/PostExpanded";

const Page : FC = (props: any) => {
  const api = process.env.NEXT_PUBLIC_BACKEND_URL;
  const cookies = new Cookies(null, {path: "/"});
  const router = useRouter();
  const sections = ["Posts", "Reviews", "Analytics"];
  const [selectedPost, setSelectedPost] = useState(-1);

  const getDefaultSection = () => {
    let parameter = props.searchParams.section;
    if (!sections.includes(parameter)) {
      return "Posts";
    }
    return parameter === undefined ? "Posts" : parameter;
  }

  const [posts, setPosts] = useState<Post[]>([]);
  const [bestPosts, setBestPosts] = useState<Post[]>([]);
  const [reviewAvg, setReviewAvg] = useState(5);
  const [profile, setProfile] = useState<Profile>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgUrl, setImgUrl] = useState("../defaultimg.jpeg");
  const [activeSection, setActiveSection] = useState(getDefaultSection());
  const reviewSortMethods = [
    "Highest Rating",
    "Lowest Rating"
  ]
  const [reviewSort, setReviewSort] = useState(reviewSortMethods[0]);

  const fetchData = async () => {
    try {
      const username = cookies.get("tutorhub-public-username");
      const userInfo = await axios.get(`${api}/profiles/getByUsername/${username}`);
      if (userInfo.data.data.length === 0) {
        router.replace('/signIn');
      }
      setProfile(userInfo.data.data[0]);
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
        const url = `https://tutorhub-public.s3.amazonaws.com/${key}`
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
  }, []);

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

  if (loading || !profile) {
    return (
      <>
        <Loader />
      </>
    )
  }

  const getTabSection = () => {
    if (activeSection === "Reviews") {
      if (reviews.length === 0) {
        return <h3 className="mt-8 text-xl font-light">You have no reviews</h3>
      }
      return (
        <div className="mx-4 flex flex-col sm:flex-row w-full items-start justify-center">
          <div className="mt-4 mr-8 pt-4 pr-8 min-w-52 h-full sm:border-r border-black"> 
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
      if (!profile || !profile._id) {
        return <></>
      } 
      return <ProfileAnalytics profileId={profile._id} bestPosts={bestPosts}/>
    } else {
      if (posts.length === 0) {
        return <h3 className="mt-8 text-xl font-light">You haven't made any posts yet!</h3>
      }
      return (
        <div 
          className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2
          lg:grid-cols-3 gap-4"
        >
          { posts.map((post, index) => (
            <PostCard 
              key={post._id}
              post={post}
              className="max-w-sm"
              clickFunc={() => setSelectedPost(index)}
            />
          )) }
        </div>
      )
    }
  }

  const getBiography = () => {
    if (profile.description) {
      return profile.description;
    } else {
      return `${profile.username} hasn't entered a biography yet, but they're definitely a cool person who you should sign up for tutoring sessions with!`
    }
  }

  return (
    <>
      <Navbar profile={profile}/>
      {selectedPost >= 0 && selectedPost < posts.length &&
        <PostExpanded post={posts[selectedPost]} userId={profile._id}
        closeFunc={() => setSelectedPost(-1)}/>
      }
      <div 
        className="flex flex-col md:flex-row justify-evenly items-center
       bg-blue-300 pt-24 pb-6 md:pt-28 md:pb-12 px-6 md:px-16"
       >
        <div className="hidden md:block flex-1 max-w-xl">
          <h1 className="text-2xl font-extrabold font-sans uppercase text-black">
            {profile.username}
            {profile.username !== "Admin" && profile.username != "Guest" &&
              ` - ${profile.department}` +
              (profile.graduationYear ? `, ${profile.graduationYear}` : '')
            }
          </h1>
          <p className="mr-8 font-light text-base text-justify">{getBiography()}</p>
        </div>
        <div className="block md:hidden flex-1 max-w-xl">
          <div className="flex justify-center items-center gap-x-1 mb-2">
            <img
              src={imgUrl}
              alt={`Avatar`}
              className="mr-2 w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h1 className="my-0 text-2xl text-center font-extrabold font-sans uppercase text-black">
                {profile.username}
              </h1>
              { profile.username !== "Admin" && profile.username != "Guest" &&
                <p className="text-s text-center uppercase font-light -mt-1">
                  {`${profile.department}${profile.graduationYear ? `, ${profile.graduationYear}` : ''}`}
                </p>
              }
            </div>
          </div>
          <p className="font-light text-base text-justify">{getBiography()}</p>
        </div>
        <div className="flex-none flex flex-col items-center">
          <img className="hidden md:block w-48 h-48 object-cover rounded-md" src={imgUrl} alt={`${profile.username}`} />
          { reviews.length > 0 ?
            <RatingStars rating={reviewAvg} starSize={26} numReviews={reviews.length} className="mt-2"/>
          :
            <></>
          }
          <div className="flex mt-2 space-x-4">
            <Link href="/profile/edit" passHref className="relative">
              <button 
                className={`bg-custom-blue text-white ` +
                `font-bold py-2 px-4 rounded-md group ` +
                (profile.username === "Admin" || profile.username === "Guest"
                  ? `line-through cursor-default active:pointer-events-none`
                  : `hover:bg-blue-900`
                )}
              >
                Edit Your Profile
                {(profile.username === "Admin" || profile.username === "Guest") &&
                  <div className='hidden group-hover:flex absolute top-8 left-0 right-0 justify-center'>
                    <span className="z-50 inline-block px-2 py-1 bg-gray-700
                    border-white border rounded-md text-sm text-gray-200
                    font-bold text-center">
                      Disabled for <br/> {profile.username}s
                    </span>
                  </div>
                }
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full bg-blue-300 relative">
        <div className="hidden md:flex ml-8 items-end">
          { sections.map((value, index) => {
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
              { sections
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
          className="relative z-10 border-t border-black bg-pageBg md:px-6
          py-8 flex justify-center"
        >
          { getTabSection() }
        </div>
      </div>
    </>
  );
};

export default Page;
