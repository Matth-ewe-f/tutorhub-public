"use client";
import React, { FC, useState } from 'react';
import Link from 'next/link'; 
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavBar: FC<{profile: Profile}> = (props) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [imgUrl, setImgUrl] = useState("/defaultimg.jpeg");
  
  return (
    <nav className="flex justify-between items-center p-4 bg-white h-18">
      <div className="hidden md:flex items-center space-x-4">
        <span className="text-xl font-bold mr-2 cursor-default">TUTORHUB</span>
        <Link 
          href="/browse" 
          className="inline-block px-2 py-1 ease-linear duration-75
          hover:bg-blue-300 rounded-md font-extrabold font-sans text-lg"
        >
          Search
        </Link>
        <Link 
          href="/createPost" 
          className="inline-block px-2 py-1 ease-linear duration-75
          hover:bg-blue-300 rounded-md font-extrabold font-sans text-lg"
        >
          Post
        </Link>
        <Link 
          href="/profiles" 
          className="inline-block px-2 py-1 ease-linear duration-75
          hover:bg-blue-300 rounded-md font-extrabold font-sans text-lg"
        >
          Profiles
        </Link>
        { isAdmin ? 
          <Link 
            href="/reports" 
            className="inline-block px-2 py-1 ease-linear duration-75
            hover:bg-blue-300 rounded-md font-extrabold font-sans text-lg"
          >
            Reports
          </Link>
          : <></>
        }
      </div>
      <div className="flex items-center md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link href="/browse">Posts</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/profiles">Profiles</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <Link href="/profile">
          <Avatar>
            <AvatarImage src={imgUrl} alt="@shadcn" className='object-cover'/>
            <AvatarFallback>TH</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
