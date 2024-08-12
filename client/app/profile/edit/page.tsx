"use client";
import React, { FC, useEffect, useState } from "react";
import "../../../styles/global.css";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ComboBox from "@/components/ComboBox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "universal-cookie";
import Loader from "@/components/Loader";

const Page : FC = () => {
	const router = useRouter();
	const cookies = new Cookies(null, {path: "/"});
  const BACKEND_URL : string = process.env.NEXT_PUBLIC_BACKEND_URL;
	const [allDepartments, setAllDepartments] = useState<string[]>([]);
	const [username, setUsername] = useState("");
	const [about, setAbout] = useState("");
	const [department, setDepartment] = useState("");
	const [year, setYear] = useState(2024);
	const [refilling, setRefilling] = useState(false);
	const [affliiateType, setAffiliateType] = useState("student");
  const [userId, setUserId] = useState("");
	const [photoFile, setPhotoFile] = useState<File>(null);
  const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submittimg, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
				const username = cookies.get("tutorhub-public-username");
				if (username === "Admin" || username === "Guest"){
					router.replace('/profile');
					return;
				}
        const response = await axios.get(`${BACKEND_URL}/profiles/getByUsername/${username}`);
				if (response.data.data.length === 0) {
					router.replace('/signIn');
					return;
				}
        setProfileData(response.data);
				setLoading(false);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

	const loadDepartments = async () => {
		const response = await axios.get(`${BACKEND_URL}/courses/all`);
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

	useEffect(() => { loadDepartments() }, []);

  useEffect(() => {
    if (profileData) {
      setUsername(profileData.data[0].username);
      setAbout(profileData.data[0].description);
      setDepartment(profileData.data[0].department);
			if (profileData.data[0].graduationYear) {
				setYear(profileData.data[0].graduationYear);
			}
			setAffiliateType(profileData.data[0].affiliation);
      setUserId(profileData.data[0]._id);
    }
  }, [profileData]);

	if (profileData === null) {
		return <Loader/>;
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
		if (username === "" || department === "") {
			// missing field!
			alert("Please fill out all required fields")
			setRefilling(true);
		} else {
			// form success!
			let body = {
				"username" : username,
				"affiliation" : affliiateType,
				"department" : department,
				"description" : about,
			}
			if (affliiateType === "student") {
				body["graduationYear"] = year.toString();
			}
			await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profiles/${userId}`, body);
			if (photoFile !== null) {
				const formData = new FormData();
				formData.append("profilePicture", photoFile);
				const endpoint = `${BACKEND_URL}/profilePics/upload/${userId}`;
				setSubmitting(true);
				await axios.post(endpoint, formData);
			}
			router.replace('/profile');
		}
	}

	if (loading) {
		return <Loader/>
	}

  return <>
		<div className="flex flex-col justify-center items-center my-12 md:mx-24">
			<div className="
				bg-background flex-grow w-full max-w-4xl p-12 md:rounded-xl
				md:shadow-2xl"
			>
				<h1 className="text-4xl font-bold">Edit Profile</h1>
				<hr/>
				<h3 className="mt-4 text-2xl font-bold">Personal Information</h3>
				<hr/>
				<div className="flex flex-row flex-wrap gap-x-8 gap-y-4 mt-4">
					<div className="flex flex-col basis-4 flex-grow min-w-60">
						<Label htmlFor="username">Username</Label>
						<Input 
							id="username"
							value={username}
							className="mt-1"
							disabled
						/>
					</div>
					<div className="flex flex-col basis-4 flex-grow min-w-60">
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
					className="resize-none"
					defaultValue={ about }
					id="about"
					onChange={ (event) => setAbout(event.target.value) }
				/>
				<h3 className="mt-6 text-2xl font-bold">Hopkins Information</h3>
				<hr/>
				<div className="flex flex-row flex-wrap gap-x-8 gap-y-4 mt-4">
					<div className="flex flex-col">
						<Label className="inline-block">Affiliate Type</Label>
						<RadioGroup 
							className="mt-2"
							value={affliiateType}
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
				<Button className="mt-8 w-24" onClick={ checkAndSubmit }
				disabled={submittimg}>
					{ submittimg ? "Loading..." : "Finish" }
				</Button>
			</div>
		</div>
	</>;
};

export default Page;