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
import PostExpanded from "@/components/PostExpanded";

const Page: FC = () => {
	const api = process.env.NEXT_PUBLIC_BACKEND_URL;
	const cookies = new Cookies(null, { path: '/' });
	const router = useRouter();
	const [posts, setPosts] = useState<Post[]>([]);
	const [userId, setUserId] = useState('');
	const [profile, setProfile] = useState<Profile>();
	const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
	const [selectedPost, setSelectedPost] = useState(-1);

	// Loading State
	const [loading, setLoading] = useState(true);

	// Search
	const [searchInput, setSearchInput] = useState("");

	// Checkbox Filters
	const [typeFilters, setTypeFilters] = useState({
		courses: true,
		activities: true,
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
		// if (typeFilters.courses || typeFilters.activities) {
			filtered = filtered.filter(post => {
				return (typeFilters.courses && 'courseName' in post) ||
					(typeFilters.activities && 'activityTitle' in post);
			});
		// }

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

	const getSearchBarPlaceholder = () => {
		if (!typeFilters.courses && typeFilters.activities) {
			return "Search by Title";
		} else {
			return "Title or Course Number";
		}
	}

	if (loading) {
		return (<> <Loader /> </>);
	}

	const getFilterJSX = () => {
		return (
			<Accordion type="multiple" className="w-full">
				<AccordionItem value="item-1">
					<AccordionTrigger className="font-light">By Type</AccordionTrigger>
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
					<AccordionTrigger className="font-light">By Price</AccordionTrigger>
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
				{typeFilters.activities &&
					<AccordionItem value="item-3">
						<AccordionTrigger className="font-light">By Tag</AccordionTrigger>
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
			</Accordion>
		)
	}

	return <>
		<NavBar profile={profile} />
		{selectedPost >= 0 && selectedPost < posts.length &&
			<PostExpanded post={posts[selectedPost]} userId={profile._id}
			closeFunc={() => setSelectedPost(-1)}/>
		}
		<div className="flex flex-col lg:flex-row min-h-screen">
			<div className="hidden lg:block lg:w-1/4 lg:min-w-80"/>
			<div className="z-10 sticky lg:fixed top-0 lg:h-full flex flex-col flex-wrap min-h-24 lg:min-w-80 w-full lg:w-1/4 items-center py-3 pt-20 bg-blue-300">
				<h3 className="mt-2 text-xl font-bold uppercase">Search Offerings</h3>
				<div className="w-full flex flex-row flex-wrap lg:flex-col items-center justify-center">
					<div className="max-w-md input-container mx-6 mt-3 mb-3 lg:mb-6 flex-grow lg:flex-grow-0">
						<input 
							type="text"
							name="text"
							className="min-w-64 w-full input placeholder-[#406a90]"
							placeholder={getSearchBarPlaceholder()}
							onChange={(e) => searchItems(e.target.value)}
						/>
						<div className="top-line"></div>
						<div className="under-line"></div>
					</div>
					<div className="lg:hidden mx-4 flex justify-center">
						<Accordion type="single" collapsible className="w-40 [&_button:not([role=checkbox])]:py-3">
							<AccordionItem className="border-none" value="item-1">
								<AccordionTrigger className="text-xl font-light">
									Filters
								</AccordionTrigger>
								<AccordionContent>
									{ getFilterJSX() }
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
					<div className="hidden lg:block min-w-40 mx-4">
						<h1 className="text-xl font-light text-center">
							Filters
						</h1>
						{ getFilterJSX() }
					</div>
				</div>
			</div>
			<div className="w-full lg:w-3/4 py-4 lg:pt-24">
				<div className="container mx-auto px-6">
					{filteredPosts.length != 0 ? 
						<div className="grid sm:grid-cols-2 mdmd:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
							{filteredPosts.map((post, index) => (
								<div className="flex justify-center items-center">
									<PostCard 
										key={post._id}
										className="w-full h-full max-w-96"
										post={post}
										clickFunc={() => setSelectedPost(index)}
									/>
								</div>
							))}
						</div>
					:
						<div className="flex items-center justify-center">
							<h5 className="mt-4 text-2xl font-light">
								No offerings match your search
							</h5>
						</div>
					}
				</div>
			</div>
		</div>
	</>;
};

export default Page;
