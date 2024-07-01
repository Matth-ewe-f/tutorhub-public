//server/routes/index.ts
export {}
const { Router } = require('express')
const router = Router()

//router.use('/user', require('./user'))

router.use('/courses', require('./courses'))

router.use('/coursePosts', require('./coursePosts.ts'))

router.use('/profiles', require('./profiles.ts'))

router.use('/profilePics', require('./profilePics.ts'))

router.use('/activityPosts', require('./activityPosts.ts'))

router.use('/activityPostPics', require('./activityPostPics'))

router.use('/allPosts', require('./allPosts.ts'))

router.use('/postReviews', require('./postReviews.ts'))

router.use('/reports', require('./reports.ts'))

module.exports = router;