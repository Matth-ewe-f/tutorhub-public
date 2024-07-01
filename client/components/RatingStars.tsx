import { Star } from "lucide-react";
import { FC, HTMLAttributes } from "react";

type props = {
  rating: number,
  starSize?: number,
  numReviews?: number,
} & HTMLAttributes<HTMLDivElement>

const RatingStars : FC<props> = (props) => {
  const size = props.starSize ? props.starSize : 20;
  const roundRating = Math.round(props.rating * 2) / 2;
  // TODO round rating
  
  const getStar = (fill : number) => {
    if (fill <= 0) {
      return <Star size={size} strokeWidth={1} className='fill-black'/>
    } else if (fill < 1) {
      const px = Math.round((fill * size * 0.4) + (0.3 * size));
      // classes must be named in full for tailwind to compile the css
      // therefore, we cannot do something like `w-[${px}px]`
      const dict = {
        5: "w-[5px]",
        6: "w-[6px]",
        7: "w-[7px]",
        8: "w-[8px]",
        9: "w-[9px]",
        10: "w-[10px]",
        11: "w-[11px]",
        12: "w-[12px]",
        13: "w-[13px]",
        14: "w-[14px]",
        15: "w-[15px]",
        16: "w-[16px]",
        17: "w-[17px]",
        18: "w-[18px]",
        19: "w-[19px]",
        20: "w-[20px]",
      }
      return (
        <div className='relative'>
          <Star size={size} strokeWidth={1} className='fill-black'/>
          <div className={`h-full overflow-hidden absolute top-0 ${dict[px]}`}>
            <Star
              size={size}
              strokeWidth={1}
              className='fill-yellow-300'
            />
          </div>
        </div>
      )
    } else {
      return <Star size={size} strokeWidth={1} className='fill-yellow-300'/>
    }
  }

  return (
    <div className={`flex items-center ${props.className}`}>
      {
        [0, 1, 2, 3, 4].map((value) => {
          return <div key={value}>{getStar(props.rating - value)}</div>
        })
      }
      {props.numReviews && (
        <p className='ml-1'>({props.numReviews})</p>
      )}
    </div>
  );
}

export default RatingStars;