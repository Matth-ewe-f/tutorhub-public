type ActivityPost = {
  _id: string;
  userId: string;
  activityTitle: string;
  activityDescription: string | null;
  activityPostPicKey: string | null;
  price: number | null;
  tags: string[] | null;
}

type AnalyticsData = {
  meanPrice: number;
  comparisonResult: string;
  myPostPrice: number;
  percentDiff: number;
  marketPosition: string;
}

type Availability = {
  availability: number[];
}

type CoursePost = {
  _id: string;
  userId: string;
  courseName: string;
  description: string | null;
  price: number | null;
  courseNumber: string | null;
  courseDepartment: string[] | null;
  gradeReceived: string | null;
  semesterTaken: string | null;
  professorTakenWith: string | null;
  takenAtHopkins: boolean;
  schoolTakenAt: string | null;
  coursePostPicKey: string | null;
}

type Post = {
  _id: string;
  userId: string;
  username?: string;
  activityTitle?: string;
  activityDescription?: string;
  courseName?: string;
  description?: string;
  coursePostPicKey?: string;
  activityPostPicKey?: string;
  price: number;
  courseNumber?: string;
  courseDepartment?: string[];
  gradeReceived?: string;
  semesterTaken?: string;
  professorTakenWith?: string;
  takenAtHopkins?: boolean;
  schoolTakenAt?: string;
  tags?: string[];
  reviews: Review[],
  __v: number;
}

type Profile = {
	_id : string,
	firstName : string,
	lastName : string,
	email : string,
	affiliation : string,
	department : string,
	graduationYear? : string,
	description? : string,
  profilePicKey? : string
}

type report = {
  _id: string;
  content: string,
  reporteeFirstName: string,
  reporteeLastName: string,
  reporteeId: string,
  reporterFirstName: string,
  reporterLastName: string,
  reporterId: string,
  resolved: boolean
}

type Review = {
  _id: string,
  postId: string,
  postName?: string,
  postType?: string,
  posterId: string,
  isAnonymous?: boolean,
  reviewerId: string,
  title?: string,
  reviewDescription: string,
  rating: number,
}

type sisCourse = {
  courseTitle: string,
  courseNumber: string,
  courseDepartment: string[],
}

type view = {
  viewerId: string,
  timestamp: string,
  durationInSeconds: number,
}

// types for analytics

type lineGraphPoint = { label: string, value: number }

type pieGraphPoint = { _id: string, count: number }