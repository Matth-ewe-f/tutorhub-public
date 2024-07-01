export {}
const request = require('supertest');
const express = require('express');
const App = require('../../../server/app.ts')
const router = require('../../../server/routes/index.ts')
const PostReviewSchema = require('../../model/PostReview');
const ProfileSchema = require('../../model/Profile');
const coursePost = require('../../../server/model/CoursePost'); 
const activityPost = require('../../../server/model/ActivityPost'); 
const { ObjectId } = require('mongodb');

App.dbConnection(true)
const app = App.app

describe('Test postReviews routes', () => {

    // Test for GET /getByProfileId/:profileId with empty database
    test('GET /postReviews/getByProfileId/:profileId with empty database', async () => {
        await ProfileSchema.deleteMany({});

        const profileId = '65f37b3c888c108c2bddff9f';

        const res = await request(app).get(`/postReviews/getByProfileId/${profileId}`);

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Profile not found');
        await PostReviewSchema.deleteMany({});
    });

    // Test for GET /getByProfileId/:profileId with no reviews
    test('GET /postReviews/getByProfileId/:profileId with no reviews', async () => {
        await ProfileSchema.deleteMany({});

        const newProfileData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
            affiliation: 'Faculty',
            graduationYear: '2023',
            department: 'Computer Science',
            description: 'I am a computer science student with a passion for coding.'
        };

        const resProfile = await request(app)
            .post('/profiles')
            .send(newProfileData);

        const profileId = resProfile.body.data._id;

        const res = await request(app).get(`/postReviews/getByProfileId/${profileId}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
        await PostReviewSchema.deleteMany({});
    });

    // Test for GET /getByProfileId/:profileId with some reviews
    test('GET /postReviews/getByProfileId/:profileId with some reviews', async () => {
        await ProfileSchema.deleteMany({});

        const newProfileData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
            affiliation: 'Faculty',
            graduationYear: '2023',
            department: 'Computer Science',
            description: 'I am a computer science student with a passion for coding.'
        };

        const resProfile = await request(app)
            .post('/profiles')
            .send(newProfileData);

        const profileId = resProfile.body.data._id;

        // Create a post to get a valid post ID
        const newPostData = {
            userId: profileId,
            userFirstName: 'Ilana',
            userLastName: 'Chalom',
            courseName: 'Intro to Example',
            description: 'Example description',
            price: 20,
            courseNumber: "AS.000.000",
            takenAtHopkins: true
        };

        const resPost = await request(app)
        .post('/coursePosts')
        .send(newPostData);

        // Extract the created post ID from the response
        const postId = resPost.body.newPost._id;

        // Create a test review
        const newReview = await PostReviewSchema.create({
            postId: postId,
            posterId: profileId,
            reviewerId: new ObjectId(),
            reviewDescription: 'Test review',
            rating: 5,
            isAnonymous: false
        });

        const res = await request(app).get(`/postReviews/getByProfileId/${profileId}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        await PostReviewSchema.deleteMany({});
    });


    // Test for GET /postReviews/getByPostId/:postId with empty database
    test('GET /postReviews/getByPostId/:postId with empty database', async () => {
        await PostReviewSchema.deleteMany({});

        const postId = '65f37b3c888c108c2bddff9f';

        const res = await request(app).get(`/postReviews/getByPostId/${postId}`);

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Post not found');
        await PostReviewSchema.deleteMany({});
    });

    // Test for DELETE /postReviews/:reviewId with a course post
    test('DELETE /postReviews/:reviewId with course post', async () => {

        // Create a post to get a valid post ID
        const newPostData = {
            userId: 'exampleUserId',
            userFirstName: 'Ilana',
            userLastName: 'Chalom',
            courseName: 'Intro to Example',
            description: 'Example description',
            price: 20,
            courseNumber: "AS.000.000",
            takenAtHopkins: true
        };

        const resPost = await request(app)
        .post('/coursePosts')
        .send(newPostData);

        // Extract the created post ID from the response
        const postId = resPost.body.newPost._id;

        // Create a test review
        const newReview = await PostReviewSchema.create({
            postId: postId,
            posterId: new ObjectId(),
            reviewerId: new ObjectId(),
            reviewDescription: 'Test review',
            rating: 5,
            isAnonymous: false
        });

        // Make a DELETE request to delete the review
        const resReview = await request(app).delete(`/postReviews/${newReview._id}`);

        // Check the response
        expect(resReview.status).toBe(200);
        expect(resReview.body.message).toBe('Review deleted successfully');
        expect(resReview.body.deletedReview._id).toBe(newReview._id.toString());

        // Check if the review was actually deleted from the database
        const deletedReview = await PostReviewSchema.findById(newReview._id);
        expect(deletedReview).toBeNull();

        await coursePost.deleteMany({});
    });

    // Test for POST /postReviews/:postId with a valid request
    test('POST /postReviews/:postId with a valid request', async () => {
        // Create a post to get a valid post ID
        const newPostData = {
            userId: 'exampleUserId',
            userFirstName: 'Ilana',
            userLastName: 'Chalom',
            activityTitle: 'Example Activity',
            activityDescription: 'Example description',
            activityPostPicKey: 'exampleactivityPostPicKey',
            price: 1,
            tags: ['exampleTag1', 'exampleTag2']
        };

        const resPost = await request(app)
            .post('/activityPosts')
            .send(newPostData);

        // Extract the created post ID from the response
        const postId = resPost.body.newPost._id;

        // Create a mock review data
        const reviewData = {
            postId: postId,
            posterId: new ObjectId(),
            reviewerId: new ObjectId(),
            reviewDescription: 'Test review',
            rating: 5,
            isAnonymous: false
        };

        // Make a POST request to create a new review
        const res = await request(app)
            .post(`/postReviews/${postId}`)
            .send(reviewData);

        // Check the response
        expect(res.status).toBe(201);
        expect(res.body.review.postId).toBe(postId);
        expect(res.body.review.reviewDescription).toBe('Test review');
    });

    // Test for POST /postReviews/:postId with invalid request data
    test('POST /postReviews/:postId with invalid request data', async () => {
        // Make a POST request with missing fields
        const res = await request(app)
            .post('/postReviews/invalidPostId')
            .send({});

        // Check the response
        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Internal server error');
    });


    // Test for DELETE /postReviews/:reviewId with an activity post
    test('DELETE /postReviews/:reviewId with activity post', async () => {

        // Create a post to get a valid post ID
        const newPostData = {
            userId: 'exampleUserId',
            userFirstName: 'Ilana',
            userLastName: 'Chalom',
            activityTitle: 'Example Activity',
            activityDescription: 'Example description',
            activityPostPicKey: 'exampleactivityPostPicKey',
            price: 1,
            tags: ['exampleTag1', 'exampleTag2']
        };

        const resPost = await request(app)
        .post('/activityPosts')
        .send(newPostData);

        // Extract the created post ID from the response
        const postId = resPost.body.newPost._id;

        // Create a test review
        const newReview = await PostReviewSchema.create({
            postId: postId,
            posterId: new ObjectId(),
            reviewerId: new ObjectId(),
            reviewDescription: 'Test review',
            rating: 5,
            isAnonymous: false
        });

        // Make a DELETE request to delete the review
        const resReview = await request(app).delete(`/postReviews/${newReview._id}`);

        // Check the response
        expect(resReview.status).toBe(200);
        expect(resReview.body.message).toBe('Review deleted successfully');
        expect(resReview.body.deletedReview._id).toBe(newReview._id.toString());

        // Check if the review was actually deleted from the database
        const deletedReview = await PostReviewSchema.findById(newReview._id);
        expect(deletedReview).toBeNull();

        await activityPost.deleteMany({});
    });

    // Test for DELETE /postReviews/:reviewId with a course post
    test('DELETE /postReviews/:reviewId with course post', async () => {

        // Create a post to get a valid post ID
        const newPostData = {
            userId: 'exampleUserId',
            userFirstName: 'Ilana',
            userLastName: 'Chalom',
            courseName: 'Intro to Example',
            description: 'Example description',
            price: 20,
            courseNumber: "AS.000.000",
            takenAtHopkins: true
        };

        const resPost = await request(app)
        .post('/coursePosts')
        .send(newPostData);

        // Extract the created post ID from the response
        const postId = resPost.body.newPost._id;

        // Create a test review
        const newReview = await PostReviewSchema.create({
            postId: postId,
            posterId: new ObjectId(),
            reviewerId: new ObjectId(),
            reviewDescription: 'Test review',
            rating: 5,
            isAnonymous: false
        });

        // Make a DELETE request to delete the review
        const resReview = await request(app).delete(`/postReviews/${newReview._id}`);

        // Check the response
        expect(resReview.status).toBe(200);
        expect(resReview.body.message).toBe('Review deleted successfully');
        expect(resReview.body.deletedReview._id).toBe(newReview._id.toString());

        // Check if the review was actually deleted from the database
        const deletedReview = await PostReviewSchema.findById(newReview._id);
        expect(deletedReview).toBeNull();

        await activityPost.deleteMany({});
    });

    // Test for DELETE /postReviews/:reviewId when post associated with review is not found
    test('DELETE /postReviews/:reviewId when post associated with review is not found', async () => {
        // Create a mock review
        const newReview = await PostReviewSchema.create({
            postId: 'invalidPostId',
            posterId: new ObjectId(),
            reviewerId: new ObjectId(),
            reviewDescription: 'Test review',
            rating: 5,
            isAnonymous: false
        });

        // Make a DELETE request to delete the review
        const resReview = await request(app).delete(`/postReviews/${newReview._id}`);

        // Check the response
        expect(resReview.status).toBe(500);
        expect(resReview.body.error).toBe('Internal server error');
    });


    // Test for DELETE /postReviews/:reviewId when review does not exist
    test('DELETE /postReviews/:reviewId when review does not exist', async () => {
        // Make a DELETE request with a non-existent review ID
        const res = await request(app).delete(`/postReviews/${new ObjectId()}`);

        // Check the response
        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Review not found');
    });

    afterAll(async () => {
        await App.close(); // Close the MongoDB connection
    });
    
});
