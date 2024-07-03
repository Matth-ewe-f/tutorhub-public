"use client";
import "@/styles/global.css";
import React, { FC, useEffect, useState } from "react";
import NavBar from "@/components/Navbar";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "universal-cookie";
import Loader from "@/components/Loader";

const Page : FC = ({ params }: { params : { id: string }}) => {
	const router = useRouter();
	const BACKEND_URL : string = process.env.NEXT_PUBLIC_BACKEND_URL;
	const cookies = new Cookies(null, {path: "/"});
	const [profileName, setProfileName] = useState("");
	const [content, setContent] = useState("");
	const [refilling, setRefilling] = useState(false);
	const [userId, setUserId] = useState("");
	const [reporteeName, setReporteeName] = useState("");
	const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = React.useState(null);
  useEffect(() => {
    const fetchProfile = async () => {
			const username = cookies.get("tutorhub-public-username");
      try {
        const response = await axios.get(`${BACKEND_URL}/profiles/getByUsername/${username}`);
				if (response.data.data.length === 0) {
					router.replace('/signIn');
				}
				setProfileData(response.data.data[0]);
				const response2 = await axios.get(`${BACKEND_URL}/profiles/${params.id}`);
				setReporteeName(response2.data.data.username);
				setLoading(false);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);


  useEffect(() => {
    if (profileData) {
      setProfileName(profileData.username);
      setContent("");
      setUserId(profileData._id);
    }
  }, [profileData]);

	const checkAndSubmit = async () => {
		if (content === "") {
			// missing field!
			alert("Please fill out all required fields")
			setRefilling(true);
		} else {
			// form success!
			let body = {
				"reporterId" : userId,
				"reporterName" : profileName,
				"content" : content, 
				"reporteeId" : params.id,
				"reporteeName" : reporteeName,
			}
			await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reports/`, body);
			alert('Report submitted.')
			router.replace('/profiles');
		}
	}

	if (loading) {
		return <Loader/>;
	}

  return <>
    <NavBar profile={profileData}/>
		<div className="flex flex-col justify-center items-center mt-24 mb-6 mx-24">
			<div className="
				bg-background flex-grow w-full max-w-4xl p-12 rounded-xl
				shadow-2xl"
			>
				<h1 className="text-2xl font-bold">Report a User</h1>
				<hr/>
				<div className="flex flex-row flex-wrap gap-x-8 gap-y-4 mt-4">
					<div className="flex flex-col flex-grow min-w-60">
						<Label htmlFor="reporterName">Your Username</Label>
						<Input
              disabled
							id="reporterName"
							value={ profileName }
						/>
					</div>
					<div className="flex flex-col flex-grow min-w-60">
						<Label htmlFor="reporteeName">Reporting</Label>
						<Input
              disabled
							id="reporteeName"
							value={ reporteeName }
						/>
					</div>
				</div>
				<Label htmlFor="content" className="inline-block mt-4">Content*</Label>
				<Textarea
					className="resize-none"
					defaultValue={ content }
					onChange={ (event) => setContent(event.target.value) }
				/>
				<Button
					className="mt-8"
					onClick={ checkAndSubmit }
					disabled={ content.length == 0}
				>
					Finish
				</Button>
			</div>
		</div>
	</>;
};

export default Page;
