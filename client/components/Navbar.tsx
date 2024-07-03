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
import Cookies from 'universal-cookie';
import { Menu } from 'lucide-react';

type navLink = {
  text: string,
  href: string,
  adminOnly?: boolean,
}

const NavBar: FC<{profile: Profile}> = (props) => {
  const cookies = new Cookies(null, {path: "/"});
  const [imgUrl, setImgUrl] = useState("/defaultimg.jpeg");
  
  const signOut = () => {
    cookies.remove("tutorhub-public-username");
  }

  const links : navLink[] = [
    { text: "Browse Posts", href: "browse" },
    { text: "Make a Post", href: "createPost" },
    { text: "Search Users", href: "profiles" },
  ];

  return <>
    <nav className="fixed top-0 z-50 w-full flex justify-between items-center px-4 py-3 bg-white shadow-md">
      <div className="hidden md:flex items-center">
        <span className="text-xl font-bold mr-4 cursor-default">TUTORHUB</span>
        <div className='w-[1px] h-8 bg-blue-300'></div>
        { links.map((link) => {
          return <>
            <Link
              key={`${link.href}-desktop`}
              href={`/${link.href}`}
              className="inline-block px-4 py-2 ease-linear duration-75
            hover:bg-blue-300 rounded-md font-extrabold font-sans text-lg"
            >
              { link.text }
            </Link>
            <div className='w-[1px] h-8 bg-blue-300'></div>
          </>
        })}
      </div>
      <div className="flex items-center md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Menu/>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            { links.map((link) => {
              return <>
                <DropdownMenuItem key={`${link.href}-mobile`} className='cursor-pointer'>
                  <Link href={`/${link.href}`} className="text-base">
                    {link.text}
                  </Link>
                </DropdownMenuItem>
              </>
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={imgUrl} alt="@shadcn" className='object-cover'/>
              <AvatarFallback>TH</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className='cursor-pointer text-base'>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className='cursor-pointer text-base'>
              <Link href="/signIn" onClick={signOut}>Sign out</Link>
            </DropdownMenuItem>
            { props.profile && props.profile.username === "Admin" ?
              <DropdownMenuItem className='cursor-pointer text-base'>
                <Link href="/reports">Admin Console</Link>
              </DropdownMenuItem>
            :
              <></>
            }
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  </>;
};

export default NavBar;
