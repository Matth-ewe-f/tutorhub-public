import exp from "constants";
import { AnyAaaaRecord } from "dns";

const router = require('express').Router();

const ActivityPostDaoClass = require('../data/ActivityPostDao');
const ActivityPostDao = new ActivityPostDaoClass();

const CoursePostDaoClass = require('../data/CoursePostDao');
const CoursePostDao = new CoursePostDaoClass();

const ProfileDaoClass = require('../data/ProfileDao');
const ProfileDao = new ProfileDaoClass();

router.get("/", async (req: any, res: any ) => {
    try {
        const coursePosts = await CoursePostDao.readAll({});
        const activityPosts = await ActivityPostDao.readAll({});
        
        const allPosts = [...coursePosts, ...activityPosts];

        
        allPosts.sort((a, b) => {
            const timestampA = a._id.getTimestamp().getTime();
            const timestampB = b._id.getTimestamp().getTime();
            return timestampB - timestampA;
        });

        if (allPosts.length === 0) {
            return res.status(404).json({ msg: "No posts found" });
        }
        return res.status(200).json(allPosts);
    } catch (err) {
        return res.status(500).send("Server Error");
    }
});

router.get("/findAllByUserId/:userId", async (req: any, res: any ) => {
    const {userId} = req.params;
    try {
        const coursePosts = await CoursePostDao.readAllByUser(userId);
        const activityPosts = await ActivityPostDao.readAllByUser(userId);
        const allPosts = [...coursePosts, ...activityPosts];
        allPosts.sort((a, b) => {
            const timestampA = a._id.getTimestamp().getTime();
            const timestampB = b._id.getTimestamp().getTime();
            return timestampB - timestampA;
        });
        if (allPosts.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(allPosts);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Server Error");
    }
});

router.get("/getAllAvailable/:userId", async (req: any, res: any ) => {
    const { userId }  = req.params;
    const currentUser = await ProfileDao.readById(userId);
    const currentUserAvailability = new Set(currentUser.availability);

    const allUsers = await ProfileDao.readAll({});
    let overlapUserIds: any[] = [];

    for (const user of allUsers) {
        const userAvailability = user.availability;
        for (const element of userAvailability) {
            if (currentUserAvailability.has(element)) {
                overlapUserIds.push(user._id);
                break; // Exit the loop if overlapping availability is found
            }
        }
    }

    const returnPosts: any[] = [];
    for (const userId of overlapUserIds) {
        const coursePosts = await CoursePostDao.readAllByUser(userId);
        const activityPosts = await ActivityPostDao.readAllByUser(userId);
        returnPosts.push(...coursePosts, ...activityPosts);
    }
    returnPosts.sort((a, b) => {
        const timestampA = a._id.getTimestamp().getTime();
        const timestampB = b._id.getTimestamp().getTime();
        return timestampB - timestampA;
    });

    if (returnPosts.length === 0) {
        return res.status(200).json([]);
    }
    return res.status(200).json(returnPosts);

});


module.exports = router;
