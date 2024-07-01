import exp from "constants";

const router = require('express').Router();
const CourseDaoClass = require('../data/CourseDao');
const CourseDao = new CourseDaoClass();

router.post("/", async (req: any, res: any) => {
  try {
    const {courseTitle, courseNumber, courseDepartment}: {courseTitle:string, courseNumber:string, courseDepartment:string[]} = req.body;
    const newCourse = await CourseDao.create(courseTitle, courseNumber, courseDepartment);
    res.status(200).json({ newCourse });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/findOne/:id", async (req: any, res: any) => {
    const { id }: { id: string } = req.params;
    try {
      const course = await CourseDao.readOne(id);
      if (!course) {
        return res.status(404).json({ msg: "Course not found" });
      }
      res.status(200).json({ course });
    } catch (err) {
        res.status(500).send("Server Error");
    }
  });


router.get("/all", async (req: any, res: any ) => {
  try {
    const {courseTitle, courseNumber, courseDepartment} = req.query;
    const courses = await CourseDao.readAll({courseTitle, courseNumber, courseDepartment});
    res.status(200).json({ courses });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.delete("/:id", async (req: any, res: any) => {
    const id : number = req.params.id;
    try {
        const course = await CourseDao.delete(id);
        if (!course) {
        return res.status(404).json({ msg: "Course not found" });
        }
        res.status(200).json({ course });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;