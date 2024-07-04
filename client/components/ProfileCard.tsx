"use client";
import { useRouter } from 'next/navigation';
import React, { FC, HTMLAttributes, useEffect, useState } from 'react';

type props = {
  profile: Profile,
  self?: boolean,
} & HTMLAttributes<HTMLDivElement>;

const PostCard: FC<props> = ({ profile, self, className }) => {
  const [img, setImg] = useState("/defaultimg.jpeg");
  const [titleUnderline, setTitleUnderline] = useState(false);
  const router = useRouter();

  useEffect(() => { loadImage() }, [profile]);

  const loadImage = async () => {
    if (profile.profilePicKey) {
      const key = profile.profilePicKey;
      const url = `https://tutorhub-public.s3.amazonaws.com/${key}`
      setImg(url);
    }
  }

  const capitalize = (s : string) => {
    const pieces = s.split(" ");
    const newPieces = pieces.map((piece) => {
      return `${piece.charAt(0).toUpperCase()}${piece.substring(1)}`
    })
    return newPieces.join(' ');
  }

  const formatAffiliation = (s : string) => {
    if (profile.affiliation === "student" && profile.graduationYear) {
      return `${capitalize(profile.affiliation)}, ${profile.graduationYear}`;
    } else if (profile.affiliation != "otherAffiliate") {
      return `${capitalize(profile.affiliation)}`;
    } else {
      return "";
    }
  }

  const trimBio = (s : string) => {
    if (!s) {
      return `${profile.username} has not entered a biography yet.`;
    } else if (s.length < 90) {
      return s;
    } else {
      return `${s.substring(0, 87)}...`
    }
  }

  return ( <> 
    <div 
      className={`max-w-sm rounded overflow-hidden shadow-lg bg-white
      hover:-translate-y-2 transition duration-75 cursor-pointer ${className}`}
      onMouseEnter={() => setTitleUnderline(true)}
      onMouseLeave={() => setTitleUnderline(false)}
      onClick={() => router.push(`/profile/${profile._id}`)}
    >
      <img
        className="w-full h-48 object-cover"
        src={img}
        alt={profile.username}
      />
      <div className="px-6 py-4">
        <div className="mb-1">
          <div 
            className={`font-bold text-xl 
            ${titleUnderline ? 'underline' : ''}`}
          >
            {profile.username} {self ? "(You)" : ""}
          </div>
          <p className="text-sm font-light min-h-5">
            ({ formatAffiliation(profile.affiliation) })
          </p>
        </div>
        <p className="font-light text-sm">
          {trimBio(profile.description)}
        </p>
      </div>
    </div>
    </>
  );
};

export default PostCard;
