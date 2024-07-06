"use client";
import React, { FC, useEffect, useRef, useState } from "react";
import "@/styles/global.css";
import axios from "axios";
import Navbar from "@/components/Navbar"
import Loader from "@/components/Loader";
import PostCard from "@/components/PostCard";
import RatingStars from "@/components/RatingStars";
import ReviewCard from "@/components/ReviewCard";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Cookies from "universal-cookie";

const Page : FC = ({ params }: { params : { id: string }}) => {
  const api = process.env.NEXT_PUBLIC_BACKEND_URL;
  const cookies = new Cookies(null, {path: "/"});
  const [loading, setLoading] = useState(true);
  const [profileData, setProfile] = useState<Profile>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewAvg, setReviewAvg] = useState(5);
  const [imgUrl, setImgUrl] = useState("../defaultimg.jpeg");
  const [activeSection, setActiveSection] = useState("Posts");
  const [timeSpent, setTimeSpent] = useState(0);
  const [onPage, setOnPage] = useState(true);
  const [visitorId, setVisitorId] = useState('');
  const [visitorData, setVisitorData] = useState<Profile>();
  const [deletedReviews, setDeletedReviews] = useState([]);

  const reviewSortMethods = [
    "Highest Rating",
    "Lowest Rating"
  ]
  const [reviewSort, setReviewSort] = useState(reviewSortMethods[0]);

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
  
  const timeSpentRef = useRef<Number>();
  useEffect(() => {
    timeSpentRef.current = timeSpent;
  }, [timeSpent]);

  const visitorIdRef = useRef<string>();
  useEffect(() => {
    visitorIdRef.current = visitorId;
  }, [visitorId])

  useEffect(() => {
    let ratingTotal = 0;
    reviews.forEach((review) => ratingTotal += review.rating);
    setReviewAvg(ratingTotal / reviews.length);
  }, [reviews])
  
  const router = useRouter();

  const fetchData = async () => {
    let userInfo : {data: {data: Profile}};
    try {
      userInfo = await axios.get(`${api}/profiles/${params.id}`);
    } catch (err) {
      router.replace("/profiles");
      return;
    }
    setProfile(userInfo.data.data);
    if (userInfo.data.data.profilePicKey) {
      const key = userInfo.data.data.profilePicKey;
      const url = `https://tutorhub-public.s3.amazonaws.com/${key}`;
      setImgUrl(url);
    }
    let posts : {data: Post[]};
    try {
      posts = await axios.get(`${api}/allPosts/findAllByUserId/${userInfo.data.data._id}`);
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
      }
    } catch (err) {
      console.error(err);
    }
    try {
      const username = cookies.get("tutorhub-public-username");
      const url = `${api}/profiles/getByUsername/${username}`;
      const response = await axios.get(url);
      if (response.data.data.length == 0) {
        router.replace('signIn');
        return;
      } else {
        setVisitorData(response.data.data[0]);
        const id = response.data.data[0]._id;
        setVisitorId(id);
        if (id === params.id) {
          router.replace('profile');
          return;
        }
      }
    } catch (error) {
      console.error(error);
    }
    // const profileId = userInfo.data.data._id;
    // const reviewEndpoint = `${api}/postReviews/getByProfileId/${profileId}`;
    // const reviewResponse = await axios.get(reviewEndpoint);
    setLoading(false);
  };

  const updateProfileViewsAsync = async () => {
    if (visitorIdRef.current === '' || visitorId === params.id) {
      return;
    }
    const endpoint = `${api}/profiles/views/${params.id}`;
    const body = { 
      viewerId: visitorIdRef.current,
      timestamp: new Date(),
      duration: timeSpentRef.current
    };
    await axios.put(endpoint, body);
    return;
  }

  const updateProfileViews = () => {
    if (visitorIdRef.current === '' || visitorId === params.id) {
      return;
    }
    const endpoint = `${api}/profiles/views/${params.id}`;
    const body = { 
      viewerId: visitorIdRef.current,
      timestamp: new Date(),
      duration: timeSpentRef.current
    };
    axios.put(endpoint, body);
    return;
  }

  const handleClickReportUser = () => {
    router.push(`/profile/report/${params.id}`);
  }

  useEffect(() => {
    fetchData();
    window.addEventListener("blur", () => setOnPage(false));
    window.addEventListener("focus", () => setOnPage(true));
    window.addEventListener("beforeunload", updateProfileViewsAsync);
    return () => {
      window.removeEventListener("blur", () => setOnPage(false));
      window.removeEventListener("focus", () => setOnPage(true));
      window.removeEventListener("beforeunload", updateProfileViewsAsync);
    }
  }, []);

  const handleReviewDeletion = (id) => {
    setDeletedReviews([...deletedReviews, id]);
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (onPage) {
        setTimeSpent(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [onPage]);

  useEffect(() => updateProfileViews, []);

  if (loading) return ( <> <Loader /> </>);

  const getTabSection = () => {
    if (activeSection === "Posts") {
      if (posts.length === 0) {
        return <h3 className="mt-8 text-xl">This user hasn't made any posts yet!</h3>
      }
      return (
        <div 
          className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2
          lg:grid-cols-3 gap-4"
        >
          { posts.map((post) => (
            <PostCard key={post._id} post={post}/>
          )) }
        </div>
      )
    } else if (activeSection === "Reviews") {
      return (
        reviews.length === 0 ?
          <h3 className="mt-8 text-xl">No reviews on this profile</h3>
        :
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
                className={`mb-4 bg-white rounded-lg shadow-md
                ${deletedReviews.includes(review._id) && "hidden"}`}
                loggedInUserId={visitorId}
                handleDeleteFunc={handleReviewDeletion}
              />
            )) }
          </div>
        </div>
      )
    }
  }

  const getBiography = () => {
    if (profileData.description) {
      return profileData.description;
    } else {
      return `${profileData.username} hasn't entered a biography yet, but they're definitely a cool person who you should sign up for tutoring sessions with!`
    }
  }

  return (
    <>
      <Navbar profile={visitorData}/>
      <div 
        className="flex flex-col md:flex-row justify-evenly items-center bg-blue-300
        pt-24 pb-6 md:pt-28 md:pb-12 px-6 md:px-16"
      >
        <div className="hidden md:block flex-1 max-w-xl">
          <h1 className="text-2xl font-extrabold font-sans uppercase text-black">
            {profileData.username} - {profileData.department}
            {profileData.graduationYear ? `, ${profileData.graduationYear}` : ''}
          </h1>
          <p className="mr-8 font-light text-base text-justify">{getBiography()}</p>
        </div>
        <div className="block md:hidden flex-1 max-w-xl">
          <div className="flex mb-2 justify-center items-center gap-x-1">
            <img
              src={imgUrl}
              alt={`Avatar`}
              className="mr-2 w-12 h-12 rounded-full"
            />
            <div>
              <h1 className="my-0 text-2xl text-center font-extrabold font-sans uppercase text-black">
                {profileData.username}
              </h1>
              <p className="text-s text-center uppercase font-light -mt-1">
                {`${profileData.department}${profileData.graduationYear ? `, ${profileData.graduationYear}` : ''}`}
              </p>
            </div>
          </div>
          <p className="font-light text-base text-justify">{getBiography()}</p>
        </div>
        <div className="flex flex-col items-center gap-y-2 mt-2 gap-x-4">
          <img className="hidden md:block w-48 h-48 object-cover rounded-md" src={imgUrl} alt={`${profileData.username}`} />
          <div className="flex gap-x-4">
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md" onClick={() => handleClickReportUser()}>
              Report this user
            </button>
          </div>
        </div>
      </div>
      <div className="w-full bg-blue-300 relative">
      <div className="flex ml-8 items-end">
        { ["Posts", "Reviews"].map((value, index) => {
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
