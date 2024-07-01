"use client";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { FC, useEffect, useState } from 'react';

type profileType = {
	_id : string,
	firstName : string,
	lastName : string,
	email : string,
	affiliation : string,
	department : string,
	graduationYear? : string,
	description? : string,
  profilePicKey? : string
}

const PostCard: FC<{profile: profileType}> = ({ profile }) => {
  const [img, setImg] = useState("/defaultimg.jpeg");
  const [titleUnderline, setTitleUnderline] = useState(false);
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const router = useRouter();

  useEffect(() => { loadImage() }, [profile]);

  const loadImage = async () => {
    if (profile.profilePicKey) {
      const key = profile.profilePicKey;
      const url = `https://tutorhubprofilepics.s3.amazonaws.com/${key}`
      setImg(url);
      // const api = process.env.NEXT_PUBLIC_BACKEND_URL;
      // const url = await axios.get(`${api}/profilePics/get/${profile.profilePicKey}`);
      // setImg(url.data.imageUrl);
    }
  }

  const capitalize = (s : string) => {
    const pieces = s.split(" ");
    const newPieces = pieces.map((piece) => {
      return `${piece.charAt(0).toUpperCase()}${piece.substring(1)}`
    })
    return newPieces.join(' ');
  }

  const trimBio = (s : string) => {
    if (!s) {
      return "";
    } else if (s.length < 90) {
      return s;
    } else {
      return `${s.substring(0, 87)}...`
    }
  }

  return ( <> 
    <div 
      className="max-w-sm h-96 rounded overflow-hidden shadow-lg bg-white
      hover:-translate-y-2 transition duration-75 cursor-pointer"
      onMouseEnter={() => setTitleUnderline(true)}
      onMouseLeave={() => setTitleUnderline(false)}
      onClick={() => router.push(`/profile/${profile._id}`)}
    >
      <img
        className="w-full h-48 object-cover"
        src={img}
        alt={fullName}
      />
      <div className="px-6 py-4">
        <div className="mb-2">
          <div 
            className={`font-bold text-xl 
            ${titleUnderline ? 'underline' : ''}`}
          >
            {fullName}
          </div>
          <p className="text-gray-600 text-sm">
            {profile.email} - {capitalize(profile.department)}
          </p>
          <p className="text-gray-600 text-sm">
            { profile.affiliation === "student" && profile.graduationYear ?
              `${capitalize(profile.affiliation)}, class of ${profile.graduationYear}`
            :
              `${profile.affiliation}`
            }
          </p>
        </div>
        <p className="text-gray-700 text-base">
          {trimBio(profile.description)}
        </p>
      </div>
    </div>
    </>
  );
};

export default PostCard;
