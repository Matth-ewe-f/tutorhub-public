"use client";
import React, { FC, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import "../../../../styles/global.css";
import NavBar from "../../../../components/Navbar";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ComboBox from "@/components/ComboBox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";
import { useRouter } from "next/navigation";
import { report } from "process";

const Page : FC = ({ params }: { params : { id: string }}) => {
	const { isLoaded, isSignedIn, user } = useUser();
	const router = useRouter();
  	const BACKEND_URL : string = process.env.NEXT_PUBLIC_BACKEND_URL;

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [content, setContent] = useState("");
	const [refilling, setRefilling] = useState(false);
  	const [userId, setUserId] = useState("");

	const [reporteeFirstName, setReporteeFirstName] = useState("");
	const [reporteeLastName, setReporteeLastName] = useState("");

  const [profileData, setProfileData] = React.useState(null);
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`${BACKEND_URL}/profiles/getByEmail/${user.primaryEmailAddress.toString()}`);
			if (response.data.data.length === 0) {
				router.replace('/createAccount');
            }
        setProfileData(response.data);
		
		const response2 = await axios.get(`${BACKEND_URL}/profiles/${params.id}`);
		setReporteeFirstName(response2.data.data.firstName);
		setReporteeLastName(response2.data.data.lastName);

      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, [user, BACKEND_URL]);


  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.data[0].firstName);
      setLastName(profileData.data[0].lastName);
      setContent("");
      setUserId(profileData.data[0]._id);
    }
  }, [profileData]);

	if (!isLoaded || !isSignedIn) {
		return <></>;
	}


	const checkAndSubmit = async () => {
		if (content === "") {
			// missing field!
			alert("Please fill out all required fields")
			setRefilling(true);
		} else {
			// form success!
			let body = {
				"reporterId" : userId,
				"reporterFirstName" : firstName,
				"reporterLastName" : lastName,
				"content" : content, 
				"reporteeId" : params.id,
				"reporteeFirstName" : reporteeFirstName,
				"reporteeLastName" : reporteeLastName,
			}
			await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reports/`, body);
			alert('Report submitted successfully!')
			router.replace('/profiles');
		}
	}


  return <>
    <NavBar />
		<div className="flex flex-col justify-center items-center my-6 mx-24">
			<div className="
				bg-background flex-grow w-full max-w-4xl p-12 rounded-xl
				shadow-2xl"
			>
				<h1 className="text-4xl font-bold">Report a User 😡</h1>
				<hr/>
				<h3 className="mt-4 text-2xl font-bold">Personal Information</h3>
				<hr/>
				<div className="flex flex-row flex-wrap gap-x-8 gap-y-4 mt-4">
					<div className="flex flex-col flex-grow min-w-60">
						<Label htmlFor="firstName">First Name</Label>
						<Input
                            disabled
							id="firstName"
							placeholder="First Name"
							className={ `mt-1 ${ firstName.length === 0 && refilling
								? "outline outline-red-500"
								: ''
							}` }
							defaultValue={ firstName }
							onChange={ (event) => setFirstName(event.target.value) } 
						/>
					</div>
					<div className="flex flex-col flex-grow min-w-60">
						<Label htmlFor="lastName">Last Name</Label>
						<Input
                            disabled
							id="lastName"
							placeholder="Last Name"
							className={ `mt-1 ${ lastName.length === 0 && refilling
								? "outline outline-red-500"
								: ''
							}` }
							defaultValue={ lastName }
							onChange={ (event) => setLastName(event.target.value) }
						/>
					</div>
				</div>
				<Label htmlFor="content" className="inline-block mt-4">Content</Label>
				<Textarea
					className="resize-none"
					defaultValue={ content }
					onChange={ (event) => setContent(event.target.value) }
				/>
				<Button className="mt-8" onClick={ checkAndSubmit }>Finish</Button>
			</div>
		</div>
	</>;
};

export default Page;
