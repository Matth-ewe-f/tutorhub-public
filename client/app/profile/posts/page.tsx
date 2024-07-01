"use client";
import React, { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "../../../styles/global.css";
import Navbar from "../../../components/Navbar";
import { Button } from "components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "components/ui/form";
import { Input } from "components/ui/input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

//const { isLoaded, isSignedIn, user } = useUser();


const postFormSchema = z.object({
    username: z.string(),
    courseId: z.string(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    picture: z.string().optional(),
    price: z.string().min(1, "Price is required"),
    bookmark: z.boolean()
  });
  
  type PostFormData = z.infer<typeof postFormSchema>;
  

const CreatePost : FC = () => {
	const { user } = useUser();
  const [profileData, setProfileData] = React.useState(null);
  const router = useRouter();

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/profiles/getByEmail/${user.primaryEmailAddress.toString()}`);
      setProfileData(response.data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);


  const form = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      username: "",
      courseId: "",
      title: "",
      description: "",
      picture: "",
      price: "",
      bookmark: false
    },
  });

  

  async function onSubmit(data: z.infer<typeof postFormSchema>) {
    await fetchProfile();
    const postData = {
      userId: profileData.data[0]._id,
      title: data.title,
      description: data.description,
      imageUrl: data.picture,
      price: data.price,
      courseId: data.courseId,
    }

    const newPost = await axios.post(`${BACKEND_URL}/posts`, postData);
    router.push('/profile')
  }

  return (
    <>
      <Navbar />
      <div className="flex justify-center min-h-screen">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-1/3 space-y-6">
            <h1 className="text-2xl font-bold mb-4">Create Post</h1>
            {/*Picture Field */}
            <FormField
              control={form.control}
              name="picture"
              render={({ field, fieldState }) => (
                <FormItem className="mb-4">
                  <FormLabel className="font-bold" htmlFor="picture">Image</FormLabel>
                  <FormControl>
                    <Input className="border-black" id="picture" type="file" {...field} />
                  </FormControl>
                  {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                </FormItem>
              )}
            />
            {/* Title Field */}
            <FormField name="title" control={form.control} render={({ field, fieldState }) => (
              <FormItem className="mb-4">
                <FormLabel className="font-bold" htmlFor="title">Title</FormLabel>
                <FormControl>
                  <Input className="border-black" id="title" placeholder="Title" {...field} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )} />
            {/* Course ID Field */}
            <FormField name="courseId" control={form.control} render={({ field, fieldState }) => (
              <FormItem className="mb-4">
                <FormLabel className="font-bold" htmlFor="courseId">Course ID</FormLabel>
                <FormControl>
                  <Input className="border-black" id="courseId" placeholder="Course ID" {...field} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )} />
            {/* Description Field */}
            <FormField name="description" control={form.control} render={({ field, fieldState }) => (
              <FormItem className="mb-4">
                <FormLabel className="font-bold" htmlFor="description">Description</FormLabel>
                <FormControl>
                  <Input className="border-black" id="description" placeholder="Description" {...field} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )} />
            {/* Price Field */}
            <FormField name="price" control={form.control} render={({ field, fieldState }) => (
              <FormItem className="mb-4">
                <FormLabel className="font-bold" htmlFor="price">Price</FormLabel>
                <FormControl>
                  <Input className="border-black" id="price" placeholder="Price" {...field} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )} />
            <Button type="submit" className="mt-6 bg-custom-blue hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-md">
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}

export default CreatePost;