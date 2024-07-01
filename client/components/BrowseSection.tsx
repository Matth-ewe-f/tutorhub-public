"use client";
import React, { FC, useEffect, useState } from "react";
import PostCard from './PostCard'; 
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'next/router';
import { profile } from "console";

  interface BrowseSectionProps {
    filterCourses: boolean;
    filterActivities: boolean;
    sortByPriceLowToHigh: boolean;
    sortByPriceHighToLow: boolean;
    filterAthleticTag: boolean;
    filterMusicTag: boolean;
    filterCookingTag: boolean;
    filterPerformingArtTag: boolean;
    filterVisualArtTag: boolean;
  }

  interface ActivityPost {
    userId: string;
    activityTitle: string;
    activityDescription: string | null;
    activityPostPicKey: string | null;
    price: number | null;
    tags: string[] | null;
  }

  interface CoursePost {
    userId: string;
    courseName: string;
    description: string | null;
    price: number | null;
    courseNumber: string | null;
    courseDepartment: string[] | null;
    gradeReceived: string | null;
    semesterTaken: string | null;
    professorTakenWith: string | null;
    takenAtHopkins: boolean;
    schoolTakenAt: string | null;
    coursePostPicKey: string | null;
  }

  const BrowseSection: React.FC<BrowseSectionProps> = ({ filterCourses, filterActivities, sortByPriceLowToHigh, sortByPriceHighToLow, filterAthleticTag, filterMusicTag, filterCookingTag, filterPerformingArtTag, filterVisualArtTag }) => {
    const [posts, setPosts] = useState<any[]>([]); // Set the type to any[] since we're using mongoose models directly

    const fetchPosts = async () => {
      try {
        let responseCourses;
        let responseActivities;
        let responseAll;
        let sortedPosts;
        if (filterCourses && !filterActivities) {
          responseCourses = await axios.get<CoursePost[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/coursePosts`);
          sortedPosts = responseCourses.data.posts;
        } else if (!filterCourses && filterActivities) {
          responseActivities = await axios.get<ActivityPost[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/activityPosts`);
          sortedPosts = responseActivities.data;
        } else {
          responseAll = await axios.get<any[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allPosts`); // Fetch all posts
          sortedPosts = responseAll.data;
        }
        
        // Filter posts based on selected tag filters
        if (filterAthleticTag) {
          sortedPosts = sortedPosts.filter((post) => post.tags?.some(tag => tag === 'Athletic'));
        }

        if (filterMusicTag) {
          sortedPosts = sortedPosts.filter((post) => post.tags?.some(tag => tag === 'Music'));
        }

        if (filterCookingTag) {
          sortedPosts = sortedPosts.filter((post) => post.tags?.some(tag => tag === 'Cooking'));
        }

        if (filterPerformingArtTag) {
          sortedPosts = sortedPosts.filter((post) => post.tags?.some(tag => tag === 'Performing Art'));
        }

        if (filterVisualArtTag) {
          sortedPosts = sortedPosts.filter((post) => post.tags?.some(tag => tag === 'Visual Art'));
        }

        if (sortByPriceHighToLow && !sortByPriceLowToHigh) {
          sortedPosts = sortedPosts.sort((a, b) => b.price - a.price);
        } else if (sortByPriceLowToHigh && !sortByPriceHighToLow) {
          sortedPosts = sortedPosts.sort((a, b) => a.price - b.price);
        } else if (sortByPriceHighToLow && sortByPriceLowToHigh) {
          sortedPosts = sortedPosts;
        }

        setPosts(sortedPosts);

      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };

    useEffect(() => {
      fetchPosts();
    }, [filterCourses, filterActivities, sortByPriceLowToHigh, sortByPriceHighToLow, filterAthleticTag, filterMusicTag, filterCookingTag, filterPerformingArtTag, filterVisualArtTag]); // Run this effect whenever filterCourses or filterActivities changes
  
  
    return (
      <div className="container px-6 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    );
  };
  
  export default BrowseSection;