"use client";
import React, { FC, useEffect, useState } from "react";
import Cookies from 'universal-cookie';
import { useRouter } from "next/navigation";
import "../../styles/global.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import axios from "axios";
import ComboBox from "@/components/ComboBox";

const Page : FC = () => {
	const api : string = process.env.NEXT_PUBLIC_BACKEND_URL;
	const cookies = new Cookies(null, { path: '/' });
	const router = useRouter();
	const [loginType, setLoginType] = useState("user");
	const [username, setUsername] = useState("");
	const [affiliation, setAffiliation] = useState("student");
	const [department, setDepartment] = useState("");
	const [year, setYear] = useState(2025);
	const [canSubmit, setCanSubmit] = useState(false);
	const [newWarnText, setNewWarnText] = useState("");
	const [existingWarnText, setExistingWarnText] = useState("");
	const [allDepartments, setAllDepartments] = useState<string[]>([]);

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

	const changeLoginType = (newType : string) => {
		setNewWarnText("");
		setExistingWarnText("");
		setLoginType(newType);
	}

	const checkAndSetYear = (input : string) => {
		let value : number = parseInt(input);
		const current : number = (new Date()).getFullYear();
		if (value > current + 6) {
			value = current + 6;
		} else if (value < current - 1) {
			value = current - 1
		}
		setYear(value);
	}

	const checkCanSubmit = () => {
		if (loginType === "guest") {
			setCanSubmit(true);
		} else if (loginType === "user") {
			setCanSubmit(username !== "");
		} else {
			setCanSubmit(username !== "" && department !== "");
		}
	}

	useEffect(() => { loadDepartments() }, []);

	useEffect(() => { checkCanSubmit() }, [loginType, username, department]);

	const loginByName = async () => {
		console.log(loginType);
		if (loginType === "new") {
			let body : any = {username, affiliation, department}
			if (affiliation === "student") {
				body.year = year;
			}
			const response = await axios.post(`${api}/profiles`, body, {validateStatus: () => true});
			if (response.status !== 200) {
				if (response.data.code === 11000) {
					setNewWarnText("Username already taken");
				} else {
					throw response;
				}
			} else {
				cookies.set("tutorhub-public-username", username);
				router.replace("/browse");
			}
		} else {
			const url = `${api}/profiles/getByUsername/${username}`;
			const response = await axios.get(url);
			if (response.status !== 200 || response.data.data.length === 0) {
				setExistingWarnText("User not found");
			} else {
				cookies.set("tutorhub-public-username", username);
				router.replace("/browse");
			}
		}
	}

	const loginAsGuest = () => {
		cookies.set("tutorhub-public-username", username);
		router.replace("/browse");
	}

  return (
		<div className="flex justify-center mt-32">
			<div 
				className="flex flex-wrap gap-y-4 gap-x-8 items-start justify-center
				w-96 bg-white rounded-2xl p-6 shadow-md"
			>
				<div className="w-full flex flex-col justify-center items-center">
					<h1 className="text-2xl text-center">
						Log in as:
					</h1>
					<RadioGroup
						className="flex mb-2"
						defaultValue="user"
						onValueChange={ (value) => changeLoginType(value) }
					>
						<div className="flex items-center gap-0.5 cursor-pointer">
							<RadioGroupItem value="user" id="user" className="text-lg"/>
							<Label htmlFor="user" className="text-lg cursor-pointer">
								Existing User
							</Label>
						</div>
						<div className="flex items-center gap-0.5 cursor-pointer">
							<RadioGroupItem value="new" id="new-user" className="text-lg"/>
							<Label htmlFor="new-user" className="text-lg cursor-pointer">
								New User
							</Label>
						</div>
						<div className="flex items-center gap-0.5">
							<RadioGroupItem value="guest" id="guest" className="text-lg"/>
							<Label htmlFor="guest" className="text-lg cursor-pointer">
								Guest
							</Label>
						</div>
					</RadioGroup>
					{ loginType === "guest" ? 
						<div className="flex gap-4 items-center justify-center">
							<Button 
								className="text-lg border"
								onClick={loginAsGuest}
								disabled={!canSubmit}
							>
								Login As Guest
							</Button>
						</div>
					:
						(loginType === "new" ?
							<div 
								className="w-full flex flex-col"
							>
								<hr className="mb-2"/>
								<p className="text-md text-red-600">{newWarnText}</p>
								<Input
									placeholder="Username" 
									value={username}
									onChange={(event) => setUsername(event.target.value)}
									className="text-md flex-grow bg-white mb-2"
								/>
								<ComboBox 
									className="w-full text-md mb-2"
									prompt="Select Department"
									options={ allDepartments }
									onValueChange={ setDepartment }
									value={ department }
									id="department"
								/>
								<Label className="inline-block text-md">JHU Affiliation:</Label>
								<RadioGroup 
									className="mb-2 gap-0"
									defaultValue="student"
									onValueChange={ (value) => setAffiliation(value) }
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="student" id="option-student" />
										<Label htmlFor="option-student" className="text-md cursor-pointer">
											Student
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="faculty" id="option-faculty" />
										<Label htmlFor="option-faculty" className="text-md cursor-pointer">
											Faculty
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="otherAffiliate" id="option-otherAff" />
										<Label htmlFor="option-otherAff" className="text-md cursor-pointer">
											Other
										</Label>
									</div>
								</RadioGroup>
								{ affiliation === "student" ?
									<div className="flex flex-col flex-grow min-w-60">
										<Label htmlFor="year" className="text-md">
											Graduation Year
										</Label>
										<Input 
											className="text-md"
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
								<div className="flex justify-center mt-4">
									<Button 
										className="text-lg border flex-grow-0"
										onClick={loginByName}
										disabled={!canSubmit}
									>
										Login
									</Button>
								</div>
							</div>
						:
							<>
								<p className="text-md w-full text-red-600">
									{existingWarnText}
								</p>
								<div className="w-full flex gap-4 items-center justify-center">
									<Input
										placeholder="Username" 
										value={username}
										onChange={(event) => setUsername(event.target.value)}
										className="text-md flex-grow bg-white"
									/>
									<Button 
										className="text-lg border"
										onClick={loginByName}
										disabled={!canSubmit}
									>
										Login
									</Button>
								</div>
							</>
						)
					}
				</div>
			</div>
		</div>
	);
};

export default Page;