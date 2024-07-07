//server/routes/index.ts
export {}
const { Router } = require('express')
const router = Router()

//router.use('/user', require('./user'))

router.use('/courses', require('./courses'))

router.use('/coursePosts', require('./coursePosts'))

router.use('/profiles', require('./profiles'))

router.use('/profilePics', require('./profilePics'))

router.use('/activityPosts', require('./activityPosts'))

router.use('/activityPostPics', require('./activityPostPics'))

router.use('/allPosts', require('./allPosts'))

router.use('/postReviews', require('./postReviews'))

router.use('/reports', require('./reports'))

module.exports = router;