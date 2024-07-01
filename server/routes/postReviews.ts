import exp from "constants";

const router = require('express').Router();
const ProfileDaoClass = require('../data/ProfileDao');
const ProfileDao = new ProfileDaoClass();

const ActivityPostDaoClass = require('../data/ActivityPostDao');
const ActivityPostDao = new ActivityPostDaoClass();

const CoursePostDaoClass = require('../data/CoursePostDao');
const CoursePostDao = new CoursePostDaoClass();

const PostReviewDaoClass = require('../data/PostReviewDao');
const PostReviewDao = new PostReviewDaoClass();

const PostReview = require("../model/PostReview.ts");
const PostReviewSchema = PostReview.schema;

router.get('/getByProfileId/:profileId', async (req: any, res: any) => {
    try {
        const profileId =  req.params.profileId;
        // Fetch the profile by ID
        const profile = await ProfileDao.readById(req.params.profileId);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const coursePosts = await CoursePostDao.readAllByUser(profileId);
        const activityPosts = await ActivityPostDao.readAllByUser(profileId);
        const allPosts = [...coursePosts, ...activityPosts];

        if (allPosts.length === 0) {
            return res.status(200).json([]);
        }

        const allReviews = [];
        for (const post of allPosts) {
            const reviews = await PostReviewDao.readAllByPostId(post._id);
            if (reviews && reviews.length > 0) {
                allReviews.push(...reviews);
            }
        }

        if (allReviews.length === 0) {
            return res.status(200).json([]);
        }

        // Return all reviews
        res.status(200).json(allReviews);

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
       

router.get('/getByPostId/:postId', async (req: any, res: any) => {
    try {
        // Fetch the post by ID
        let post = await ActivityPostDao.readOne(req.params.postId);
         if (!post) {
            // If the activity post is not found, try fetching the course post
            post = await CoursePostDao.readOne(req.params.postId);
            if (!post) {
                // If neither activity nor course post is found, return a 404 error
                return res.status(404).json({ error: 'Post not found' });
            }
        }

        // Fetch the reviews associated with the current post
        const reviews = await PostReviewDao.readAllByPostId(post._id);

        // Send the reviews as a response
        res.json({reviews});

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/:postId', async (req: any, res:any) => {
    try {
        const { postId, posterId, reviewerId, reviewDescription, rating, isAnonymous }: {postId: string, posterId: string, reviewerId: string, reviewDescription: string, rating: number, isAnonymous: boolean} = req.body;

        const newPostReview = await PostReviewDao.create(postId, posterId, reviewerId, reviewDescription, rating, isAnonymous);

        // Fetch the post by ID
        let post = await ActivityPostDao.readOne(req.params.postId);
        if (!post) {
            // If the activity post is not found, try fetching the course post
            post = await CoursePostDao.readOne(req.params.postId);
            if (!post) {
                // If neither activity nor course post is found, return a 404 error
                return res.status(404).json({ error: 'Post not found' });
            } else {
                post = await CoursePostDao.update(post._id, post.userId, post.userFirstName, post.userLastName, post.courseName, post.takenAtHopkins, { reviews: [...post.reviews, newPostReview] });
            }
        } else {
            post = await ActivityPostDao.update(post._id, post.userId, post.userFirstName, post.userLastName, post.activityTitle, { reviews: [...post.reviews, newPostReview] });
        }

        res.status(201).json({ review: newPostReview });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:reviewId', async (req: any, res: any) => {
    try {
        const reviewId = req.params.reviewId;

        // Check if the review exists
        const review = await PostReviewDao.readOne(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Fetch the post associated with the review
        let post = await ActivityPostDao.readOne(review.postId);
        if (!post) {
            // If the activity post is not found, try fetching the course post
            post = await CoursePostDao.readOne(review.postId);
            if (!post) {
                // If neither activity nor course post is found, return a 404 error
                return res.status(404).json({ error: 'Post not found' });
            } else {
                // Remove the review from the post's reviews array
                post.reviews = post.reviews.filter((review: { _id: { toString: () => any; }; }) => review._id.toString() !== reviewId);
                post = await CoursePostDao.update(post._id, post.userId, post.userFirstName, post.userLastName, post.courseName, post.takenAtHopkins, { reviews: post.reviews });
            }
        } else {
            post.reviews = post.reviews.filter((review: { _id: { toString: () => any; }; }) => review._id.toString() !== reviewId);
            post = await ActivityPostDao.update(post._id, post.userId, post.userFirstName, post.userLastName, post.activityTitle, { reviews: post.reviews });
        }

        // Delete the review
        const deletedReview = await PostReviewDao.delete(reviewId);
        res.json({ message: 'Review deleted successfully', deletedReview });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;