"use client";
import React, { FC, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import "../../styles/global.css";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ComboBox from "@/components/ComboBox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";
import { useRouter } from "next/navigation";

import FormData from "form-data";

type sisCourse = {
  courseTitle: string,
  courseNumber: string,
  courseDepartment: string[],
}

const APP_ID = process.env.NEXT_PUBLIC_SEND_BIRD_APP_ID;

const Page : FC = () => {
	const { isLoaded, isSignedIn, user } = useUser();
	const router = useRouter();
	const api : string = process.env.NEXT_PUBLIC_BACKEND_URL;
	const [checkedProfileExists, setCheckedExists] = useState(false);
	const [allDepartments, setAllDepartments] = useState<string[]>([]);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [about, setAbout] = useState("");
	const [department, setDepartment] = useState("");
	const [year, setYear] = useState(2024);
	const [refilling, setRefilling] = useState(false);
	const [affliiateType, setAffiliateType] = useState("student");
	const [photoFile, setPhotoFile] = useState<File>(null);
	const [canSubmit, setCanSubmit] = useState(true);
	const [submitText, setSubmitText] = useState("Finish");

	const checkIfProfileExists = async () => {
		if (!isLoaded)
		{
			return;
		}
		if (!isSignedIn)
		{
			router.replace('/');
			return;
		}
		const email = user.primaryEmailAddress.toString();
		const url = `${api}/profiles/getByEmail/${email}`;
		const profiles = (await axios.get(url)).data;
		if (profiles.data.length !== 0) {
			router.replace('/profile');
		} else {
			setCheckedExists(true);
		}
	}

	const loadDepartments = async () => {
		const response = await axios.get(`${api}/courses/all`);
		const courses : sisCourse[] = response.data.courses;
		const departmentSet = new Set<string>();
		courses.forEach((course) => {
			course.courseDepartment.forEach((department) => {
				departmentSet.add(department.substring(3));
			})
		});
		let departmentArray = Array.from(departmentSet);
		departmentArray.sort();
		setAllDepartments(departmentArray);
	}
	
	useEffect(() => { checkIfProfileExists() }, [user, router, isLoaded, isSignedIn]);

	useEffect(() => { loadDepartments() }, []);

	if (!isLoaded || !isSignedIn || !checkedProfileExists) {
		return <></>;
	}

	const checkAndSetYear = (input : string) => {
		let value : number = parseInt(input);
		const current : number = (new Date()).getFullYear();
		if (value > current + 6) {
			value = current + 6;
		} else if (value < current - 4) {
			value = current - 4
		}
		setYear(value);
	}

	const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files)
    setPhotoFile(files[0]);
  }

	const checkAndSubmit = async () => {
		if (firstName === "" || lastName === "" || department === "") {
			// missing field!
			alert("Please fill out all required fields")
			setRefilling(true);
		} else {
			// form success!
			setCanSubmit(false);
			setSubmitText("Loading...");
			let body = {
				"firstName" : firstName,
				"lastName" : lastName,
				"email" : user.primaryEmailAddress.toString(),
				"affiliation" : affliiateType,
				"department" : department,
				"description" : about,
			}
			if (affliiateType === "student") {
				body["graduationYear"] = year.toString();
			}
			const uri = `${api}/profiles`;
			const response = (await axios.post(uri, body)).data;
			if (photoFile !== null) {
				const formData = new FormData();
				formData.append("profilePicture", photoFile);
				const endpoint = `${api}/profilePics/upload/${response.data._id}`;
				await axios.post(endpoint, formData);
				// clerk profile image
				user.setProfileImage({file: photoFile});
			}
			// reigster the new user to the SendBird app for the chat
			const sendBirdUri = `https://api-${APP_ID}.sendbird.com/v3/users`
			let email = user.primaryEmailAddress.toString();
			const atIndex = email.indexOf('@');
			let jhed_id = '';
			if (atIndex !== -1 && email.endsWith('@jhu.edu')) {
				jhed_id = email.substring(0, atIndex);
			} else {
				console.error('Invalid email format');
			}
			const sendBirdBody = {
				"user_id" : jhed_id,
				"nickname" : `${firstName} ${lastName}`,
				"profile_url": "",
				"profile_file": photoFile
			}
			try {
				const sendBirdResponse = (await axios.post(sendBirdUri, sendBirdBody, {
					headers: {
						"Api-Token": process.env.NEXT_PUBLIC_SEND_BIRD_API_TOKEN,
						"Content-Type": "application/json",
					}
				})).data;
			} catch (e) {
				console.error(e);
			}
			alert(`Your account has been created!`);
			router.replace('/profile');
		}
	}

  return <>
		<div className="flex flex-col justify-center items-center my-24 mx-24">
			<div className="
				bg-background flex-grow w-full max-w-4xl p-12 rounded-xl
				shadow-2xl"
			>
				<h1 className="text-4xl font-bold">Welcome to Tutor Hub!</h1>
				<hr/>
				<p>
					To finish setting up your account, please enter the following information
				</p>
				<h3 className="mt-4 text-2xl font-bold">Personal Information</h3>
				<hr/>
				<div className="flex flex-row flex-wrap gap-x-8 gap-y-4 mt-4">
					<div className="flex flex-col flex-grow min-w-60">
						<Label htmlFor="firstName">First Name*</Label>
						<Input 
							id="firstName"
							placeholder="First Name"
							className={ `mt-1 ${ firstName.length === 0 && refilling
								? "outline outline-red-500"
								: ''
							}` }
							value={ firstName }
							onChange={ (event) => setFirstName(event.target.value) } 
						/>
					</div>
					<div className="flex flex-col flex-grow min-w-60">
						<Label htmlFor="lastName">Last Name*</Label>
						<Input
							id="lastName"
							placeholder="Last Name"
							className={ `mt-1 ${ lastName.length === 0 && refilling
								? "outline outline-red-500"
								: ''
							}` }
							value={ lastName }
							onChange={ (event) => setLastName(event.target.value) }
						/>
					</div>
				</div>
				<div className="flex flex-row flex-wrap gap-x-8 gap-y-4 mt-4">
					<div className="flex flex-col flex-grow basis-4 min-w-60">
						<Label htmlFor="email">Email*</Label>
						<Input 
							disabled
							id="email"
							className="mt-1"
							value={ user.primaryEmailAddress.toString() }
						/>
					</div>
					<div className="flex flex-col flex-grow basis-4 min-w-60">
						<Label htmlFor="picture">Profile Picture</Label>
						<Input
							id="picture"
							type="file"
							accept="image/png, image/gif, image/jpeg"
							className="mt-1 cursor-pointer"
							onChange={ handleFileSelected }
						/>
					</div>
				</div>
				<Label htmlFor="about" className="inline-block mt-4">About Me</Label>
				<Textarea
					id="about"
					className="resize-none"
					value={ about }
					onChange={ (event) => setAbout(event.target.value) }
				/>
				<h3 className="mt-6 text-2xl font-bold">Hopkins Information</h3>
				<hr/>
				<div className="flex flex-row flex-wrap gap-x-8 gap-y-4 mt-4">
					<div className="flex flex-col">
						<Label className="inline-block">Affiliate Type</Label>
						<RadioGroup 
							className="mt-2"
							defaultValue="student"
							onValueChange={ (value) => setAffiliateType(value) }
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="student" id="option-student" />
								<Label htmlFor="option-student">Student</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="faculty" id="option-faculty" />
								<Label htmlFor="option-faculty">Faculty</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="otherAffiliate" id="option-otherAff" />
								<Label htmlFor="option-otherAff">Other</Label>
							</div>
						</RadioGroup>
					</div>
					<div className="flex flex-col flex-grow min-w-60">
						<div className="flex flex-col flex-grow">
							<Label>Department*</Label>
							<ComboBox 
								className={ `w-auto mt-1 ${ department.length === 0 && refilling
									? "outline outline-red-500"
									: ''
								}` }
								prompt="Select Department"
								options={ allDepartments }
								onValueChange={ setDepartment }
								value={ department }
								id="department"
							/>
						</div>
						{ affliiateType === "student" ?
							<div className="flex flex-col flex-grow mt-4 min-w-60">
								<Label htmlFor="year">Graduation Year</Label>
								<Input 
									className="mt-1"
									id="year"
									type="number"
									placeholder="Non-students, leave blank"
									value={ year }
									onChange={ (event) => setYear(parseInt(event.target.value)) }
									onBlur={ (event) => checkAndSetYear(event.target.value) }
								/>
							</div>
						:
							""
						}
					</div>
				</div>
				<Button 
					id="submit"
					className="mt-8"
					disabled={!canSubmit}
					onClick={ checkAndSubmit }
				>
					{submitText}
				</Button>
			</div>
		</div>
	</>;
};

export default Page;