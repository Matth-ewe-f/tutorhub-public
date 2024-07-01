# Technical Documentation

## Introduction

### 1.1 Purpose
There is no current platform for Hopkins students to easily find tutors for a given course/field, or for tutors to easily advertise their services to students. Moreover, it can be difficult for tutors and students to get in touch with one another and discuss logistics (scheduling, hourly rates, accepted payments, etc.) There is a clear need for a comprehensive, user-friendly platform that facilitates seamless matchmaking between students seeking academic support and tutors offering their expertise within the Hopkins ecosystem.

### 1.2 Scope
TutorHub is a fully-fledged tutoring marketplace. It seeks to address these challenges by providing a dedicated platform specifically tailored to the Hopkins community, streamlining the process of finding, selecting, and engaging in personalized tutoring sessions and beyond. By offering intuitive search and filtering options, detailed tutor profiles, direct messaging capabilities and review forums, TutorHub aims to enhance the tutoring experience, foster collaboration, and improve learning outcomes for students while empowering tutors to effectively showcase their skills and connect with students in need. As for the quality of tutors, TutorHub itself will not have a special process of verifying the tutors. The first level of qualification comes from the fact that only Hopkins affiliated people can access this app. We aim to everage shared trust already existing in a defined community and augment it with self-reported talents from tutors. Tutors will showcase their qualification by documenting their relevant experiences, and tutees will freely pick their tutor. There will be repercussions including account ban for the repeatedly reported “scam tutors”. Long-term (beyond this semester), there is potential to expand this to be a product marketed to organizations more broadly, but we will use the Hopkins community for our current goals. Beyond tutoring services, TutorHub further aims to provide a comprehensive and inclusive discussion forum. The idea is to have a centralized hub for the exchange of technical help in an efficient and available manner.

### 1.3 Audience
Our target clients over the course of this project would be JHU affiliates. However, we are also interested in expanding to include students on other university campuses. Whether using the app as a tutor advertising one’s services, or as a tutee looking for a tutor, all users must be JHU affiliates who sign in with their Hopkins account.

## System Overview

### 2.1 Architecture

TutorHub will make use of a client-server architecture with well-defined API calls between the two. It will be a webapp with internal RESTful APIs but no public API.

### 2.2 Technologies Used

TutorHub is built with the MERN stack (using Typescript) plus some additional technologies. Our front end is built with React and Next.js, and styled with shadcn/ui and Tailwind CSS. It's deployed on Vercel. Our backend will be a RESTful API created with node and express, deployed on Render, and we'll store our data using MongoDB with Mongoose. It's tested with Cypress and Jest. Authentication is done using Clerk.

### 2.3 Dependencies

- **Express**: v4.17.1
  - *Purpose*: Fast, unopinionated, minimalist web framework for Node.js
  - *Installation*: `npm install express`

- **Mongoose**: v6.1.3
  - *Purpose*: Elegant MongoDB object modeling for Node.js
  - *Installation*: `npm install mongoose`
  
- **Clerk for Next.js**: v4.29.8
  - *Purpose*: Authentication
  - *Installation*: `npm install @clerk/nextjs`

- **Axios**: v1.6.7
  - *Purpose*: Making API requests
  - *Installation*: `npm install axios`

And various libraries offering front-end styling, which can all be installed automatically with `npm install`

### Development Dependencies

- **Jest**: v27.4.7
  - *Purpose*: JavaScript testing framework
  - *Installation*: `npm install --save-dev jest`

### Optional Dependencies

- **dotenv**: v10.0.0
  - *Purpose*: Loads environment variables from a .env file into process.env
  - *Installation*: `npm install dotenv`

### 3.1 Prerequisites

Before you begin, ensure you have met the following requirements:
- You have Node.js (version 21.6.2) and npm installed on your machine.
- You have created a MongoDB Atlas cluster for use with the app.

### 3.2 System Requirements

Before installing and running this software, ensure that your system meets the following minimum requirements:

### Operating System

- Windows 10 or later
- macOS 10.12 Sierra or later
- Ubuntu 18.04 LTS or later

### Processor

- Intel Core i5 processor or equivalent
- 2 GHz or faster CPU

### 3.3 Installation Steps

1. Clone the repository: ```git clone https://github.com/cs421sp24-homework/project-team-02.git```

2. Navigate to the frontend directory: ```cd project-team-02/client```

3. Install frontend dependencies: ```npm install```

4. Navigate to the backend directory: ```cd ../server```

5. Install backend dependencies: ```npm install```

6. Navigate to the root directiory: ```cd ..```

7. Install the root dependencies: ``` npm install ```

See the `package.json` and `package-lock.json` files.

## Configuration Guide

1. Create a .env file in the server directory. Set a variable called ATLAS_URI to the connection string (with user and pwd included) for your cluster:
   ```ATLAS_URI={YOUR_ATLAS_URI}```
   ```ATLAS_URI_TEST={YOUR_ATLAS_URI_FOR_TESTING_CLUSTER```

2. Use AWS for object storage. Create an AWS account. After establishing your root user, create a new user role called `admin` with full read and write permissions in S3. Create an access key for the admin user role. Encode this info in a file called `aws.env` in the `server` directory in the following format (note that we have omitted our access key ID and secret access key for security reasons... our adviser has received this info directly from us):

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2
AWS_BUCKET_NAME=tutorhubprofilepics
```

3. Make sure you have installed the AWS SDK (one way to do this is `npm install aws-sdk`). Note that installing all contains of the `*.json` files above on the server-side should have already sufficiently accomplished this. This will be integral for ensuring the code and S3 are able to communicate and interact.

### 4.1 Configuration Parameters

We store all of our parameters in `.env` files as noted below.

### 4.2 Environment Setup

4. Create a .env file in the client directory. Input the following variables
```NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cm9idXN0LWFzcC0yOS5jbGVyay5hY2NvdW50cy5kZXYk```
```CLERK_SECRET_KEY=sk_test_2OWFSpCmOgnQecVz10GXxrPBea3RAyxcDwcqsgCmnF```
```NEXT_PUBLIC_BACKEND_URL=http://localhost:6300```
```NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signIn```
```NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/```
```NEXT_PUBLIC_SEND_BIRD_APP_ID=18EC0121-2917-46D1-A8D6-361B1928DDED```
```NEXT_PUBLIC_SEND_BIRD_API_TOKEN=c3cbd37620b99aeb538350e6e1d4152a68a2c2d3```

Then create `aws.env` and `.env` in the server directory with the following contents:
**aws.env**:
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2
AWS_BUCKET_NAME=tutorhubprofilepics
```

**.env**:
```
ATLAS_URI=mongodb+srv://admin:B1NKvoyENFUexc1u@tutorhub.ntxpldz.mongodb.net/dev?retryWrites=true&w=majority&appName=tutorHub
ATLAS_URI_TEST=mongodb+srv://admin:B1NKvoyENFUexc1u@tutorhub.ntxpldz.mongodb.net/test?retryWrites=true&w=majority&appName=tutorHub
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-2
AWS_PROFILE_BUCKET_NAME=tutorhubprofilepics
AWS_ACTIVITY_POST_BUCKET_NAME=tutorhubactivitypostpics
AWS_COURSE_POST_BUCKET_NAME=tutorhubcoursepostpics
PORT=6300
```

### 4.3 External Services Integration

No additional steps are needed beyond what is described above

## Usage Guide

### 5.1 User Interface Overview

From our apps homepage, you can navigate to the browse page, where you will see a navigation bar at the top of the page, and a number of posts shown on the screen. You can click any post to inspect it further in a dedicated page, or use the navigation bar to see your profile, search for profiles, message other users, etc.

When viewing a post, you'll be able to read a description, see price information, see and leave reviews, etc. On a profile page, you'll see a description of the user, and can click through tabs showing you their posts, reviews, and availability. You also have the option to message or report users from their profile.

### 5.2 User Authentication

Upon visiting the site, you will be prompted to sign in via Clerk, and have the option to sign out in the navigation bar.

### 5.3 Core Functionality

Creating a Post
- You can create a post by visiting your profile and clicking the "CreatePost" button. This will take you to a form where you can input all the necessary information and publish your post
Searching for Posts
- There are multiple ways to search for posts. The primary one being a search bar which will condense the list to posts whose titles or course numbers match the entered test. You can also filter posts based on Price (High-to-Low or Low-to-High), Tag (Athletic, Music, etc), Type (Course vs Activity), and Matching Availability.

Bookmarking
- You can click the bookmark icon on a post to save it to your bookmarks, and view it again later

Editing or Deleting a Post
- You can navigate to any of your own posts and either edit or delete it by clicking the appropriate buttons

Reviewing a Post
- You can leave a review on someone else's post by navigating to that post

Searching for Profiles
- On the profile search page, you can search by both name and email.

Messaging Users
- You can directly message other users within the application. 


### 5.4 Advanced Features
Analytics
- You can see detailed analytics of your profile and your posts by navigating to your profile page or one of your posts. These analytics tell you which posts are popular, how many views they/your profile get, the demographics of your viewers, etc.

## API Documentation

### 6.1 Endpoints
#### Profiles
- POST `/profiles/`
  - Endpoint to create a new pofile  
- GET `/profiles/`
  - Endpoint to get all profiles that match the query parameters (will return all profiles if no parameters are given)
- GET `/profiles/:_id`
  - Endpoint to get a profile by their id
- GET `/profiles/getByEmail/:email`
  - Endpoint to get a profile by their email address
- PUT `/profiles/:_id`
  - Endpoint to update a profile by their id
- DELETE `/profiles/:_id`
  - Endpoint to delete a profile by their id
- PUT `/profiles/availability/:_id`
  - Endpoint to update the availability of a profile by their id
- GET `/profiles/demographics/:_id`
  - Endpoint to get a three-element JSON of counts noting the departments, affiliations, and graduation years of viewers of the profile corresponding to `_id`.
- PUT `/profiles/views/:_id`
  - Endpoint to add to the collection of View objects associated with the profile corresponding to `_id`.
- GET `/profiles/views/:_id`
  - Endpoint to get the contents of the collection of View objects associated with the profile corresponding to `_id`.
- GET `/profiles/allBookmarks/:_id`
  - Endpoint to get all of the bookmarks associated with the profile corresponding to `_id`
- PUT `/profiles/addBookmark/:_id`
  - Endpoint to add a bookmark associated with the profile corresponding to `_id`
- DELETE `/profiles/deleteBookmark/:_id`
  - Endpoint to delete a bookmark associated with the profile corresponding to `_id`
 
#### Courses
- POST `/courses/`
  - Endpoint to create a new course
- GET `/courses/findOne/:id`
  - Endpoint to get a course by its id
- GET `/courses/all`
  - Endpoint to get all courses that match the query parameters (will return all courses if no parameters are given)
- DELETE `/courses/:id`
  - Endpoint to delete a course by its id

#### Course Posts
- POST `/coursePosts/`
  - Endpoint to create a new course post
- GET `/coursePosts/`
  - Endpoint to get all course posts that match the query parameters (will return all course posts if no parameters are given)
- GET `/coursePosts/findOne/:id`
  - Endpoint to get a course post by its id
- GET `/coursePosts/findAllByUserId/:userId`
  - Endpoint to get all course posts by a specific user
- GET `/coursePosts/views:_id`
  - Endpoint to get the views of the course post corresponding to `_id`
- GET `/couresPosts/demographics/:_id`
  - Endpoint to get a three-element JSON of counts noting the departments, affiliations, and graduation years of viewers of the course post corresponding to `_id`.
- PUT `/coursePosts/:id`
  - Endpoint to update a course post by its id
- PUT `/coursePosts/views/:_id`
  - Endpoint to add to the collection of View objects associated with the course post corresponding to `_id`.
- DELETE `/coursePosts/:id`
  - Endpoint to delete a course post by its id
- GET `/coursePosts/comparePrice/:id`
  - Endpoint to analyze the price of a given course post compared to other posts
 
#### Activity Posts
- POST `/activityPosts/`
  - Endpoint for creating a new post for an activity that can contain userId, activityTitle, activityDescription, imageUrl, price, tags.
- GET `/activityPosts/findOne/:id`
  - Endpoint for retrieving an Activity Post via its id from the MongoDB collection.
- GET `/activityPosts/`
  - Endpoint for retrieving all Activity Posts in the collection
- GET `/activityPosts/views:_id`
  - Endpoint to get the views of the activity post corresponding to `_id`
- GET `/activityPosts/demographics/:_id`
  - Endpoint to get a three-element JSON of counts noting the departments, affiliations, and graduation years of viewers of the activity post corresponding to `_id`.
- PUT `/activityPosts/:id`
  - Endpoint for making an update to field(s) of an existing Activity Post in the collection via specification of the id
- PUT `/activityPosts/views/:_id`
  - Endpoint to add to the collection of View objects associated with the activity post corresponding to `_id`.
- DELETE `/activityPosts/:id`
  - Endpoint for requesting the removal of an Activity Post from the collection via specification of the id
- GET `/activityPosts/query/`
  - Endpoint for accessing Activity Posts based on query specifications related to any one or combination of userId, activitytitle, price, and tags. Expects query parameters to be provided. A simple example potential call here is `/activityposts/query?userId=tester&activityTitle=Backflipping 101`

#### All Posts
- GET `/allPosts/`
  - Endpoint for fetching all posts ever created regardless of its type (Activity vs Course), sorted by recency
- GET `/allPosts/findAllByUserId/:userId`
  - Endpoint for fetching all posts created by the user, based on the query parameter userId

#### Post Reviews
- GET `postReviews/getByProfileId/:profileId`
  - Endpoint for fetching all reviews associated with any one profile's posts ever created regardless of its type (Activity vs Course)
- GET `postReviews/getByPostId/:postId`
  - Endpoint for fetching all reviews associated with any one posts ever created regardless of its type (Activity vs Course)
- POST `postReviews/:postId`
  - Endpoint for adding to reviews field of an existing Activity or Course Post in the collection via specification of the post's id
- DELETE `/postReviews/:reviewId`
  - Endpoint for requesting the removal of a Post Review from the collection via specification of the review id

#### Reports
- POST `/reports`
  - Endpoint for adding a report to the Report Schema
- GET `/reports/findAll`
  - Endpoint for fetching all reports in the Report Schema
- GET `/reports/findOne/:id`
  - Endpoint for fetching a specific report based on its unique id
- GET `/reports/findAllByReporterId/:reporterId`
  - Endpoint for fetching all reports based on the user id of the user who has filed the reports
- GET `/reports/findAllByReporteeId/:reporteeId`
  - Endpoint for fetching all reports about the user who's user id is specified in the params as reporteeId
- PUT `/reports/resolve/:id`
  - Endpoint for updating the "resolved" status of the report
- DELETE `/reports/:id`
  - Endpoint for deleting the report by id

  
### 6.2 Request and Response Formats
#### Profiles
- POST `/profiles/`
  - Requires in request body:
    - firstName : string
    - lastName : string
    - email : string,
    - affiliation : string
    - department : string
  - Also accepts optional fields (if optional parameters not given, default is null):
    - graduationYear : string
    - description: string
  - Response Format: Profile object
    - data: {firstName : string, lastName : string, email: string, affiliation: string, graduationYear: string, department: string, description: string, profilePicKey: string, availability: [], courseBookmarks: [], activityBookmarks: [], _id: ObjectId, views: [], __v: number}
    
- GET `/profiles/`
  - Query parameters can include:
    - firstName
    - lastName
    - email
  - Response Format: Array of profile objects
    - data: [{firstName : string, lastName : string, email: string, affiliation: string, graduationYear: string, department: string, description: string, profilePicKey: string, availability: [], courseBookmarks: [], activityBookmarks: [], _id: ObjectId, views: [], __v: number}]
    
- GET `/profiles/:_id`
  - Requires in request parameters:
    - _id: string
   - Response Format: Profile object
      
- GET `/profiles/getByEmail/:email`
  - Requires in request parameters:
    - email: string
  - Response Format: Array of profile objects
    - data: [{firstName : string, lastName : string, email: string, affiliation: string, graduationYear: string, department: string, description: string, profilePicKey: string, availability: [], courseBookmarks: [], activityBookmarks: [], _id: ObjectId, views: [], __v: number}]
  
- PUT `/profiles/:_id`
  - Requires in request parameters:
    - _id: string
  - Requires in request body:
    - firstName : string
    - lastName : string
    - email : string
    - affiliation : string
    - department : string
  - Also accepts optional fields in request body:
    - graduationYear : string
    - description : string
    - posts : []
  - Response Format: Old profile object (not reflecting changes)
    - data: {firstName : string, lastName : string, email: string, affiliation: string, graduationYear: string, department: string, description: string, profilePicKey: string, availability: [], courseBookmarks: [], activityBookmarks: [], _id: ObjectId, views: [], __v: number}
      
- DELETE `/profiles/:_id`
  - Requires in request parameters:
    - _id: string
  - Response Format: Deleted profile object
    - data: {firstName : string, lastName : string, email: string, affiliation: string, graduationYear: string, department: string, description: string, profilePicKey: string, availability: [], courseBookmarks: [], activityBookmarks: [], _id: ObjectId, views: [], __v: number}
   
- PUT `/profiles/availability/:_id`
    - Requires in request parameters:
      - _id: string
    - Requires in request body:
      - availability: number[]
    - Response Format: Updated profile object
      - data: {firstName : string, lastName : string, email: string, affiliation: string, graduationYear: string, department: string, description: string, profilePicKey: string, availability: [], courseBookmarks: [], activityBookmarks: [], _id: ObjectId, views: [], __v: number}

- GET `/profiles/demographics/:_id`
  - 
  ```
  {
    {"departments": {
      {
        "_id": string,
        "count": integer
      }
    },
    "affiliations": {
      {
        "_id": string,
        "count": integer
      }
    },
    "graduationYears": {
      {
        "_id": string,
        "count": integer
      }
    }}
  }
  ```
  - Here's a specific example: 
  ```
  {
    "departments": [
        {
            "_id": "computer science",
            "count": 4
        }
    ],
    "affiliations": [
        {
            "_id": "student",
            "count": 3
        },
        {
            "_id": "faculty",
            "count": 1
        }
    ],
    "graduationYears": [
        {
            "_id": null,
            "count": 1
        },
        {
            "_id": "2024",
            "count": 2
        },
        {
            "_id": "2025",
            "count": 1
        }
    ]
  }
  ```
- PUT `/profiles/views/:_id`
  - Endpoint to add to the collection of View objects associated with the profile corresponding to `_id`. A single `View` object is contains a `viewerId` (the ID of the profile that viewed the profile corresponding to `_id`), a `timestamp` (formatted as e.g. "2024-03-28T04:00:00.582Z") indicating when the viewing action began, and `duration` (an integer number of seconds indicating how long the view lasted).
  - The response is the newly created View object to represent the view as a JSON:
  ```
  {
    "viewerId": ObjectId,
    "timestamp": string,
    "durationInSeconds": integer,
    "_id": ObjectId
  },
  ```
- GET `/profiles/views/:_id`
  - Endpoint to get the contents of the collection of View objects associated with the profile corresponding to `_id`. Like before,  single `View` object is contains a `viewerId` (the ID of the profile that viewed the profile corresponding to `_id`), a `timestamp` (formatted as e.g. "2024-03-28T04:00:00.582Z") indicating when the viewing action began, and `duration` (an integer number of seconds indicating how long the view lasted). This endpoint returns the collection of view objects for the profile corresponding to `_id`. 
  - Here's an example of the response:
  ```
  {
    "data": {
      "_id": ObjectId
      "views": [
        {
          "viewerId": ObjectId,
          "timestamp": string,
          "durationInSeconds": integer,
          "_id": ObjectId
        },
        ..., // as many records are in list
        {
          "viewerId": ObjectId,
          "timestamp": string,
          "durationInSeconds": integer,
          "_id": ObjectId
        },
      ]
    }
  }
  ```
  - An actual example for clarity:
  ```
  {
    "data": {
        "_id": "6626e7fdb923afeab7b1e1c4",
        "views": [
            {
                "viewerId": "6626e50d7948984e1f97e2b7",
                "timestamp": "2024-04-22T23:08:16.924Z",
                "durationInSeconds": 0,
                "_id": "6626ede1e73a5a769c1bbaa3"
            },
            {
                "viewerId": "6626e7fdb923afeab7b1e1c4",
                "timestamp": "2024-04-23T22:15:55.235Z",
                "durationInSeconds": 0,
                "_id": "6628331ce73a5a769c1bc213"
            },
            {
                "viewerId": "6626e50d7948984e1f97e2b7",
                "timestamp": "2024-04-23T22:33:54.486Z",
                "durationInSeconds": 0,
                "_id": "66283752e73a5a769c1bc942"
            }
        ]
    }
  }
  ```
- GET `/profiles/allBookmarks/:_id`
  - Requires in request parameters:
      - _id: string
    - Response Format: 
      - data: {_id : string, courseBookmarks : string[], activityBookmarks : string[]}
- PUT `/profiles/addBookmark/:_id`
  - Requires in request parameters:
      - _id: string
  - Requires in request body:
      - bookmark: string
      - isCourse: boolean
    - Response Format: Profile Object
      - data: {firstName : string, lastName : string, email: string, affiliation: string, graduationYear: string, department: string, description: string, profilePicKey: string, availability: [], courseBookmarks: [], activityBookmarks: [], _id: ObjectId, views: [], __v: number}
- DELETE `/profiles/deleteBookmark/:_id`
   - Requires in request parameters:
      - _id: string
  - Requires in request body:
      - bookmark: string
      - isCourse: boolean
    - Response Format: Profile Object
      - data: {firstName : string, lastName : string, email: string, affiliation: string, graduationYear: string, department: string, description: string, profilePicKey: string, availability: [], courseBookmarks: [], activityBookmarks: [], _id: ObjectId, views: [], __v: number}
#### Courses
- POST `/courses/`
  - Requires in request body:
    - courseTitle : string
    - courseNumber : string
    - courseDepartment : string[]
  - Response format: new course object
    - {_id : ObjectId, courseTitle : string, courseNumber : string, courseDepartment : string[]}
- GET `/courses/findOne/:id`
  - Query paramater must include:
    - id : string
  - Response Format:
    - {_id : ObjectId, courseTitle : string, courseNumber : string, courseDepartment : string[]}
- GET `/courses/all`
  - Optional query parameters can include:
    - courseTitle : string
    - courseNumber : string
  - Response Format: array of course objects
    - [{_id : ObjectId, courseTitle : string, courseNumber : string, courseDepartment : string[]}]
- DELETE `/courses/:id`
   - Query paramater must include:
    - id : string
  - Response Format:
    - {_id : ObjectId, courseTitle : string, courseNumber : string, courseDepartment : string[]}


#### Course Posts
- POST `/coursePosts/`
  - Requires in request body:
    - userId : string
    - userFirstName : string
    - userLastName : string
    - courseName : string
    - takenAtHopkins : boolean
  - Also accepts optional fields in request body (if parameters not given, default is null):
    - description : string
    - price : number
    - courseNumber : string
    - courseDepartment : string[]
    - gradeReceived : string
    - semesterTaken : string
    - professorTakenWith : string
    - schoolTakenAt : string
  - Response Format: Course Post Object
    - newPost : {userId : string, userFirstName : string, userLastName : string, courseName : string, description : string, price : number, courseNumber : string, courseDepartment : string[], gradeReceived : string, semesterTaken : string, professorTakenWith : string, takenAtHopkins : boolean, schoolTakenAt : string, reviews : [], views : [], _id : string, __v : number}
      
- GET `/coursePosts/`
  - Query parameters can include:
    - courseName : string
    - courseNumber : string
    - lowPrice : number
    - highPrice : number
  - Response Format: Array of Course Post objects
    - posts : [{_id : string, userId : string, userFirstName : string, userLastName : string, courseName : string, description : string, price : number, courseNumber : string, courseDepartment : string[], gradeReceived : string, semesterTaken : string, professorTakenWith : string, takenAtHopkins : boolean, schoolTakenAt : string, reviews : [], views : [], __v : number}]
    
- GET `/coursePosts/findOne/:id`
  - Requires in request parameters:
    - id : string
  -  Response Format: Course Post Object
    - post : {_id : string, userId : string, userFirstName : string, userLastName : string, courseName : string, description : string, price : number, courseNumber : string, courseDepartment : string[], gradeReceived : string, semesterTaken : string, professorTakenWith : string, takenAtHopkins : boolean, schoolTakenAt : string, reviews : [], views : [], __v : number}

- GET `/coursePosts/findAllByUserId/:userId`
  - Requires in request parameters:
    - userId : string
  - Response Format: Array of Course Post objects
    - posts : [{_id : string, userId : string, userFirstName : string, userLastName : string, courseName : string, description : string, price : number, courseNumber : string, courseDepartment : string[], gradeReceived : string, semesterTaken : string, professorTakenWith : string, takenAtHopkins : boolean, schoolTakenAt : string, reviews : [], views : [], __v : number}]


- GET `/coursePosts/demographics/:_id`
  -  Requires in request parameters:
    - _id : string
 - Query parameters can include:
   - start: string
- Response format:
 ```
  {
    {"departments": {
      {
        "_id": string,
        "count": integer
      }
    },
    "affiliations": {
      {
        "_id": string,
        "count": integer
      }
    },
    "graduationYears": {
      {
        "_id": string,
        "count": integer
      }
    }}
  }
  ```
  - Here's a specific example: 
  ```
  {
    "departments": [
        {
            "_id": "computer science",
            "count": 4
        }
    ],
    "affiliations": [
        {
            "_id": "student",
            "count": 3
        },
        {
            "_id": "faculty",
            "count": 1
        }
    ],
    "graduationYears": [
        {
            "_id": null,
            "count": 1
        },
        {
            "_id": "2024",
            "count": 2
        },
        {
            "_id": "2025",
            "count": 1
        }
    ]
  }
  ```
- PUT `/coursePosts/views/:_id`
  - Endpoint to add to the collection of View objects associated with the coursePost corresponding to `_id`. A single `View` object is contains a `viewerId` (the ID of the profile that viewed the course post), a `timestamp` (formatted as e.g. "2024-03-28T04:00:00.582Z") indicating when the viewing action began, and `duration` (an integer number of seconds indicating how long the view lasted).
  - Requires in request parameters:
    - _id : string
 - Query parameters include:
   - viewerId: string
   - timestamp: string
   - duration: number
 
  - The response is the newly created View object to represent the view as a JSON:
  ```
  {
    "viewerId": ObjectId,
    "timestamp": string,
    "durationInSeconds": integer,
    "_id": ObjectId
  },
  ```
- GET `/coursePosts/views/:_id`
  - Endpoint to get the contents of the collection of View objects associated with the course post corresponding to `_id`. Like before,  single `View` object is contains a `viewerId` (the ID of the profile that viewed the course post), a `timestamp` (formatted as e.g. "2024-03-28T04:00:00.582Z") indicating when the viewing action began, and `duration` (an integer number of seconds indicating how long the view lasted). This endpoint returns the collection of view objects for the post corresponding to `_id`.
  - Requires in request parameters:
    - _id : string
  - Here's an example of the response:
  ```
  {
    "data": {
      "_id": ObjectId
      "views": [
        {
          "viewerId": ObjectId,
          "timestamp": string,
          "durationInSeconds": integer,
          "_id": ObjectId
        },
        ..., // as many records are in list
        {
          "viewerId": ObjectId,
          "timestamp": string,
          "durationInSeconds": integer,
          "_id": ObjectId
        },
      ]
    }
  }
  ```

- PUT `/coursePosts/:id`
  - Requires in request parameters:
    - id : string
  - Requires in Request Body:
    - userId : string
    - userFirstName : string
    - userLastName : string
    - courseName : string
    - takenAtHopkins : boolean
  - Also accepts optional fields in request body:
    - description : string
    - price : number
    - courseNumber : string
    - courseDepartment : string[]
    - gradeReceived : string
    - semesterTaken : string
    - professorTakenWith : string
    - schoolTakenAt : string
  - Response Format: Old Course Post Object
    - post : {_id : string, userId : string, userFirstName : string, userLastName : string, courseName : string, description : string, price : number, courseNumber : string, courseDepartment : string[], gradeReceived : string, semesterTaken : string, professorTakenWith : string, takenAtHopkins : boolean, schoolTakenAt : string, reviews : [], views : [], __v : number}

- DELETE `/coursePosts/:id`
  - Requires in request parameters:
    - id : string
  - Response Format: Deleted Course Post Object
    - post : {_id : string, userId : string, userFirstName : string, userLastName : string, courseName : string, description : string, price : number, courseNumber : string, courseDepartment : string[], gradeReceived : string, semesterTaken : string, professorTakenWith : string, takenAtHopkins : boolean, schoolTakenAt : string, reviews : [], views : [], __v : number}
   
- GET `/coursePosts/comparePrice/:id`
	- Requires in request parameters:
	    - id : string
    - Response Format: Price Analytics Object
	    - {meanPrice : number, comparisonResult : string, myPostPrice : number, percentDiff : number, marketPosition : string}

#### Activity Posts

- POST "/activityPosts/"
  - Requires in request body:
    - userID : string
    - userFirstName : string
    - userLastName : string
    - activityTitle : string
  - Also accepts optional fields
    - activityDescription : string
    - imageUrl: string
    - price: number
    - tags: string array
  - Response Format: Activity Post object
    - data : {userId : string, userFirstName : string, userLastName : string, activityTitle : string, activityDescription? : string, imageUrl? : string, price? : number, tags? : string[], _id : string, __v : number }
   
- GET "/activityPosts/"
  - Query parameters can include:
    - userID : string
    - activityTitle : string
    - price : number
    - tags: string array
  - Response Format: Array of Activity Post objects
    - posts : [{_id : string, userId : string, userFirstName : string, userLastName : string, activityTitle : string, activityDescription : string, imageUrl : string, price : number, tags : string[],__v : number}]
   
- GET "/activityPosts/findOne/:id"
  - Requires in request parameters:
    - id : string
  -  Response Format: Activity Post Object
    - post : {_id : string, userId : string, userFirstName : string, userLastName : string, activityTitle : string, activityDescription : string, imageUrl : string, price : number, tags : string[],__v : number}

 - GET "/activityPosts/findAllByUserId/:userId"
    - Requires in request parameters:
      - userId : string
    - Response Format: Array of Activity Post objects
      - posts : [{_id : string, userId : string, userFirstName : string, userLastName : string, activityTitle : string, activityDescription : string, imageUrl : string, price : number, tags : string[],__v : number}]
   
- PUT "/activityPosts/:id"
  - Requires in request parameters:
    - id : string
  - Requires in Request Body:
    - userId : string
    - userFirstName : string
    - userLastName : string
    - activityTitle : string
  - Also accepts optional fields in request body:
    - activityDescription : string
    - imageUrl : number
    - price : string
    - tags : string[]
  - Response Format: Old Activity Post Object
    - post : {_id : string, userId : string, userFirstName : string, userLastName : string, activityTitle : string, activityDescription : string, imageUrl : number, price : string, tags : string[], __v : number}

- DELETE "/activityPosts/:id"
  - Requires in request parameters:
    - id : string
  - Response Format: "Post deleted successfully"
    - msg : {"Post deleted successfully"}
   
- GET `/activityPosts/demographics/:_id`
  -  Requires in request parameters:
    - _id : string
 - Query parameters can include:
   - start: string
- Response format:
 ```
  {
    {"departments": {
      {
        "_id": string,
        "count": integer
      }
    },
    "affiliations": {
      {
        "_id": string,
        "count": integer
      }
    },
    "graduationYears": {
      {
        "_id": string,
        "count": integer
      }
    }}
  }
  ```
  - Here's a specific example: 
  ```
  {
    "departments": [
        {
            "_id": "computer science",
            "count": 4
        }
    ],
    "affiliations": [
        {
            "_id": "student",
            "count": 3
        },
        {
            "_id": "faculty",
            "count": 1
        }
    ],
    "graduationYears": [
        {
            "_id": null,
            "count": 1
        },
        {
            "_id": "2024",
            "count": 2
        },
        {
            "_id": "2025",
            "count": 1
        }
    ]
  }
  ```
- PUT `/activityPost/views/:_id`
  - Endpoint to add to the collection of View objects associated with the activityPost corresponding to `_id`. A single `View` object is contains a `viewerId` (the ID of the profile that viewed the activity post), a `timestamp` (formatted as e.g. "2024-03-28T04:00:00.582Z") indicating when the viewing action began, and `duration` (an integer number of seconds indicating how long the view lasted).
  - Requires in request parameters:
    - _id : string
 - Query parameters include:
   - viewerId: string
   - timestamp: string
   - duration: number
 
  - The response is the newly created View object to represent the view as a JSON:
  ```
  {
    "viewerId": ObjectId,
    "timestamp": string,
    "durationInSeconds": integer,
    "_id": ObjectId
  },
  ```
- GET `/activityPosts/views/:_id`
  - Endpoint to get the contents of the collection of View objects associated with the activity post corresponding to `_id`. Like before,  single `View` object is contains a `viewerId` (the ID of the profile that viewed the activity post), a `timestamp` (formatted as e.g. "2024-03-28T04:00:00.582Z") indicating when the viewing action began, and `duration` (an integer number of seconds indicating how long the view lasted). This endpoint returns the collection of view objects for the post corresponding to `_id`.
  - Requires in request parameters:
    - _id : string
  - Here's an example of the response:
  ```
  {
    "data": {
      "_id": ObjectId
      "views": [
        {
          "viewerId": ObjectId,
          "timestamp": string,
          "durationInSeconds": integer,
          "_id": ObjectId
        },
        ..., // as many records are in list
        {
          "viewerId": ObjectId,
          "timestamp": string,
          "durationInSeconds": integer,
          "_id": ObjectId
        },
      ]
    }
  }
  ```

   
#### allPosts

- GET "/allPosts/"
  - Response Format: Post object
    - data : [{_id : string, userId : string, userFirstName : string, userLastName : string, activityTitle : string, activityDescription : string, imageUrl : string, price : number, tags : string[],__v : number}, {_id : string, userId : string, userFirstName : string, userLastName : string, courseName : string, description : string, price : number, courseNumber : string, courseDepartment : string[], gradeReceived : string, semesterTaken : string, professorTakenWith : string, takenAtHopkins : boolean, schoolTakenAt : string, __v : number}]

#### Post Reviews
- GET "postReviews/getByProfileId/:profileId"
  - Requires in request parameters:
    - profileId : string
  - Response Format: Array of Post Review Objects
    - reviews : [{postId : string, posterId : string, reviewerId : string, reviewDescription : string, rating : number,__v : number}]
- GET "postReviews/getByPostId/:postId"
  - Requires in request parameters:
    - postId : string
  - Response Format: Array of Post Objects and Array of Post Review Objects
    -  posts: [{_id : string, userId : string, activityTitle : string, activityDescription : string, imageUrl : string, price : number, tags : string[],__v : number}, {_id : string, userId : string, courseName : string, description : string, price : number, courseNumber : string, courseDepartment : string[], gradeReceived : string, semesterTaken : string, professorTakenWith : string, takenAtHopkins : boolean, schoolTakenAt : string, __v : number}]
    - reviews : [{postId : string, posterId : string, reviewerId : string, reviewDescription : string, rating : number,__v : number}]
   
- POST "postReviews/:postId"
  - Requires in request parameters:
    - postId : string
  - Response Format: Post Review Object
    - review : {postId : string, posterId : string, reviewerId : string, reviewDescription : string, rating : number,__v : number}
   
- DELETE `/postReviews/:reviewId`
  - Requires in request parameters:
    - reviewId : string
  - Response Format: "Review deleted successfully" and Post Review Object
    - message: "Review deleted successfully",
    - deletedReview : {postId : string, posterId : string, reviewerId : string, reviewDescription : string, rating : number,__v : number}

  ### Reports
- POST `/reports`
  - requires in the request body:
    - reporterId: string, reporterFirstName: string, reporterLastName: string, content: string reporteeId: string, reporteeFirstName: string, reporteeLastName: string
  - response example: 
    {
      "newReport": {
          "reporterId": "reporter-3",
          "reporterFirstName": "first-3",
          "reporterLastName": "last-3",
          "content": "this is a temp report 3",
          "reporteeId": "reportee-3",
          "reporteeFirstName": "reporteeFirstName-3",
          "reporteeLastName": "reporteeLastName-3",
          "resolved": false,
          "_id": "661c8acd64f32576541586b6",
          "__v": 0
      }
}

- GET `/reports/findAll`
  - no params required

- GET `/reports/findOne/:id`
  - requires in the request parameter: 
    - id: string, the unique _id of the report

- GET `/reports/findAllByReporterId/:reporterId`
  - requires in the request parameters:
    - reporterId: string, the reporter's unique _id (userId)

- GET `/reports/findAllByReporteeId/:reporteeId`
  - reporteeId: string, the reportee's unique _id (userId)

- PUT `/reports/resolve/:id`
  - requires in the request parameter:
    - id: string, the unique _id of the report

- DELETE `/reports/:id`
  - requires in the request parameters:
    - id: string, the unique _id of the report

### 6.3 Authentication and Authorization

Authentication and Authorization is handled exclusively with Clerk, and is not part of our API

## Database Schema

### 7.1 Entity-Relationship Diagram

Here is an ERD for TutorHub:

![](./diagrams/erd.png)

### 7.2 Table Definitions

We have six collections in our document database via MongoDB Atlas: `profiles`, `activityposts`, `courseposts`, `courses`, `postreviews`, and `reports`.
* **profiles**: tracks `_id`, `firstName`, `lastName`, `email`, `affiliation`, `department`, `descriptions`, `profilePicKey`, `graduationYear`.
* **activityposts**: tracks `_id`, `userId`, `userFirstName`, `userLastName`, `activityTitle`, `activityDescription`, `activityPostPicKey`, `price`, `tags` (an Array of strings), `reviews` (an Array of Review objects), and `views` (an Array of View Objects).
* **courseposts**: tracks `_id`, `userId`, `userFirstName`, `userLastName`, `courseName`, `description`, `price`, `courseNumber`, `courseDepartment` (an Array to permit multiple departments per course), `gradeReceived`, `semesterTaken`, `professorTakenWith`, `takenAtHopkins`, `schoolTakenAt`, `coursePostPicKey`, `reviews` (an array of Review objects), `views` (an array of View objects)
* **courses**: tracks `_id`, `courseTitle`, `courseNumber`, and `courseDepartment` (again an array for the same reason as above). All data here is based on the Hopkins public course API.
* **postreviews**: tracks `_id`, `postId`, `posterId`, `reviewerId`, `reviewDescription`, `rating` (an integer number between 1 and 5), and `isAnonymous` (boolean)
* **reports**: tracks `_id`, `reporterId`, `reporterFirstName`, `reporterLastName`, `content`, `reporteeId`, `reporteeFirstName`, `reporteeLastName`, `resolved` (boolean indicating status).

### 7.3 Relationships and Constraints

A key relationship to mention with regards to the table definitions is that anything ending with an ID is referring to a mongoose ObjectId field that implies a linking between the two colelctions. For example, the View objects for a profile or course post or activity post contain a viewer ID indicating what other profile viewed the current profile where the logging has occurred. Furthermore, `postId` and `posterId` tie post reviews to profiles. Same for `reporterId` and `reporteeId` for reports.

You will note that there are a few places where data is duplicated. We did this intentionally but not without significant thought. We duplicate some profile data in course/activity post collections to signficantly reduce the number of API calls or back-end multi-collection searching associated with browsing posts and seeing data a user would reasonably expect to see. It is a tradeoff but one that we think is well worth it for performance given the type of experience we need to deliver and structure of our application.

## Testing

### 8.1 Test Plan

#### Front-End

End to end tests are written with the Cypress testing library, in the `client/cypress/e2e` folder. Tests can be run by running the command `npm run cypress:open` in the client directory. This will launch the Cypress software and a browser in which the tests will run. Tests are written to cover the functionality of TutorHub from the users perspective, interacting with the software as they would.

#### Back-End

Our back-end tests are primarily carried out using Jest and each of our routes and general DAO functionalities are tested at a granular level to verify desired performance. We use a mix of intentionally designed objects and objects created with the help of `faker` to create examples demonstrating meaningful functionality.

#### Activity Posts:
**DAO and Data** 
See the tests in `/server/tests/routes/ActivityPostDao.tests.ts`. Note the cases encompassed:
* test create() with all fields
* test readOne() for a valid id
* test readOne() for an invalid id
* test readAll() on non empty table
* test update()
* test update() on an invalid ID
* test delete() with a valid ID
* test delete() for an invalid id

**Routes**
See approximately the first half of the tests in `/server/tests/routes/activityPosts.tests.ts`. Note the cases encompassed:
* `POST /activityPosts`
* `GET /activityPosts/findOne/:id`
* `GET /activityPosts with empty database`
* `GET /activityPosts with multiple posts`
* `PUT /activityPosts/:id`
* `DELETE /activityPosts/:id`

**Querying**
See approximately the latter half of the tests in `/server/tests/routes/activityPosts.tests.ts`. Note the cases encompassed:
* `GET /activityPosts/query for simple, one-field query`
* `GET /activityPosts/query with query featuring multiple but not all fields for single-post right answer`
* `GET /activityPosts/query with a focus on userId`
* `GET /activityPosts/query with a focus on activityTitle`
* `GET /activityPosts/query with a focus on price`
* `GET /activityPosts/query on tags where tags are not added in same order`
* `GET /activityPosts/query on tags where tags list is different but share common tag`
* `GET /activityPosts/query on multiple tags`

These tests can be run by executing `jest activityPosts.tests.ts` from the `server` directory. They will also be run, among other tests for other parts of the project, if you run `npm run test` from the `server` directory. All tests for this functionality are functioning at the time of writing.

**Profile Analytics**
* `GET /profiles/demographics/:_id with no views of profile _id`
* `GET /profiles/demographics/:_id with single view of profile _id`
* `GET /profiles/demographics/:_id with multiple views of profile _id`
* `GET /coursePosts/demographics/:_id with no views of coursePost _id`
* `GET /coursePosts/demographics/:_id with single view of profile _id`
* `GET /coursePosts/demographics/:_id with multiple views of profile _id`
* `GET /activityPosts/demographics/:_id with no views of coursePost _id`
* `GET /activityPosts/demographics/:_id with single view of profile _id`
* `GET /activityPosts/demographics/:_id with multiple views of profile _id`
* `GET demographics for invalid profile ID`
* `GET demographics for invalid profile ID with start date`
* `PUT view for bogus profile ID`
* `PUT view for bogus viewer ID and other bogus combinations`
* `GET demographics for valid profile ID with no views`

These tests are contained in `analytics.test.ts` in `/server/tests/routes/analytics.test.ts`. All pass both locally and in deployment. They can be run either with `npm run test` from `root` or using `jest --runInBand analytics.test.ts` from the `server` directory.

### 8.2 Test Results

End to end test coverage is assessed by hand, and covers the functionality of our application. All written tests are passing.

![](./diagrams/jest_coverage.jpg)

All back-end tests are passing and contain specific processing to ensure exact expected output at multiple levels. Because our object storage for images relies on external software for S3 that would require mocking in a sense different than any of our unit tests, we don't have automated tests for it but instead offer demonstrations of its validity here:

**Profile Pictures**
* `POST` a profile picture

Note here that we use the `/profilePics/upload/` endpoint with a mongoose profile object ID specified and a file associated with the key `profilePicture` in the body. We can see the response here, confirming successful posting of the picture to S3.

![](./diagrams/profilePics_POST.png)

* `PUT` a profile picture (update it)

Note here that we use the `/profilePics/update/` endpoint with a mongoose profile object ID specified and a file associated with the key `profilePicture` in the body. We also pass the S3 key to the existing image so we know where to update. We can see the response here, confirming successful update of the picture to S3.

![](./diagrams/profilePics_PUT.png)

* `GET` a profile picture

Note here that we use the `/profilePics/get/` endpoint, which takes an S3 key for the image as a specified input parameter. In the picture, you can see the key used as well as the successful response.

![](./diagrams/profilePics_GET.png)

* `DELETE` a profile picture

Note here that we use the `/profilePics/get/` endpoint, which takes the mongoose object ID of the associated profile and an S3 key for the image as a specified input parameter. The response then confirms the successful deletion.

![](./diagrams/profilePics_DELETE.png)

**Activity Post Pictures**
* `POST` an activity post picture

Note here that we use the `/activityPostPics/upload/:objectID` endpoint with a mongoose activity post object ID specified in the parameters and a file associated with the key `activityPostPicKey` in the body. We can see the response here, confirming successful posting of the picture to S3.

![](./diagrams/ActivityPostPics_POST.png)

* `PUT` an activity post picture (update it)

Note here that we use the `/activityPostPics/update/:objectID/:key` endpoint with a mongoose activity post object ID specified, a key and a file associated with the key `activityPostPicKey` in the body. We also pass the S3 key to the existing image so we know where to update. We can see the response here, confirming successful update of the picture to S3.

![](./diagrams/ActivityPostPics_PUT.png)

* `GET` an activity post picture

Note here that we use the `/activityPostPics/get/:key` endpoint, which takes an S3 key for the image as a specified input parameter. In the picture, you can see the key used as well as the successful response.

![](./diagrams/ActivityPostPics_GET.png)

* `DELETE` a profile picture

Note here that we use the `/profilePics/delete/:objectID/:key` endpoint, which takes the mongoose object ID of the associated post and an S3 key for the image as a specified input parameter. The response then confirms the successful deletion.

![](./diagrams/ActivityPostPics_DELETE.png)

### 8.3 Known Issues and Limitations
* If you have issues installing `jest` on the server-side, try performing a global installation via `npm install -g jest`. Numerous team members had issues when not doing the install globally.

## Deployment

### 9.1 Deployment Process
Our application is split into two main components: the frontend and the backend. The frontend is deployed using Vercel, which offers seamless integration with GitHub for continuous deployment. Our backend is hosted on Render, providing a robust environment for deploying containerized applications with automatic scaling.

We utilize GitHub Actions to manage our Continuous Integration and Continuous Deployment (CI/CD) pipeline. This setup automates the process of testing and deploying our codebase. Whenever a push to the repository is made, GitHub Actions triggers a workflow that runs our automated tests. If the tests pass, the workflow proceeds to deploy the corresponding changes to the frontend on Vercel and the backend on Render.

Every branch is automatically Deployed / Redeployed to Vercel when changes our pushed to the repository. 

## Support and Maintenance

### 10.1 Troubleshooting Guide

If you are going to run all tests at once, we recommend executing `jest --runInBand test_file` in the `/server` directory, where you replace `test_file` with any of the test files in the `/server/tests/data` and `/server/tests/routes` directories. Running `npm run test` at once, despite internal use of `--runInBand`, sometimes results in inconsistent behaviors, espeically if not being run from the first time. We are using a separate test database and are careful to clean up objects we create during testing. It's a bit odd, so we wanted to note it here for troubleshooting.

## Glossary

### 11.1 Terms and Definitions
* **Profile**: a profile is the central page mapping to an account where a tutor lists info like courses and talents he or she would be willing to assist with and basic personal info.
* **Post**: a listing tied to exactly one profile providing info about a course or talent that the person behind the profile would tutor. For academic courses, posts are autonomously generated from the profile. For non-academic talents, posts are created manually.
