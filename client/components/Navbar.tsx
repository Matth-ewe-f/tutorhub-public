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
  userOnly?: boolean,
}

const NavBar: FC<{profile: Profile}> = (props) => {
  const profile = props.profile;
  const cookies = new Cookies(null, {path: "/"});

  const getImgUrl = () => {
    if (profile && profile.profilePicKey != null) {
      return `https://tutorhub-public.s3.amazonaws.com/${profile.profilePicKey}`;
    } else {
      return "/defaultimg.jpeg";
    }
  }
  
  const signOut = () => {
    cookies.remove("tutorhub-public-username");
  }

  const links : navLink[] = [
    { text: "Search Offerings", href: "browse" },
    { text: "Make a Post", href: "createPost", userOnly: true },
    { text: "Search Users", href: "profiles" },
  ];

  const linkShouldDisable = (link : navLink) => {
    return link.userOnly && profile &&
      (profile.username === "Admin" || profile.username === "Guest");
  }

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
              className={`relative inline-block px-4 py-2 ease-linear ` +
              `duration-75 rounded-md font-extrabold font-sans text-lg ` +
              `group ` +
              `${linkShouldDisable(link)
                ? "line-through active:pointer-events-none"
                : "hover:bg-blue-300"}`
              }
            >
              {linkShouldDisable(link) &&
                <div className='hidden group-hover:flex absolute top-8 left-0 right-0 justify-center'>
                  <span className="inline-block px-2 py-1 bg-gray-700
                  outline-black outline rounded-md text-sm text-gray-200
                  font-bold text-center">
                    Disabled for <br/> {profile.username}s
                  </span>
                </div>
              }
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
          <DropdownMenuContent className='md:hidden overflow-visible'>
            { links.map((link) => {
              return <div className='relative group'>
                <DropdownMenuItem 
                  key={`${link.href}-mobile`}
                  className='cursor-pointer'
                  disabled={linkShouldDisable(link)}
                >
                  <Link 
                    href={`/${link.href}`}
                    className={`text-base ` +
                    (linkShouldDisable(link) 
                      ? `line-through active:pointer-events-none`
                      : ``
                    )}
                  >
                    {link.text}
                  </Link>
                </DropdownMenuItem>
                {linkShouldDisable(link) &&
                  <div className='z-50 hidden group-hover:block absolute
                  left-36 top-[3.1rem] -mt-14 w-28'>
                    <span className="inline-block px-2 py-1 bg-gray-700
                    outline-white outline rounded-md text-sm text-gray-200
                    font-bold text-center">
                      Disabled for <br/> {profile.username}s
                    </span>
                  </div>
                }
              </div>
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={getImgUrl()} alt="@shadcn" className='object-cover'/>
              {/* <AvatarFallback>TH</AvatarFallback> */}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className='cursor-pointer text-base'>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className='cursor-pointer text-base'>
              <Link href="/signIn" onClick={signOut}>Sign out</Link>
            </DropdownMenuItem>
            { profile && profile.username === "Admin" ?
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
