"use client";
import "../../styles/global.css";
import { FC, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import CreatePost from "@/components/CreatePost";
import { useRouter } from "next/navigation";

type sisCourse = {
  courseTitle: string,
  courseNumber: string,
  courseDepartment: string[],
}

const Page : FC = () => {
	const { user } = useUser();
	const api : string = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();
  
  const [postType, setPostType] = useState("course");
  const [title, setTitle] = useState("");
  const [number, setNumber] = useState("");
  const [price, setPrice] = useState("$");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [grade, setGrade] = useState("");
  const [professor, setProfessor] = useState("");
  const [atJHU, setAtJHU] = useState("Yes");
  const [schoolName, setSchoolName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File>(null);
	const [refilling, setRefilling] = useState(false);
  const [submitText, setSubmitText] = useState("Finish");

  const [sisCourses, setSisCourses] = useState<sisCourse[]>([]);

  useEffect(() => { getProfile() }, [user]);

  const getSisCourses = async () => {
    const response = await axios.get(`${api}/courses/all`);
    setSisCourses(response.data.courses);
  }

  useEffect(() => { getSisCourses() }, []);

  const getProfile = async () => {
    if (!user) {
      return;
    }
    const email = user.primaryEmailAddress.toString();
    const response = await axios.get(`${api}/profiles/getByEmail/${email}`);
    if (response.data.data.length === 0) {
      router.replace('createAccount');
    }
  }

  const createCoursePost = async () => {
    const email = user.primaryEmailAddress.toString();
    const response = await axios.get(`${api}/profiles/getByEmail/${email}`);
    const profile = response.data.data[0];
    let body = {
      courseName: title,
      userId: profile._id,
      userFirstName: profile.firstName,
      userLastName: profile.lastName,
      courseNumber: number,
      courseDepartment: [ department ],
      takenAtHopkins: atJHU === "Yes",
    }
    if (price !== "") {
      body["price"] = price.replace(/\D/g, '');
    }
    if (semester !== "") {
      body["semesterTaken"] = semester;
    }
    if (grade !== "") {
      body["gradeReceived"] = grade;
    }
    if (atJHU && professor !== "") {
      body["professorTakenWith"] = professor;
    }
    if (!atJHU && schoolName !== "") {
      body["schoolTakenAt"] = schoolName;
    }
    if (description !== "") {
      body["description"] = description;
    }
    return await axios.post(`${api}/coursePosts`, body);
  }

  const createActivityPost = async () => {
    const email = user.primaryEmailAddress.toString();
    const response = await axios.get(`${api}/profiles/getByEmail/${email}`);
    const profile = response.data.data[0];
    let body = { 
      activityTitle: title,
      userId: profile._id,
      userFirstName: profile.firstName,
      userLastName: profile.lastName,
    }
    if (price !== "") {
      body["price"] = price.replace(/\D/g, '');
    }
    if (description !== "") {
      body["activityDescription"] = description;
    }
    if (tags.length > 0) {
      body["tags"] = tags;
    }
    const newPost = await axios.post(`${api}/activityPosts`, body);
    if (photoFile !== null) {
      const formData = new FormData();
      formData.append("activityPostPicture", photoFile);
      const photoUri = `${api}/activityPostPics/upload/${newPost.data.newPost._id}`;
      await axios.post(photoUri, formData);
    }
    return newPost;
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files)
    setPhotoFile(files[0]);
  }

  const checkAndSubmit = async () => {
    if (title === "" || (postType === "course" && 
    (number === "" || department === ""))
    || (postType === "activity" && description === "")) {
      alert('Please fill out all required fields');
      setRefilling(true);
    } else {
      setSubmitText("Loading...")
      let response;
      if (postType === "course") {
        response = await createCoursePost();
      } else {
        response = await createActivityPost();
      }
      alert(`Your ${title} post has been created!`);
      setSubmitText("Done!");
      router.replace('/profile');
    }
  }

  return <>
    <div className="flex flex-col items-center justify-center mx-24 my-24">
      <CreatePost
        sisCourses={sisCourses}
        postType={postType}
        setPostType={setPostType}
        title={title}
        setTitle={setTitle}
        number={number}
        setNumber={setNumber}
        price={price}
        setPrice={setPrice}
        department={department}
        setDepartment={setDepartment}
        semester={semester}
        setSemester={setSemester}
        grade={grade}
        setGrade={setGrade}
        professor={professor}
        setProfessor={setProfessor}
        atJHU={atJHU}
        setAtJHU={setAtJHU}
        schoolName={schoolName}
        setSchoolName={setSchoolName}
        tags={tags}
        setTags={setTags}
        description={description}
        setDescription={setDescription}
        setPhotoFile={handleFileSelected}
        refilling={refilling}
        setRefilling={setRefilling}
        submitText={submitText}
        submit={checkAndSubmit}
      />
    </div>
  </>
};

export default Page;
