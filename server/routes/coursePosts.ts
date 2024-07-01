import exp from "constants";

const router = require('express').Router();
const CoursePostDaoClass = require('../data/CoursePostDao');
const CoursePostDao = new CoursePostDaoClass();
const db = require('../model/Profile');

router.post("/", async (req: any, res: any) => {
  try {
    const {userId, userFirstName, userLastName, courseName, description, price, courseNumber, courseDepartment, gradeReceived, semesterTaken, professorTakenWith, takenAtHopkins, schoolTakenAt}: {userId: string, userFirstName: string, userLastName: string, courseName: string, description: string, price: number, courseNumber: string, courseDepartment: string[], gradeReceived: string, semesterTaken: string, professorTakenWith: string, takenAtHopkins: boolean, schoolTakenAt: string} = req.body
    const newPost = await CoursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, {description, price, courseNumber, courseDepartment, gradeReceived, semesterTaken, professorTakenWith, schoolTakenAt});
    res.status(201).json({ newPost });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/findOne/:id", async (req: any, res: any) => {
    const { id }: { id: string } = req.params;
    try {
      const post = await CoursePostDao.readOne(id);
      if (!post) {
        return res.status(404).json({ msg: "Post not found" });
      }
      res.status(200).json({ post });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/", async (req: any, res: any ) => {
  const {courseName, courseNumber, lowPrice, highPrice} = req.query;
  try {
    const posts = await CoursePostDao.readAll({courseName, courseNumber, lowPrice, highPrice});
    res.status(200).json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/findAllByUserId/:userId", async (req: any, res: any ) => {
  const {userId} = req.params;
  try {
    const posts = await CoursePostDao.readAllByUser(userId);
    res.status(200).json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/views/:_id", async (req: any, res: any) => {
  const { _id }: { _id: string } = req.params;
  try {
    const data = await CoursePostDao.readViewsById(_id);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.get("/demographics/:_id", async (req: any, res: any) => {
  const { _id }: { _id: string} = req.params;
  const { start }: { start: string} = req.query;
  try {
    const startProfile = await CoursePostDao.readViewsById(_id);
    if (!startProfile) {
      res.status(500).send("Course Post not found. Invalid ID");
    }
    let viewerIds: any[] = [];
    viewerIds = startProfile.views
      .filter((view: { timestamp: string }) => new Date(view.timestamp) >= new Date(start))
      .map((view: { viewerId: any; }) => view.viewerId)
    if (!viewerIds || viewerIds.length == 0) { // If no views, return empty dictionaries, not an error
      const departments: any[] = [];
      const affiliations: any[] = [];
      const graduationYears: any[] = [];
      res.status(200).json({ departments, affiliations, graduationYears });
      return;
    }
    const filteredViewerIds = viewerIds.filter((id: { id: any; }) => id !== undefined)
    const departments = await db.aggregate( [
      {
        $match: { _id: { $in: filteredViewerIds } }
      },
      {
        $group: {
            _id: "$department",
            count: { $count:{} } 
        }
      }
    ]).exec()
    const affiliations = await db.aggregate( [
      {
        $match: { _id: { $in: filteredViewerIds } }
      },
      {
        $group: {
            _id: "$affiliation",
            count: { $count:{} }
        }
      }
    ]).exec()
    const graduationYears = await db.aggregate( [
      {
        $match: { _id: { $in: filteredViewerIds } }
      },
      {
        $group: {
            _id: "$graduationYear",
            count: { $count:{} }
        }
      }
    ]).exec()

    res.status(200).json({ departments, affiliations, graduationYears });
  } catch (err) {
    res.status(500).send("Server Error");
  }
})

router.put("/:id", async (req: any, res: any) => {
    const id : number = req.params.id;
    const {userId, userFirstName, userLastName, courseName, description, price, courseNumber, courseDepartment, gradeReceived, semesterTaken, professorTakenWith, takenAtHopkins, schoolTakenAt}: {userId: string, userFirstName: string, userLastName: string, courseName: string, description: string, price: number, courseNumber: string, courseDepartment: string[], gradeReceived: string, semesterTaken: string, professorTakenWith: string, takenAtHopkins: boolean, schoolTakenAt: string} = req.body;
    try {
        const post = await CoursePostDao.update( id, userId, userFirstName, userLastName, courseName, takenAtHopkins, {description, price, courseNumber, courseDepartment, gradeReceived, semesterTaken, professorTakenWith, schoolTakenAt} );
        if (!post) {
          return res.status(404).json({ msg: "Post not found" });
        }
        res.status(200).json({ post });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.put("/views/:_id", async (req: any, res: any) => {
  const { _id }: { _id: string } = req.params;
  const { viewerId, timestamp, duration }: { viewerId: string, timestamp: string, duration: number } = req.body; // start_time should be a date/time. duration should be a number of seconds.
  try {
    const data = await CoursePostDao.updateViews(_id, viewerId, timestamp, duration) 
    if (!data) {
      res.status(404).json({ msg: "Profile view update not made" });
      return;
    }
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.delete("/:id", async (req: any, res: any) => {
    const id : number = req.params.id;
    try {
        const post = await CoursePostDao.delete(id);
        if (!post) {
        return res.status(404).json({ msg: "Post not found" });
        }
        res.status(200).json({ post });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Modify the route to include the functionality to compare prices
router.get("/comparePrice/:id", async (req: any, res: any) => {
  const { id }: { id: string } = req.params;
  try {
      const currentPost = await CoursePostDao.readOne(id);
      if (!currentPost) {
          return res.status(404).json({ msg: "Post not found" });
      }

      const { courseNumber } = currentPost;
      const coursePosts = await CoursePostDao.readAll({ courseNumber });

      let total = 0;
      for (const post of coursePosts) {
        total += post.price;
      }
      const meanPrice = total / coursePosts.length;

      const myPostPrice = currentPost.price

      let comparisonResult;
      let percentDiff;
      let percentDiffNum;
      if (myPostPrice > meanPrice) {
        comparisonResult = "higher";
        percentDiff = (((myPostPrice - meanPrice) / meanPrice) * 100);
        percentDiffNum = Math.round( percentDiff * 1e2 ) / 1e2;
      } else if (myPostPrice < meanPrice) {
        comparisonResult = "lower";
        percentDiff = (((myPostPrice - meanPrice) / meanPrice) * 100);
        percentDiffNum = Math.round( percentDiff * 1e2 ) / 1e2;
      } else {
        comparisonResult = "same";
        percentDiff = 0;
        percentDiffNum = 0;
      }

      // Compare percentDiff to determine market position
      let marketPosition;
      if (percentDiffNum < -20) {
        marketPosition = "Great Deal!";
      } else if (percentDiffNum > 20) {
        marketPosition = "Overpriced";
      } else {
        marketPosition = "Fair";
      }

      res.status(200).json({ meanPrice, comparisonResult, myPostPrice, percentDiff, marketPosition});
  } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
  }
});

module.exports = router;