
const router = require('express').Router()
// import { Request, Response } from "express";
const ProfileDao = require('../data/ProfileDao');

const profiles = new ProfileDao();

const db = require('../model/Profile');

router.post("/", async (req: any, res: any) => {
  try {    
    const {firstName, lastName, email, affiliation, graduationYear, department, description} : {firstName: string, lastName: string, email: string, affiliation: string, graduationYear: string, department: string, description: string} = req.body;
    const data = await profiles.create( firstName, lastName, email, affiliation, department, {graduationYear, description});
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.get("/", async (req: any, res: any) => {
  const {name1, name2, email} = req.query;
  try {
    const data = await profiles.readAll({firstName:name1, lastName:name2, email});
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.get("/:_id", async (req: any, res: any) => {
  const { _id }: { _id: string } = req.params;
  try {
    const data = await profiles.readById(_id);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});


router.get("/getByEmail/:email", async (req: any, res: any) => {
    const { email }: { email: string } = req.params;
    try {
      const data = await profiles.readByEmail(email);
      res.status(200).json({ data });
    } catch (err) {
      res.status(500).send("Server Error");
    }
  });

router.get("/views/:_id", async (req: any, res: any) => {
  const { _id }: { _id: string } = req.params;
  try {
    const data = await profiles.readViewsById(_id);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.get("/allBookmarks/:_id", async (req:any, res: any) => {
  const {_id} : {_id : string} = req.params;
  try {
    const data = await profiles.readBookmarksById(_id);
    res.status(200).json({data});
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.put("/addBookmark/:_id", async (req:any, res: any) => {
  const {_id} : {_id : string} = req.params;
  const {bookmark, isCourse} : {bookmark: string, isCourse: boolean} = req.body;

  try {
    const data = await profiles.updateBookmarks(_id, bookmark, isCourse);
    res.status(200).json({data});
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.put("/deleteBookmark/:_id", async (req:any, res: any) => {
  const {_id} : {_id : string} = req.params;
  const {bookmark, isCourse} : {bookmark: string, isCourse: boolean} = req.body;
  try {
    const data = await profiles.deleteBookmark(_id, bookmark, isCourse);
    res.status(200).json({data});
  } catch (err) {
    res.status(500).send("Server Error");
  }
});


router.put("/views/:_id", async (req: any, res: any) => {
  const { _id }: { _id: string } = req.params;
  const { viewerId, timestamp, duration }: { viewerId: string, timestamp: string, duration: number } = req.body; // start_time should be a date/time. duration should be a number of seconds.
  try {
    const data = await profiles.updateViews(_id, viewerId, timestamp, duration) 
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.put("/availability/:_id", async (req: any, res: any) => {
  const { _id }: { _id: string } = req.params;
  const { availability }: { availability: number[] } = req.body;
  try {
    const data = await profiles.updateAvailability(_id, availability) 
    if (!data) {
      res.status(404).json({ msg: "Profile availability update not made" });
      return;
    }
    
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).send("Server Error", err);
  }
});


router.put("/:_id", async (req: any, res: any) => {
    const { _id }: { _id: string } = req.params;
    const {firstName, lastName, email, affiliation, graduationYear, department, description} : {firstName: string, lastName: string, email: string, affiliation: string, graduationYear: string, department: string, description: string, posts: []} = req.body;
    try {

      const data = await profiles.update(_id, firstName, lastName, email, affiliation, department, {graduationYear, description});
      if (!data) {
        res.status(404).json({ msg: "User not found" });
        return;
      }
      res.status(200).json({ data });
    } catch (err) {
      res.status(500).send("Server Error");
    }
});

router.get("/demographics/:_id", async (req: any, res: any) => {
  const { _id }: { _id: string} = req.params;
  const { start }: { start: string} = req.query;
  try {
    const startProfile = await profiles.readViewsById(_id);
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

router.delete("/:_id", async (req: any, res: any) => {
    const {_id}: {_id: string } = req.params;
    try {
        const data = await profiles.delete(_id);
        res.status(200).json({data})
    } catch (err) {
        res.status(500).send("Server Error");
    }
})

module.exports = router;