"use client";

import React, { FC, useEffect, useState } from "react";
import NavBar from "@/components/Navbar";
import axios from "axios";
import ProfileCard from "@/components/ProfileCard";
import Loader from "@/components/Loader";
import "@/styles/global.css";
import "@/styles/basic.css";
import Cookies from "universal-cookie";
import { useRouter } from "next/navigation";

const Page : FC = () => {
  const api = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();
  const cookies = new Cookies(null, {path: "/"});
  const [visitorProfile, setVisitorProfile] = useState<Profile>();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const username = cookies.get("tutorhub-public-username");
        const visitor = await axios.get(`${api}/profiles/getByUsername/${username}`);
        if (visitor.data.data.length === 0) {
          router.push('/signIn');
        } else {
          setVisitorProfile(visitor.data.data[0]);
        }
        const response = await axios.get(`${api}/profiles`);
        let data : Profile[] = response.data.data;
        data = data.filter((p) => p.username !== "Admin");
        setProfiles(data);
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
        return profile.username.toLowerCase().includes(searchInput.toLowerCase())
      });
      setFilteredProfiles(filteredProfiles);
    } else {
      setFilteredProfiles(profiles);
    }
  };

  if (loading) return ( <> <Loader /> </>);

  return <>
		<NavBar profile={visitorProfile} />
		<div className="flex flex-col lg:flex-row min-h-screen">
			<div className="flex flex-row flex-wrap min-h-24 lg:flex-col lg:min-w-80 lg:w-1/4 items-center py-3 bg-blue-300">
				<div className="input-container mx-6 my-3 lg:my-6 flex-grow-[2] lg:flex-grow-0">
					<input 
						type="text"
						name="text"
						className="min-w-64 w-full input placeholder-[#406a90]"
						placeholder="Username"
						onChange={(e) => searchItems(e.target.value)}
					/>
					<label className="label">Search</label>
					<div className="top-line"></div>
					<div className="under-line"></div>
				</div>
			</div>
			<div className="w-full lg:w-3/4 py-4">
				<div className="container mx-auto px-6">
					<div className="grid sm:grid-cols-2 mdmd:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            { searchInput.length > 1 ?
              filteredProfiles.map((profiles) => (
                <div className="w-full" key={profiles._id}>
                  <ProfileCard profile={profiles}/>
                </div>
              ))
            :
              profiles.map((profiles) => (
                <div className="w-full" key={profiles._id}>
                  <ProfileCard profile={profiles}/>
                </div>
              ))
            }
					</div>
				</div>
			</div>
		</div>
	</>;
};

export default Page;