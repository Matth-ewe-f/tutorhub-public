"use client";
import "../../../../styles/global.css";
import { FC, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import CreatePost from "@/components/CreatePost";
import { useRouter } from "next/navigation";

const Page : FC = ({ params }: { params : { id: string, type: string }}) => {
	const { user } = useUser();
	const api : string = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();
  const postId = params.id;
  
  const [postType, setPostType] = useState(
    params.type === "course" ? "course" : "activity"
  );
  const [title, setTitle] = useState("");
  const [number, setNumber] = useState("");
  const [price, setPrice] = useState("$");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [grade, setGrade] = useState("");
  const [professor, setProfessor] = useState("");
  const [atJHU, setAtJHU] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
	const [refilling, setRefilling] = useState(false);
  const [photoFile, setPhotoFile] = useState<File>(null);
  const [loadedPost, setLoadedPost] = useState(false);
  const [submitText, setSubmitText] = useState("Update");
  
  useEffect(() => { getProfile() }, [user]);

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

  const loadOldPost = async () => {
    const isCourse = postType === "course";
    const route = isCourse ? "coursePosts" : "activityPosts";
    const response = await axios.get(`${api}/${route}/findOne/${postId}`);
    const post = response.data.post;
    setTitle(isCourse ? post.courseName : post.activityTitle);
    setNumber(isCourse ? post.courseNumber : "");
    post.price && setPrice(`$${post.price}`);
    isCourse && setDepartment(post.courseDepartment[0]);
    isCourse && post.semesterTaken && setSemester(post.semesterTaken);
    isCourse && post.gradeReceived && setGrade(post.gradeReceived);
    if (isCourse && post.professorTakenWith) {
      setProfessor(post.professorTakenWith);
    }
    isCourse && setAtJHU(post.takenAtHopkins ? "Yes" : "No");
    isCourse && post.schoolTakenAt && setSchoolName(post.schoolTakenAt);
    isCourse && post.description && setDescription(post.description);
    if (!isCourse && post.activityDescription) {
      setDescription(post.activityDescription);
    }
    !isCourse && post.tags && setTags(post.tags);
    setLoadedPost(true);
  }

  useEffect(() => { loadOldPost() }, []);

  if (!loadedPost) {
    return <></>;
  }

  const editCoursePost = async () => {
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
      takenAtHopkins: atJHU === "Yes"
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
    if (atJHU === "Yes" && professor !== "") {
      body["professorTakenWith"] = professor;
    }
    if (atJHU === "No" && schoolName !== "") {
      body["schoolTakenAt"] = schoolName;
    }
    if (description !== "") {
      body["description"] = description;
    }
    return await axios.put(`${api}/coursePosts/${postId}`, body);
  }

  const editActivityPost = async () => {
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
    const newPost = await axios.put(`${api}/activityPosts/${postId}`, body);
    if (photoFile !== null) {
      const formData = new FormData();
      formData.append("activityPostPicture", photoFile);
      const photoUri = `${api}/activityPostPics/upload/${postId}`;
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
        response = await editCoursePost();
      } else {
        response = await editActivityPost();
      }
      alert(`Your ${title} post has been edited!`);
      router.replace('/profile');
    }
  }

  return <>
    <div className="flex flex-col justify-center items-center my-24 mx-24">
      <CreatePost
        editing={true}
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