"use client";
import React, { FC, useEffect, useState } from "react";
import Cookies from 'universal-cookie';
import NavBar from "@/components/Navbar";
import "@/styles/global.css";
import "@/styles/basic.css";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import axios from "axios";
import PostCard from "@/components/PostCard";
import "@/styles/loader.css";
import Loader from "@/components/Loader";
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation";

const Page: FC = () => {
	const api = process.env.NEXT_PUBLIC_BACKEND_URL;
	const cookies = new Cookies(null, { path: '/' });
	const router = useRouter();
	const [posts, setPosts] = useState<Post[]>([]);
	const [userId, setUserId] = useState('');
	const [profile, setProfile] = useState<Profile>();
	const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

	// Loading State
	const [loading, setLoading] = useState(true);

	// Search
	const [searchInput, setSearchInput] = useState("");

	// Checkbox Filters
	const [typeFilters, setTypeFilters] = useState({
		courses: false,
		activities: false,
	});
	const [priceFilters, setPriceFilters] = useState({
		highToLow: false,
		lowToHigh: false,
	});
	const [tagFilters, setTagFilters] = useState({
		music: false,
		athletic: false,
		cooking: false,
		performingArt: false,
		visualArt: false,
	});
	const [availabilityFilter, setAvailabilityFilter] = useState(false);

	const checkProfile = async () => {
		const username = cookies.get("tutorhub-public-username");
		const response = await axios.get(`${api}/profiles/getByUsername/${username}`);
		if (response.data.data.length === 0) {
			router.replace('signIn');
			return true;
		}
		setUserId(response.data.data[0]._id);
		setProfile(response.data.data[0]);
		return false;
	}

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			let loaded = true;
			try {
				loaded = await checkProfile();
				const postResponse = await axios.get(`${api}/allPosts`);
				setPosts(postResponse.data);
			} catch (error) {
				console.error('Error fetching posts', error);
			} finally {
				setLoading(loaded);
			};
		}
		fetchData();
	}, []
	);

	useEffect(() => {
		filterPosts();
	}, [posts, searchInput, typeFilters, tagFilters, priceFilters]);

	const filterPosts = async () => {
		let filtered = posts;
		if (typeFilters.courses || typeFilters.activities) {
			filtered = filtered.filter(post => {
				return (typeFilters.courses && 'courseName' in post) ||
					(typeFilters.activities && 'activityTitle' in post);
			});
		}

		if (priceFilters.highToLow && !priceFilters.lowToHigh) {
			filtered = [...filtered.sort((a, b) => b.price - a.price)];
		} else if (priceFilters.lowToHigh && !priceFilters.highToLow) {
			filtered = [...filtered.sort((a, b) => a.price - b.price)];
		}

		if (!typeFilters.courses && (tagFilters.music || tagFilters.athletic || tagFilters.cooking || tagFilters.performingArt || tagFilters.visualArt)) {
			filtered = filtered.filter(post => {
				return (tagFilters.music && 'activityTitle' in post && post.tags.includes('Music')) ||
					(tagFilters.athletic && 'activityTitle' in post && post.tags.includes('Athletic')) ||
					(tagFilters.cooking && 'activityTitle' in post && post.tags.includes('Cooking')) ||
					(tagFilters.performingArt && 'activityTitle' in post && post.tags.includes('Performing Art')) ||
					(tagFilters.visualArt && 'activityTitle' in post && post.tags.includes('Visual Art'));
			});
		}

		if (searchInput) {
			filtered = filtered.filter(post => {
				if ('courseName' in post && 'courseNumber' in post) {
					// Check if the search input matches either the course name or course number
					return post.courseName.toLowerCase().includes(searchInput.toLowerCase()) ||
						post.courseNumber.toLowerCase().includes(searchInput.toLowerCase());
				} else if ('activityTitle' in post) {
					return post.activityTitle.toLowerCase().includes(searchInput.toLowerCase());
				}
				return false;
			});
		}

		setFilteredPosts(filtered);
	};

	const handleAvailabilityChange = async () => {
		let response;
		if (!availabilityFilter) {
			response = await axios.get(`${api}/allPosts/getAllAvailable/${userId}`);
		} else {
			response = await axios.get(`${api}/allPosts`);
		}
		setPosts(response.data);
		setAvailabilityFilter(!availabilityFilter);
	}

	const handleTypeChange = (filterCategory) => {
		setTypeFilters(prev => {
			const updatedFilters = {
				...prev,
				[filterCategory]: !prev[filterCategory],
			};
			return updatedFilters;
		});
	};

	const handlePriceChange = (filterCategory) => {
		setPriceFilters(prev => {
			const updatedFilters = {
				...prev,
				[filterCategory]: !prev[filterCategory],
			};
			return updatedFilters;
		});
	}

	const handleTagChange = (filterCategory) => {
		setTagFilters(prev => {
			const updatedFilters = {
				...prev,
				[filterCategory]: !prev[filterCategory],
			};
			return updatedFilters;
		});
	};

	const searchItems = (searchValue) => {
		setSearchInput(searchValue);
	}

	const handleBookmarkUpdate = async (bookmark: string, isCourse: boolean) => {
		try {
			const allBookmarks = await axios.get(`${api}/profiles/allBookmarks/${userId}`)
			let bookmarkIds;
			if (isCourse) {
				bookmarkIds = new Set(allBookmarks.data.data.courseBookmarks);
			} else {
				bookmarkIds = new Set(allBookmarks.data.data.activityBookmarks);
			}
			if (bookmarkIds.has(bookmark)) {
				await axios.put(`${api}/profiles/deleteBookmark/${userId}`, { bookmark: bookmark, isCourse: isCourse });
			} else {
				await axios.put(`${api}/profiles/addBookmark/${userId}`, { bookmark: bookmark, isCourse: isCourse });
			}
		} catch (error) {
			console.error('Error updating bookmark status:', error);
		}
	};

	if (loading) {
		return (<> <Loader /> </>);
	}

	const getFilterJSX = () => {
		return (
			<Accordion type="single" collapsible className="w-full">
				<AccordionItem value="item-1">
					<AccordionTrigger>By Type</AccordionTrigger>
					<AccordionContent>
						<div className="pb-1 ml-2">
							<div className="flex items-center space-x-2">
								<Checkbox id="courses" checked={typeFilters.courses} onCheckedChange={(e) => handleTypeChange('courses')} />
								<label
									htmlFor="terms2"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Courses
								</label>
							</div>
						</div>
						<div className="ml-2">
							<div className="flex items-center space-x-2">
								<Checkbox id="activites" checked={typeFilters.activities} onCheckedChange={(e) => handleTypeChange('activities')} />
								<label
									htmlFor="terms2"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Activities
								</label>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-2">
					<AccordionTrigger>By Price</AccordionTrigger>
					<AccordionContent>
						<div className="pb-1 ml-2">
							<div className="flex items-center space-x-2">
								<Checkbox id="highToLow" checked={priceFilters.highToLow} onCheckedChange={(e) => handlePriceChange('highToLow')} />
								<label
									htmlFor="terms2"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									High to Low
								</label>
							</div>
						</div>
						<div className="pb-1 ml-2">
							<div className="flex items-center space-x-2">
								<Checkbox id="lowToHigh" checked={priceFilters.lowToHigh} onCheckedChange={(e) => handlePriceChange('lowToHigh')} />
								<label
									htmlFor="terms2"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Low to High
								</label>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
				{/** Tags */}
				{!typeFilters.courses &&
					<AccordionItem value="item-3">
						<AccordionTrigger>By Tag</AccordionTrigger>
						<AccordionContent>
							<div className="pb-1 ml-2">
								<div className="flex items-center space-x-2">
									<Checkbox id="athletic" checked={tagFilters.athletic} onCheckedChange={(e) => handleTagChange('athletic')} />
									<label
										htmlFor="terms2"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Athletic
									</label>
								</div>
							</div>
							<div className="pb-1 ml-2">
								<div className="flex items-center space-x-2">
									<Checkbox id="music" checked={tagFilters.music} onCheckedChange={(e) => handleTagChange('music')} />
									<label
										htmlFor="terms2"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Music
									</label>
								</div>
							</div>
							<div className="pb-1 ml-2">
								<div className="flex items-center space-x-2">
									<Checkbox id="cooking" checked={tagFilters.cooking} onCheckedChange={(e) => handleTagChange('cooking')} />
									<label
										htmlFor="terms2"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Cooking
									</label>
								</div>
							</div>
							<div className="pb-1 ml-2">
								<div className="flex items-center space-x-2">
									<Checkbox id="performingArt" checked={tagFilters.performingArt} onCheckedChange={(e) => handleTagChange('performingArt')} />
									<label
										htmlFor="terms2"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Performing Arts
									</label>
								</div>
							</div>
							<div className="pb-1 ml-2">
								<div className="flex items-center space-x-2">
									<Checkbox id="visualArt" checked={tagFilters.visualArt} onCheckedChange={(e) => handleTagChange('visualArt')} />
									<label
										htmlFor="terms2"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Visual Arts
									</label>
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>
				}
				{/** schedule */}
				<AccordionItem value="item-4">
					<AccordionTrigger>By Schedule</AccordionTrigger>
					<AccordionContent>
						<div className="ml-2 pb-1">
							<div className="flex items-center space-x-2">
								<Checkbox id="availability" checked={availabilityFilter} onCheckedChange={(e) => handleAvailabilityChange()} />
								<label
									htmlFor="avail"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Matching Schedules
								</label>
							</div>
							<span className="inline-block mt-0.5">
								Set <a href='/profile?section=Schedule' className="underline">
									your schedule
								</a>
							</span>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		)
	}

	return <>
		<NavBar profile={profile} />
		<div className="flex flex-col lg:flex-row min-h-screen">
			<div className="flex flex-row flex-wrap min-h-24 lg:flex-col lg:min-w-80 lg:w-1/4 items-center py-3 bg-blue-300">
				<div className="input-container mx-6 my-3 lg:my-6 flex-grow-[2] lg:flex-grow-0">
					<input 
						type="text"
						name="text"
						className="min-w-64 w-full input placeholder-[#406a90]"
						placeholder="Name or Course Number"
						onChange={(e) => searchItems(e.target.value)}
					/>
					<label className="label">Search</label>
					<div className="top-line"></div>
					<div className="under-line"></div>
				</div>
				<div className="lg:hidden mx-4 flex-grow flex justify-center">
					<Accordion type="single" collapsible className="w-48 [&_button:not([role=checkbox])]:py-3">
						<AccordionItem className="border-none" value="item-1">
							<AccordionTrigger className="text-xl font-bold uppercase">
								Filter Posts
							</AccordionTrigger>
							<AccordionContent>
								{ getFilterJSX() }
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
				<div className="hidden lg:block mx-4">
					<h1 className="text-2xl font-bold uppercase">
						filter posts
					</h1>
					{ getFilterJSX() }
				</div>
			</div>
			<div className="w-full lg:w-3/4 py-4">
				<div className="container mx-auto px-6">
					{/* <div className="flex flex-col items-center justify-center lg:hidden py-6 mb-4 w-full">
						<div className="input-container w-full">
							<input type="text" name="text"
								className="input w-full"
								placeholder="Search"
								onChange={(e) => searchItems(e.target.value)}></input>
							<label className="label">Search</label>
							<div className="top-line"></div>
							<div className="under-line"></div>
						</div>
						<div className="accordian w-1/2 mt-4 rounded-sm px-2 bg-blue-300">
							<Accordion type="single" collapsible className="w-full">
								<AccordionItem className="border-none" value="item-1">
									<AccordionTrigger>Filter Posts</AccordionTrigger>
									<AccordionContent>
										<Accordion type="single" collapsible className="w-full">
											<AccordionItem className="border-t" value="item-1">
												<AccordionTrigger>By Type</AccordionTrigger>
												<AccordionContent>
													<div className="pb-1 ml-2">
														<div className="flex items-center space-x-2">
															<Checkbox id="courses" checked={typeFilters.courses} onCheckedChange={(e) => handleTypeChange('courses')} />
															<label
																htmlFor="terms2"
																className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																Courses
															</label>
														</div>
													</div>
													<div className="ml-2">
														<div className="flex items-center space-x-2">
															<Checkbox id="activites" checked={typeFilters.activities} onCheckedChange={(e) => handleTypeChange('activities')} />
															<label
																htmlFor="terms2"
																className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																Activities
															</label>
														</div>
													</div>
												</AccordionContent>
											</AccordionItem>
											<AccordionItem value="item-2">
												<AccordionTrigger>By Price</AccordionTrigger>
												<AccordionContent>
													<div className="pb-1 ml-2">
														<div className="flex items-center space-x-2">
															<Checkbox id="highToLow" checked={priceFilters.highToLow} onCheckedChange={(e) => handlePriceChange('highToLow')} />
															<label
																htmlFor="terms2"
																className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																High to Low
															</label>
														</div>
													</div>
													<div className="pb-1 ml-2">
														<div className="flex items-center space-x-2">
															<Checkbox id="lowToHigh" checked={priceFilters.lowToHigh} onCheckedChange={(e) => handlePriceChange('lowToHigh')} />
															<label
																htmlFor="terms2"
																className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																Low to High
															</label>
														</div>
													</div>
												</AccordionContent>
											</AccordionItem>
											<AccordionItem value="item-3">
												<AccordionTrigger>By Tag</AccordionTrigger>
												<AccordionContent>
													<div className="pb-1 ml-2">
														<div className="flex items-center space-x-2">
															<Checkbox id="athletic" checked={tagFilters.athletic} onCheckedChange={(e) => handleTagChange('athletic')} />
															<label
																htmlFor="terms2"
																className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																Athletic
															</label>
														</div>
													</div>
													<div className="pb-1 ml-2">
														<div className="flex items-center space-x-2">
															<Checkbox id="music" checked={tagFilters.music} onCheckedChange={(e) => handleTagChange('music')} />
															<label
																htmlFor="terms2"
																className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																Music
															</label>
														</div>
													</div>
													<div className="pb-1 ml-2">
														<div className="flex items-center space-x-2">
															<Checkbox id="cooking" checked={tagFilters.cooking} onCheckedChange={(e) => handleTagChange('cooking')} />
															<label
																htmlFor="terms2"
																className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																Cooking
															</label>
														</div>
													</div>
													<div className="pb-1 ml-2">
														<div className="flex items-center space-x-2">
															<Checkbox id="performingArt" checked={tagFilters.performingArt} onCheckedChange={(e) => handleTagChange('performingArt')} />
															<label
																htmlFor="terms2"
																className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																Performing Arts
															</label>
														</div>
													</div>
													<div className="pb-1 ml-2">
														<div className="flex items-center space-x-2">
															<Checkbox id="visualArt" checked={tagFilters.visualArt} onCheckedChange={(e) => handleTagChange('visualArt')} />
															<label
																htmlFor="terms2"
																className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																Visual Arts
															</label>
														</div>
													</div>
												</AccordionContent>
											</AccordionItem>
											<AccordionItem value="item-4">
												<AccordionTrigger>By Availability</AccordionTrigger>
												<AccordionContent>
													<div className="ml-2 pb-1">
														<div className="flex items-center space-x-2">
															<Checkbox id="availability" checked={availabilityFilter} onCheckedChange={(e) => handleAvailabilityChange()} />
															<label
																htmlFor="avail"
																className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																Matching Schedules
															</label>
														</div>
													</div>
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						</div>
					</div> */}
					{/* POSTS SECTION */}
					<div className="grid sm:grid-cols-2 mdmd:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
						{filteredPosts.map((posts) => (
							<div className="flex justify-center items-center">
								<PostCard 
									key={posts._id}
									className="max-w-96"
									post={posts}
									onUpdateBookmark={handleBookmarkUpdate}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	</>;
};

export default Page;
