import { useUser } from "@clerk/nextjs";
import { ChangeEventHandler, Dispatch, FC, SetStateAction, useState } from "react";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { X } from "lucide-react";

type sisCourse = {
  courseTitle: string,
  courseNumber: string,
  courseDepartment: string[],
}

type createPostProps = {
  sisCourses?: sisCourse[],
  editing?: boolean,
  postType: string,
  setPostType: Dispatch<SetStateAction<string>>,
  title: string,
  setTitle: Dispatch<SetStateAction<string>>,
  number: string,
  setNumber: Dispatch<SetStateAction<string>>,
  price: string,
  setPrice: Dispatch<SetStateAction<string>>,
  department: string,
  setDepartment: Dispatch<SetStateAction<string>>,
  semester: string,
  setSemester: Dispatch<SetStateAction<string>>,
  grade: string,
  setGrade: Dispatch<SetStateAction<string>>,
  professor: string,
  setProfessor: Dispatch<SetStateAction<string>>,
  atJHU: string,
  setAtJHU: Dispatch<SetStateAction<string>>,
  schoolName: string,
  setSchoolName: Dispatch<SetStateAction<string>>,
  tags: string[],
  setTags: Dispatch<SetStateAction<string[]>>,
  description: string,
  setDescription: Dispatch<SetStateAction<string>>,
  setPhotoFile: ChangeEventHandler
  refilling: boolean,
  setRefilling: Dispatch<SetStateAction<boolean>>,
  submitText: string,
  submit: () => void,
}

const CreatePost : FC<createPostProps> = 
({
  editing,
  sisCourses,
  postType,
  setPostType,
  title,
  setTitle,
  number,
  setNumber,
  price,
  setPrice,
  department,
  setDepartment,
  semester,
  setSemester,
  grade,
  setGrade,
  professor,
  setProfessor,
  atJHU,
  setAtJHU,
  schoolName,
  setSchoolName,
  tags,
  setTags,
  description,
  setDescription,
  setPhotoFile,
  refilling,
  submitText,
  submit,
}) => {
	const { isLoaded } = useUser();

  const [sisAutofills, setSisAutofills] = useState<sisCourse[]>([]);
  const [realCourse, setRealCourse] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showNumberDropdown, setShowNumberDropdown] = useState(false);
  const [onCourseDropdown, setOnCourseDropdown] = useState(false);
  const [onNumberDropdown, setOnNumberDropdown] = useState(false);
  
  const inputTitle = (title : string) => {
    setTitle(title);
    setRealCourse(false);
    if (postType === "course") {
      if (sisCourses) {
        if (title === "") {
          setSisAutofills([]);
        } else {
          const filtered = sisCourses.filter((course) => {
            return course.courseTitle.toLowerCase().includes(title.toLowerCase());
          })
          setSisAutofills(filtered);
        }
      }
    }
  }

  const inputNumber = (number : string) => {
    setNumber(number);
    setRealCourse(false);
    if (postType === "course") {
      if (sisCourses) {
        if (number === "") {
          setSisAutofills([]);
        } else {
          const filtered = sisCourses.filter((course) => {
            return course.courseNumber.toLowerCase().includes(number.toLowerCase());
          })
          setSisAutofills(filtered);
        }
      }
    }
  }

  const inputPrice = (input: string) => {
    setPrice(`$${input.replace(/\D/g, '')}`);
  }

  const sisButtonClick = (input: sisCourse) => {
    setTitle(input.courseTitle);
    setNumber(input.courseNumber);
    setDepartment(createDepartmentString(input.courseDepartment))
    setRealCourse(true);
  }

  const hideCourseDropdown = async () => {
    await new Promise(r => setTimeout(r, 100));
    if (!onCourseDropdown) {
      setShowCourseDropdown(false);
    }
  }

  const hideNumberDropdown = async () => {
    await new Promise(r => setTimeout(r, 100));
    if (!onNumberDropdown) {
      setShowNumberDropdown(false);
    }
  }

  const createDepartmentString = (departments : string[]) => {
    let result = "";
    departments.forEach((s, index) => {
      result += s;
      if (index != departments.length - 1) {
        result += ", ";
      }
    });
    return result;
  }

  const addTag = (tag: string) => {
    let newTags = tags.slice();
    if (!newTags.includes(tag)) {
      newTags.push(tag);
    }
    setTags(newTags);
  }

  const removeTag = (tag: string) => {
    let newTags = tags.slice();
    const index = newTags.indexOf(tag);
    if (index !== -1) {
      newTags.splice(index, 1);
    }
    setTags(newTags);
  }

  const tagOptions = [
    "Athletic",
    "Music",
    "Cooking",
    "Performing Art",
    "Visual Art",
  ].sort();

  const getCourseDropdown = () => {
    return getAutofillDropdown(
      showCourseDropdown, setShowCourseDropdown, setOnCourseDropdown
    )
  }

  const getNumberDropdown = () => {
    return getAutofillDropdown(
      showNumberDropdown, setShowNumberDropdown, setOnNumberDropdown
    )
  }

  const getAutofillDropdown = (
    hide : boolean, hideFunction : any, onFunction: any
  ) => {
    return (
      <div 
        className={`absolute top-14 w-full max-h-60 border rounded-md
        bg-white border-gray-500 overflow-x-hidden overflow-y-scroll
        ${hide ? '' : 'hidden'}`}
      >
        { sisAutofills.length > 0 ? 
          sisAutofills.map((course) => {
            return (
              <button 
                className="px-3 py-1 hover:bg-gray-100 w-full border-b
                text-sm text-left"
                onMouseDown={ () => onFunction(true) }
                onClick={ () => sisButtonClick(course) }
                onMouseUp={ () => { hideFunction(false); onFunction(false) } }
              >
                <p className="font-bold">{ course.courseTitle }</p>
                {course.courseNumber}
              </button>
            )
          })
        :
          title === "" ?
            <></>
          :
            <div className="text-sm px-3 py-1 w-full">
              No Courses Found
            </div>
        }
      </div>
    )
  }

  return <>
    <div 
      className="bg-background flex-grow w-full max-w-4xl p-12 rounded-xl
      shadow-2xl"
    >
      <div className="flex items-center">
        <Label className="mr-4 text-lg font-bold">
          I would like to tutor a:
        </Label>
        <RadioGroup
          className="flex"
          defaultValue={ postType }
          onValueChange={ (value) => setPostType(value) }
          disabled={ editing }
        >
          <div className="flex items-center gap-0.5">
            <RadioGroupItem 
              value="course"
              id="option-course"
              className="text-lg"
            />
            <Label 
              htmlFor="option-course"
              className={`text-lg font-bold ${
                editing ? "text-gray-500" : 'cursor-pointer'
              }`}
            >
              Course
            </Label>
          </div>
          <div className="flex items-center gap-0.5">
            <RadioGroupItem
              value="activity"
              id="option-activity"
              className="text-lg"
            />
            <Label
              htmlFor="option-activity"
              className={`text-lg font-bold ${
                editing ? "text-gray-500" : 'cursor-pointer '
              }`}
            >
              Activity
            </Label>
          </div>
        </RadioGroup>
      </div>
      <hr/>
      <div className="mt-4 flex gap-x-8">
        <div className="relative flex flex-col flex-grow basis-1">
          <Label htmlFor="title">
            { postType === "course" ?
              "Course Title*"
            :
              "Activity Title*"
            }
          </Label>
          <Input
            id="title"
            className={`mt-1 ${ title.length === 0 && refilling
              ? "outline outline-red-500"
              : ''
            }`}
            disabled={editing && postType === "course"}
            placeholder="Title"
            autoComplete="off"
            value={ title }
            onChange={ (event) => inputTitle(event.target.value) }
            onFocus={ () => setShowCourseDropdown(postType === "course") }
            onBlur={ () => { hideCourseDropdown() }}
          />
          { !editing ? getCourseDropdown() : '' }
        </div>
        { postType === "course" ?
          <div className="relative flex flex-col flex-grow basis-1 z-10">
            <Label htmlFor="number">Course Number</Label>
            <Input
              id="number"
              className={`mt-1 ${ number.length === 0 && refilling
                ? "outline outline-red-500"
                : ''
              }`}
              disabled={editing}
              placeholder="Number"
              autoComplete="off"
              value={ number }
              onChange={ (event) => inputNumber(event.target.value) }
              onFocus={ () => setShowNumberDropdown(true) }
              onBlur={ () => { hideNumberDropdown() } }
            />
            { !editing ? getNumberDropdown() : '' }
          </div>
        :
          <></>
        }
      </div>
      <div className="mt-4 flex items-end gap-x-8">
        <div className="flex flex-grow basis-1 items-center">
          <Label 
            htmlFor="price"
            className="whitespace-nowrap mr-2"
          >
            Price (approx per hour):
          </Label>
          <Input
            id="price"
            className="flex-grow"
            value={price}
            onChange={(event) => inputPrice(event.target.value)}
          />
        </div>
        <div className="flex flex-col flex-grow basis-1">
          { postType === "course" ? 
            <>
              <div className="flex flex-col flex-grow basis-1">
                <Label htmlFor="department" className="mb-1">Department</Label>
                <Input
                  id="department"
                  placeholder="Department"
                  value={ department }
                  disabled={true}
                />
              </div>
            </>
          :
            <div className="flex items-baseline gap-x-1">
              <Label htmlFor="picture">Image:</Label>
              <Input
                id="picture"
                type="file"
                onChange={ setPhotoFile }
                accept="image/png, image/gif, image/jpeg"
                className="cursor-pointer"
              />
            </div>
          }
        </div>
      </div>
      { postType === "course" ?
        <>
          <div className="mt-4 flex gap-x-8">
            <div className="flex flex-col flex-grow basis-1">
              <Label htmlFor="semester">Semester Taken</Label>
              <Input
                id="semester"
                className="mt-1"
                placeholder="Semester"
                value={ semester }
                onChange={ (event) => setSemester(event.target.value) }
              />
            </div>
            <div className="flex flex-col flex-grow basis-1">
              <Label htmlFor="grade">Grade Recieved</Label>
              <Input
                id="grade"
                className="mt-1"
                placeholder="Grade"
                value={ grade }
                onChange={ (event) => setGrade(event.target.value) }
              />
            </div>
          </div>
          <div className="mt-4 flex gap-x-8">
            <div className="flex flex-col">
              <Label className="inline-block">
                Did you take this class at JHU?
              </Label>
              <RadioGroup 
                className="mt-2"
                onValueChange={ (value) => setAtJHU(value) }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="Yes"
                    id="option-yes"
                    checked={ atJHU === "Yes" ? true : false }
                  />
                  <Label htmlFor="option-yes" className="cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="No"
                    id="option-no"
                    checked={ atJHU === "No" ? true : false }
                  />
                  <Label htmlFor="option-no" className="cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>
              { atJHU === "Yes" ? 
                <div className="flex flex-col flex-grow">
                  <Label htmlFor="professor">
                    Who was your professor?
                  </Label>
                  <Input
                    id="professor"
                    className="mt-1"
                    placeholder="Professor"
                    value={ professor }
                    onChange={ (event) => setProfessor(event.target.value) }
                  />
                </div>
              :
                <div className="flex flex-col flex-grow">
                  <Label htmlFor="schoolName">
                    If you took it at another school, where?
                  </Label>
                  <Input
                    id="schoolName"
                    className="mt-1"
                    placeholder="School"
                    value={ schoolName }
                    onChange={ (event) => setSchoolName(event.target.value) }
                  />
                </div>
              }
          </div>
        </>
      :
        <>
          <div className="mt-4 flex gap-x-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shadow-sm">
                  Add Tags
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                { tagOptions.map((option) => {
                  return (
                    <DropdownMenuItem
                      key={option}
                      className="cursor-pointer"
                      onClick={ () => addTag(option) }
                    >
                      { option }
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
              <div className="flex gap-x-2 items-center">
                { tags.map((tag) => {
                  return (
                    <div 
                      className="px-3 py-1 flex items-center gap-x-1
                      bg-pageBg rounded-xl"
                      key={tag}
                    >
                      {tag}
                      <Button 
                        variant="ghost"
                        className="w-4 h-4 p-0 rounded-lg bg-slate-700
                        text-white"
                        onClick={ () => removeTag(tag) }
                      >
                        <X className="w-3 h-3"/>
                      </Button>
                    </div>
                  );
                })}
              </div>
          </div>
        </>
      }
      <Label htmlFor="description" className="inline-block mt-4">
        { postType === "course" ? 
          "Additional Information"
        :
          "Activity Description*"
        }
      </Label>
      <Textarea
        id="description"
        className={`resize-none ${ 
          description.length === 0 && refilling && postType === "activity"
          ? "outline outline-red-500"
          : ''
        }`}
        value={ description }
        placeholder={
          postType === "course" ?
            "Any additional information about your experience taking or tutoring this course"
          :
            "Description of the activity you'll be teaching"
        }
        onChange={ (event) => setDescription(event.target.value) }
      />
      <Button 
        id="submit" 
        className="text-lg mt-8 w-28"
        disabled={
          !isLoaded || submitText == "Loading..."
          || (!editing && !realCourse && postType === "course")
        }
        onClick={ submit }
      >
        { submitText }
      </Button>
    </div>
  </>
};

export default CreatePost;