import { FC, useState } from "react";
import ReviewCardSmall from "./ReviewCardSmall";
import StarReview from "./StarReview";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import axios from "axios";
import { Star } from "lucide-react";

type props = {
  post : Post
  userId : string
  visitorId : string
}

const PostExpanded : FC<props> = ({post, userId, visitorId}) => {
	const api : string = process.env.NEXT_PUBLIC_BACKEND_URL;
  const sections = ["Description", "Reviews", "Leave Review"];
  const [activeSection, setActiveSection] = useState(sections[0]);
  const [deletedReviews, setDeletedReviews] = useState([]);
  const [rating, setRating] = useState(1);
  const [reviewText, setReviewText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [addedReviews, setAddedReviews] = useState<Review[]>([]);
  const [postedReview, setPostedReview] = useState(false);

  const getImgSrc = (post : Post) => {
    if (post.activityPostPicKey) {
      return `https://tutorhub-public.s3.amazonaws.com/${post.activityPostPicKey}`;
    } else {
      return '/jhulogo.jpeg';
    }
  }

  const getProfileLink = (post : Post) => {
    return `/profile/${post.userId}`;
  }

  const getAvgRating = (post : Post) => {
    let total = 0;
    post.reviews.forEach((review) => { total += review.rating });
    return total / post.reviews.length;
  }

  const formatPrice = (price: number) => {
    if (!price || price === 0) {
      return "for free!"
    } else {
      return `from $${price}`;
    }
  }

  const handleReviewDeletion = (id) => {
    setDeletedReviews([...deletedReviews, id]);
  }

  const submitReview = async () => {
    const body = {
      postName: post.courseName,
      postId: post._id,
      posterId: post.userId,
      reviewerId: visitorId,
      reviewDescription: reviewText,
      rating: rating,
      isAnonymous: anonymous,
    };
    const response = await axios.post(`${api}/postReviews/${post._id}`, body);
    const newReview = response.data.review;
    setAddedReviews([...addedReviews, newReview]);
    setPostedReview(true);
  }

  return <>
    <div className="z-20 fixed top-8 flex items-center justify-center w-full 
    h-full bg-slate-100 bg-opacity-70">
      <div className="flex-grow max-w-lg bg-white rounded-2xl overflow-hidden
      shadow-lg">
        <img src={getImgSrc(post)} className="h-60 w-full object-cover"/>
        <div className="pt-4 border-t">
          <div className="px-6">
            <div className="flex justify-between items-start">
              <h3 className="text-3xl text-slate-700 font-bold">
                {post.activityTitle ? post.activityTitle : post.courseName}
              </h3>
              { post.reviews.length > 0 ?
                <div className="ratings flex items-center">
                  <Star size={20} className="fill-black text-black inline-block mr-1"/>
                  <h1 className="font-bold pt-0.25 pr-1">
                    {getAvgRating(post).toFixed(1)}
                  </h1>
                  <a href="/reviews" className="text-slate-500">({post.reviews.length})</a>
                </div>
              :
                <></>
              }
            </div>
            <h5>{"Taught by "}
              <a href={getProfileLink(post)} className="underline font-bold">
                {post.username}
              </a>
              , {formatPrice(post.price)}
            </h5>
          </div>
          <div className="mt-2 relative">
            <div className="flex mx-6 gap-4">
              { sections.map((text) => {
                return (
                  <button 
                    className={`z-30 bg-white px-2 ` +
                    (activeSection == text ? `underline` : `hover:underline`)}
                    onClick={() => setActiveSection(text)}
                  >
                    {text}
                  </button>
                )
              })}
            </div>
            <div className="absolute top-3 z-20 w-full h-[1px] bg-slate-600"/>
          </div>
          <div className="h-44 overflow-y-scroll">
            { activeSection == "Description" &&
              <>
                { post.courseNumber && (
                  <div className="px-6 py-2 text-sm">
                    {(post.gradeReceived || post.professorTakenWith 
                    || post.semesterTaken || post.schoolTakenAt) && (
                      <h5 className="font-bold">
                        {post.username}'s experience with this course
                      </h5>
                    )}
                    {post.gradeReceived && (
                      <p className="font-thin">Grade: {post.gradeReceived}</p>
                    )}
                    {post.professorTakenWith && (
                      <p className="font-thin">Professor: {post.professorTakenWith}</p>
                    )}
                    {post.semesterTaken && (
                      <p className="font-thin">Semester: {post.semesterTaken}</p>
                    )}
                    {post.schoolTakenAt && !post.takenAtHopkins && (
                      <p className="font-thin">Taken at: {post.schoolTakenAt}</p>
                    )}
                  </div>
                )}
                {(post.gradeReceived || post.professorTakenWith 
                || post.semesterTaken || post.schoolTakenAt) && post.description && (
                  <h5 className="px-6 pt-1 font-bold text-sm">
                    Additional Information
                  </h5>
                )}
                <p className="px-6 text-sm font-thin">
                  {post.activityDescription || post.description}
                </p>
                <div className="mx-6 my-2 flex flex-wrap gap-2">
                  { post.tags && (post.tags.map(tag => {
                    return (
                      <p className="bg-pageBg px-2 py-1 rounded-lg cursor-default">
                        {tag}
                      </p>
                    );
                  }))}
                </div>
              </>
            }
            { activeSection == "Reviews" &&
              <>
                {[...post.reviews, ...addedReviews].map((review, index) => {
                  return <ReviewCardSmall review={review} loggedInUserId={userId}
                  className={`${index != 0 && "border-t"} border-slate-400 px-4 ` + 
                  `pb-2 ` + (deletedReviews.includes(review._id) && "hidden")}
                  handleDeleteFunc={handleReviewDeletion}/>
                })}
                { post.reviews.length == 0 && addedReviews.length == 0 && (
                  <h5 className="w-full mt-4 font-thin text-center">
                    This post has no reviews
                  </h5>
                )}
              </>
            }
            { activeSection == "Leave Review" && 
              <div className="mx-6 mt-1">
                <div className="flex flex-row items-end gap-2">
                  <StarReview rating={rating} setRating={setRating}
                  disabled={postedReview}/>
                  <p className="text-sm font-thin">(click to set your rating)</p>
                </div>
                <textarea 
                  className="w-full h-16 mt-2 px-2 py-1 text-sm
                  border border-gray-400 rounded-md"
                  placeholder="Write your review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  disabled={postedReview}
                />
                <div className="mt-1 flex flex-row justify-between items-start">
                  <div className="flex flex-row items-center gap-1">
                    <Checkbox
                      id="anonymous"
                      checked={anonymous}
                      disabled={postedReview}
                      onCheckedChange={() => setAnonymous(!anonymous)}
                    />
                    <Label htmlFor="anonymous" className="cursor-pointer font-thin">
                      Post anonymously
                    </Label>
                  </div>
                  <Button disabled={reviewText == "" || postedReview}
                  onClick={submitReview} className="w-28">
                    {postedReview ? "Posted!" : "Post Review"}
                  </Button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  </>;
}

export default PostExpanded;