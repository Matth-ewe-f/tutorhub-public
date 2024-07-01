"use client";

import React, { FC, useEffect, useState } from "react";
import NavBar from "@/components/Navbar";
import axios from "axios";
import ProfileCard from "@/components/ProfileCard";
import Loader from "@/components/Loader";
import "@/styles/global.css";
import "@/styles/basic.css";

interface ProfilePost {
	_id : string,
	firstName : string,
	lastName : string,
	email : string,
	affiliation : string,
	department : string,
	graduationYear? : string,
	description? : string
}

type Profile = ProfilePost;

const Page : FC = () => {
  const api = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get(`${api}/profiles`);
        setProfiles(response.data.data);
      } catch (error) {
          console.error('Error fetching posts', error);
      } finally {
          setLoading(false);
      };
    };
    fetchProfiles();
  }, [api]);

  const searchItems = (searchValue) => {
    setSearchInput(searchValue);
    if (searchInput !== '') {
      const filteredProfiles = profiles.filter((profile) => {
        return profile.firstName.toLowerCase().includes(searchInput.toLowerCase()) ||
                profile.lastName.toLowerCase().includes(searchInput.toLowerCase()) ||
                profile.email.toLowerCase().includes(searchInput.toLowerCase());
      });
      setFilteredProfiles(filteredProfiles);
    } else {
      setFilteredProfiles(profiles);
    }
  };

  if (loading) return ( <> <Loader /> </>);

  return (
    <>
      <NavBar />
      <div className="flex flex-col md:flex-row min-h-screen">
        <div className="md:w-1/4 min-w-64 flex flex-col items-center py-3 bg-blue-300">
          <div className="input-container my-3">
            <input type="text" name="text" 
              className="input" 
              placeholder="Name, Email"
              onChange={ (e) => searchItems(e.target.value) } 
            />
            <label className="label">Search</label>
            <div className="top-line"></div>
            <div className="under-line"></div>
          </div>
          <h1 className="text-xl font-extrabold font-sans">Search Profiles</h1>
        </div>
        <div className="md:w-3/4">
        {searchInput.length > 1 ? (
          <div className="container mx-auto max-w-sm md:max-w-max px-6 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfiles.map((profiles) => (
                <div className="w-full" key={profiles._id}>
                  <ProfileCard profile={profiles}/>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="container mx-auto max-w-sm md:max-w-max px-6 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profiles) => (
                <div className="w-full" key={profiles._id}>
                  <ProfileCard profile={profiles}/>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default Page;