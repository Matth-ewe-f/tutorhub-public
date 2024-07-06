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
        data = data.filter((p) => p.username != "Admin" && p.username != "Guest");
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
    <div className="hidden lg:block lg:w-1/4 lg:min-w-80"/>
			<div className="z-10 sticky top-0 lg:fixed flex flex-row flex-wrap lg:h-full min-h-24 lg:flex-col lg:min-w-80 lg:w-1/4 items-center justify-center lg:justify-start py-3 pt-20 bg-blue-300">
				<h3 className="ml-4 lg:ml-0 mt-2 text-xl font-bold uppercase">Search Users</h3>
        <div className="max-w-lg input-container mx-6 my-3 flex-grow-[2] lg:flex-grow-0">
					<input 
						type="text"
						name="text"
						className="min-w-64 w-full input placeholder-[#406a90]"
						placeholder="Username"
						onChange={(e) => searchItems(e.target.value)}
					/>
					<div className="top-line"></div>
					<div className="under-line"></div>
				</div>
			</div>
			<div className="w-full lg:w-3/4 py-4 lg:pt-24">
				<div className="container mx-auto px-6">
          { searchInput.length == 0 || filteredProfiles.length != 0 ?
            <div className="grid sm:grid-cols-2 mdmd:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              { searchInput.length > 1 ?
                filteredProfiles.map((profile) => (
                  <div className="w-full flex justify-center" key={profile._id}>
                    <ProfileCard 
                      profile={profile}
                      className="w-full"
                      self={profile.username == visitorProfile.username}
                      />
                  </div>
                ))
              :
                profiles.map((profile) => (
                  <div className="w-full flex justify-center" key={profile._id}>
                    <ProfileCard 
                      profile={profile}
                      className="w-full"
                      self={profile.username == visitorProfile.username}
                    />
                  </div>
                ))
              }
            </div>
          :
            <div className="flex items-center justify-center">
              <h5 className="mt-4 text-2xl font-light">
                No users match your search
              </h5>
            </div>
          }
				</div>
			</div>
		</div>
	</>;
};

export default Page;