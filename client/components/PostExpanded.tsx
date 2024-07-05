import { FC, useState } from "react";
import ReviewCardSmall from "./ReviewCardSmall";

type props = {
  post : Post
  userId : string
}

const PostExpanded : FC<props> = ({post, userId}) => {
  const sections = ["Description", "Reviews"];
  const [activeSection, setActiveSection] = useState(sections[0]);

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

  const formatPrice = (price: number) => {
    if (!price || price === 0) {
      return "for free!"
    } else {
      return `from $${price}`;
    }
  }

  return <>
    <div className="z-20 fixed top-8 flex items-center justify-center w-full 
    h-full bg-slate-100 bg-opacity-70">
      <div className="flex-grow max-w-lg bg-white rounded-2xl overflow-hidden
      shadow-lg">
        <img src={getImgSrc(post)} className="h-60 w-full object-cover"/>
        <div className="pt-4 border-t">
          <div className="px-6">
            <h3 className="text-3xl text-slate-700 font-bold uppercase">
              {post.activityTitle ? post.activityTitle : post.courseName}
            </h3>
            <h5>{"Taught by "}
              <a href={getProfileLink(post)} className="underline font-bold">
                {post.username}
              </a>
              , {formatPrice(post.price)}
            </h5>
            <div className="my-2 flex flex-wrap gap-2">
              { post.tags.map(tag => {
                return (
                  <p className="bg-pageBg px-2 py-1 rounded-lg cursor-default">
                    {tag}
                  </p>
                );
              })}
            </div>
          </div>
          <div className="mt-4 relative">
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
              <p className="px-6 pt-2 text-sm font-thin">
                {post.activityDescription}
              </p>
            }
            { activeSection == "Reviews" &&
              post.reviews.map((review, index) => {
                return <ReviewCardSmall review={review} loggedInUserId={userId}
                className={`${index != 0 && "border-t"} border-slate-400 px-4 pb-2`}/>
              })
            }
          </div>
        </div>
      </div>
    </div>
  </>;
}

export default PostExpanded;