import exp from "constants";

const router = require('express').Router();
const ActivityPostDaoClass = require('../data/ActivityPostDao');
const ActivityPostDao = new ActivityPostDaoClass();

const db = require('../model/Profile');

interface PostReview {
  postId: string;
  posterId: string;
  reviewerId: string;
  reviewDescription: string;
  rating: number;
}

router.post("/", async (req: any, res: any) => {
  try {
    const {userId, userFirstName, userLastName, activityTitle, activityDescription, activityPostPicKey, price, tags}: {userId: string, userFirstName: string, userLastName: string, activityTitle: string, activityDescription: string, activityPostPicKey: string, price: string, tags: [String]} = req.body;
    const newPost = await ActivityPostDao.create(userId, userFirstName, userLastName, activityTitle, {activityDescription, activityPostPicKey, price, tags});
    res.status(201).json({ newPost });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.get("/findOne/:id", async (req: any, res: any) => {
    const { id }: { id: number } = req.params;
    try {
      const post = await ActivityPostDao.readOne(id);
      if (!post) {
        return res.status(404).json({ msg: "Post not found" });
      }
      res.status(200).json({ post });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.get("/findAllByUserId/:userId", async (req: any, res: any ) => {
  const {userId} = req.params;
  try {
    const posts = await ActivityPostDao.readAllByUser(userId);
    res.status(200).json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/views/:_id", async (req: any, res: any) => {
  const { _id }: { _id: string } = req.params;
  try {
    const data = await ActivityPostDao.readViewsById(_id);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.get("/demographics/:_id", async (req: any, res: any) => {
  const { _id }: { _id: string} = req.params;
  const { start }: { start: string} = req.query;
  try {
    const startProfile = await ActivityPostDao.readViewsById(_id);
    if (!startProfile) {
      res.status(500).send("Profile not found. Invalid ID");
    }
    let viewerIds: any[] = [];
    try {
      viewerIds = startProfile.views
        .filter((view: { timestamp: string }) => new Date(view.timestamp) >= new Date(start))
        .map((view: { viewerId: any; }) => view.viewerId)
    }
    catch(error) { // If no views, return empty dictionaries, not an error
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
    const {userId, userFirstName, userLastName, activityTitle, activityDescription, activityPostPicKey, price, tags}: {userId: string, userFirstName: string, userLastName: string, activityTitle: string, activityDescription: string, activityPostPicKey: string, price: number, tags: string[]} = req.body;
    try {
        const post = await ActivityPostDao.update( id, userId, userFirstName, userLastName, activityTitle, {activityDescription, activityPostPicKey, price, tags} );
        if (!post) {
        return res.status(404).json({ msg: "Post not found" });
        }
        res.status(200).json({ post });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.put("/views/:_id", async (req: any, res: any) => {
  const { _id }: { _id: string } = req.params;
  const { viewerId, timestamp, duration }: { viewerId: string, timestamp: string, duration: number } = req.body; // start_time should be a date/time. duration should be a number of seconds.
  try {
    const data = await ActivityPostDao.updateViews(_id, viewerId, timestamp, duration) 
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
        const post = await ActivityPostDao.delete(id);
        if (!post) {
        return res.status(404).json({ msg: "Post not found" });
        }
        res.status(200).json({ msg: "Post deleted successfully" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.get("/", async (req: any, res: any) => {
  try {
    // Extract query parameters from the request
    try {
      const { userId, activityTitle, lowPrice, highPrice, tags } = req.query;
      // Construct options object based on the provided query parameters
      const options: any = {};
      if (userId) options.userId = userId;
      if (activityTitle) options.activityTitle = activityTitle;
      if (lowPrice) options.lowPrice = lowPrice;
      if (highPrice) options.highPrice = highPrice;
      if (tags) {
        // Split the tags parameter into an array if it contains multiple tags
        const tagArray = tags.split(',');
        // Construct a MongoDB query to check if any of the tags in the array is present in the 'tags' field
        options.tags = { $in: tagArray };
      }

      // Call the DAO method with the constructed options
      const posts = await ActivityPostDao.readSome(options);

      // Return the fetched posts
      res.status(200).json(posts);
    } catch (err) { // Case where we aren't doing a specific query
      try {
        const posts = await ActivityPostDao.readAll();
        if (posts.length === 0) {
          return res.status(404).json({ msg: "No posts found" });
        }
        res.status(200).json({ posts });
      } catch (err) {
        res.status(500).send("Server Error");
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;