import React, { HTMLAttributes, MouseEvent, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { Star } from 'lucide-react';

type PostCardProps = {
  post: Post,
  clickFunc: () => void;
} & HTMLAttributes<HTMLDivElement>;

const PostCard: React.FC<PostCardProps> = (props) => {
  const post = props.post;
  const defaultImage = '/jhulogo.jpeg';
  const [titleUnderline, setTitleUnderline] = useState(false);
  const [avgRating, setAvgRating] = useState(5);
  const [imgUrl, setImgUrl] = useState(defaultImage);

  const router = useRouter();

  const postUrl = post.courseName ? `/post/course/${post._id}` : `/post/activity/${post._id}`;

  useEffect(() => {
    let total = 0;
    post.reviews.forEach(r => total += r.rating);
    setAvgRating(total / post.reviews.length);
    loadImage(post);
  }, [post])

  const loadImage = async (post : Post) => {
    if (post.activityPostPicKey) {
      const key = post.activityPostPicKey;
      const url = `https://tutorhub-public.s3.amazonaws.com/${key}`;
      setImgUrl(url);
    }
  }

  const handleClick = () => {
    if (titleUnderline) {
      props.clickFunc();
    }
  }

  const formatPrice = (price: number) => {
    if (!price || price === 0) {
      return "Free!"
    } else {
      return `From $${price}`;
    }
  }

  return (<> 
    <div 
      id={`post-${post._id}`}
      className={`relative overflow-hidden bg-white rounded shadow-lg cursor-pointer hover:-translate-y-2 transition duration-75 ${props.className}`}
      onClick={handleClick}
      onMouseEnter={() => setTitleUnderline(true)}
      onMouseLeave={() => setTitleUnderline(false)}
    >
      <img
        className="w-full h-48 object-cover"
        src={imgUrl}
        alt="Post Image"
      />
      <div className="border-t px-3 pb-3 pt-1">
        <div className="flex justify-between py-0.5">
          <div 
            className={`text-2xl font-bold font-sans text-slate-700
            truncate ${titleUnderline ? 'underline' : ''}`}
          >
            {post.courseName ? post.courseName : post.activityTitle}
          </div>
          { post.reviews.length > 0 ?
            <div className="ratings flex items-center">
              <Star size={20} className="fill-black text-black inline-block mr-1"/>
              <h1 className="font-bold pt-0.25 pr-1">{avgRating.toFixed(1)}</h1>
              <a href="/reviews" className="text-slate-500">({post.reviews.length})</a>
            </div>
          :
            <></>
          }
        </div>
        <div className={`flex items-center justify-between`}>
          <p className="text-sm font-light font-sans">{post.courseNumber}</p>
        </div>
        <p className="text-sm font-light font-sans line-clamp-2">
          {post.description ? post.description : post.activityDescription}
        </p>
        <div className='h-6'/>
        <div className="absolute left-0 bottom-3 w-full pt-1 flex justify-between"> 
          <p className="ml-3 text-black text-sm font-sans font-bold">
            {formatPrice(post.price)}
          </p>
          <p className="mr-3 text-black font-light text-sm font-sans">
            {"Created by "}
            <a 
              href={`/profile/` + post.userId} 
              className="font-semibold hover:underline"
              onMouseEnter={() => setTitleUnderline(false)}
              onMouseLeave={() => setTitleUnderline(true)}
            >
              {post.username}
            </a>
          </p>
        </div>
      </div>
    </div>
  </>);
};

export default PostCard;
