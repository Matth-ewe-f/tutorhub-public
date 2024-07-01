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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import CompareAvailability from "@/components/CompareAvailability";
import SendBird from 'sendbird';


const APP_ID = process.env.NEXT_PUBLIC_SEND_BIRD_APP_ID;
const sb = new SendBird({ appId: APP_ID });

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

const Page : FC = ({ params }: { params : { id: string }}) => {
  const api = process.env.NEXT_PUBLIC_BACKEND_URL;
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
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [visitorSendBirdId, setVisitorSendBirdId] = useState('');
  const [visiteeSendBirdId, setVisiteeSendBirdId] = useState('');

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
      } else {
        await axios.put(`${api}/profiles/addBookmark/${visitorId}`, { bookmark: bookmark, isCourse: isCourse });
      } 
    } catch (error) {
      console.error('Error updating bookmark status:', error);
    }
  };
  const [availability, setAvailability] = useState(new Array(336).fill(0));

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
  
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const compareAvail = async () => {
    try {
      const userInfo = await axios.get(`${api}/profiles/${params.id}`);
      const profileAvail = userInfo.data.data.availability;
      const pa = new Array(336).fill(0);
      profileAvail.forEach(index => pa[index] = 1);
      setAvailability(pa);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  useEffect(() => {
    compareAvail();
  }, []);

  const fetchData = async () => {
    try {
      const userInfo = await axios.get(`${api}/profiles/${params.id}`);
      setProfile(userInfo.data.data);
      const visiteeEmail = userInfo.data.data.email;
      const atIndex = visiteeEmail.indexOf('@');
      if (atIndex !== -1 && visiteeEmail.endsWith('@jhu.edu')) {
        setVisiteeSendBirdId(visiteeEmail.substring(0, atIndex));
      } else {
        console.error('Invalid email format');
      }

      const posts = await axios.get(`${api}/allPosts/findAllByUserId/${userInfo.data.data._id}`);
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
      if (userInfo.data.data.profilePicKey) {
        const key = userInfo.data.data.profilePicKey;
        const url = `https://tutorhubprofilepics.s3.amazonaws.com/${key}`;
        setImgUrl(url);
        // const picUrl = await axios.get(`${api}/profilePics/get/${userInfo.data.data.profilePicKey}`);
        // setImgUrl(picUrl.data.imageUrl);
      }
      const profileId = userInfo.data.data._id;
      const reviewEndpoint = `${api}/postReviews/getByProfileId/${profileId}`;
      const reviewResponse = await axios.get(reviewEndpoint);
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
      if (user && user.primaryEmailAddress) {
        const email = user.primaryEmailAddress.toString();
        const atIndex = email.indexOf('@');
        if (atIndex !== -1 && email.endsWith('@jhu.edu')) {
          setVisitorSendBirdId(email.substring(0, atIndex));
        } else {
          console.error('Invalid email format');
        }
      } else {
        console.error('Email address not available');
      }

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

  const handleSendMessage = async () => {
    console.log('current user sendbird id:', visitorSendBirdId);
    await sb.connect(visitorSendBirdId, (user, error) => {
      if (error) {
        console.error('SendBird connection error:', error);
      } else {
        console.log('Sendbird user connected:', user);

        const params = new sb.GroupChannelParams();
            params.isDistinct = true;
            params.addUserIds([visiteeSendBirdId]);

            sb.GroupChannel.createChannel(params, (groupChannel, error) => {
                if (error) {
                    console.error('Sendbird channel creation error:', error);
                } else {
                    console.log('Sendbird group channel created:', groupChannel);
                    groupChannel.sendUserMessage('Hello!', (message, error) => {
                        if (error) {
                            console.error('Sendbird message sending error:', error);
                        } else {
                            console.log('Sendbird message sent successfully:', message);
                        }
                    });
                }
            });
      }
    })
    router.push(`/chat`);
  }


  useEffect(() => { getVisitor() }, [isLoaded, isSignedIn, user]);

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

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (onPage) {
        setTimeSpent(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [onPage]);

  useEffect(() => updateProfileViews, [])

  useEffect(() => {
    const getAllBookmarkedPosts = async () => {
      if (!isLoaded || !isSignedIn || !user || !visitorId) {
        return;
      }
      try {
        const response = await axios.get(`${api}/profiles/allBookmarks/${visitorId}`);
        return response.data;
      } catch (error) {
        console.error('Error retrieving bookmarks for current viewer');
      }
    };
  
    const fetchBookmarkedPosts = async () => {
      try {
        const idsOfBookmarkedPosts = await getAllBookmarkedPosts();
        setBookmarkedPosts(idsOfBookmarkedPosts);
      } catch (error) {
        console.error('Error retrieving bookmarks for current viewer:', error);
      }
    };
  
    fetchBookmarkedPosts();
  
  }, [isLoaded, isSignedIn, user, visitorId]);
  

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
            <PostCard key={post._id} post={post} onUpdateBookmark={handleBookmarkUpdate}/>
          )) }
        </div>
      )
    } else if (activeSection === "Reviews") {
        return (
          reviews.length === 0 ?
            <h3 className="text-lg">No reviews on this profile</h3>
          :
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
    } else if (activeSection === "Availability") {
        return (
          <div className="flex flex-col justify-center max-w-3xl w-full">
              <CompareAvailability availability={availability} />
          </div>
        )
    }
  }

  return (
    <>
      <Navbar />
      <div 
        className="flex flex-col md:flex-row justify-evenly items-center bg-blue-300
        pt-8 pb-6 md:py-16 px-6 md:px-16"
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
              className="mr-1 w-12 h-12 rounded-full"
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
        <div className="flex flex-col items-center gap-y-2 mt-2 gap-x-4">
          <img className="hidden md:block w-48 h-48 object-cover rounded-md" src={imgUrl} alt={`${profileData.firstName}`} />
          <div className="flex gap-x-4">
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md" onClick={() => handleClickReportUser()}>
              Report this user
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md" onClick={() => handleSendMessage()}>
              Message this user
            </button>
          </div>
        </div>
      </div>
      <div className="w-full bg-blue-300 relative">
      <div className="hidden md:flex ml-8 items-end">
          { ["Posts", "Reviews", "Availability"].map((value, index) => {
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
              { ["Posts", "Reviews", "Availability"]
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
