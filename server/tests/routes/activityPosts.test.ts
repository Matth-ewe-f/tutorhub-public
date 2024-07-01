export {}
const request = require('supertest');
const express = require('express');
const router = require('../../../server/routes/index.ts')
const activityPost = require('../../../server/model/ActivityPost'); 
const ActivityPostDaoClass = require('../../data/ActivityPostDao');
const App = require('../../../server/app.ts');
import { ObjectId } from "mongodb";

App.dbConnection(true)
const app = App.app

app.use(express.json());
app.use('/activityPosts', router);

describe('Test activityPosts routes', () => {

    // beforeEach(async () => {
    //     App.dbConnection(true)
    //     const app = App.app
    //     app.use(express.json());
    //     app.use('/activityPosts', router);
    // });
    
    // afterEach(async () => {
    //     App.close();
    // });
    
    test('POST /activityPosts', async () => {
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

        const res = await request(app)
        .post('/activityPosts')
        .send(newPostData);

        // Extract the created post ID from the response
        const postId = res.body.newPost._id;
      
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('newPost');

        // Clean up: Delete the post created during the test
        await request(app).delete(`/activityPosts/${postId}`);
    });

    test('POST /activityPosts with server error', async () => {
        // Create a post to get a valid post ID
        const newPostData = {
            // notice lack of required userID
            userFirstName: 'Ilana',
            userLastName: 'Chalom',
            activityTitle: 'Example Activity',
            activityDescription: 'Example description',
            activityPostPicKey: 'exampleactivityPostPicKey',
            price: 1,
            tags: ['exampleTag1', 'exampleTag2']
        };

        const res = await request(app)
        .post('/activityPosts')
        .send(newPostData);
      
        expect(res.status).toBe(500);
        expect(res.text).toBe("Server Error");
    });

    // Test for GET /activityPosts/findOne/:id
    test('GET /activityPosts/findOne/:id', async () => {
        const newPostData = {
            userId: 'exampleUserId',
            userFirstName: 'Katherine',
            userLastName: 'Forbes',
            activityTitle: 'Example Activity',
            activityDescription: 'Example description',
            activityPostPicKey: 'exampleactivityPostPicKey',
            price: 1,
            tags: ['exampleTag1', 'exampleTag2']
        };
        
        // Make a POST request to create the post
        const postRes = await request(app).post('/activityPosts').send(newPostData);
    
        // Extract the created post ID from the response
        const postId = postRes.body.newPost._id;

        const res = await request(app).get(`/activityPosts/findOne/${postId}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('post');
        expect(res.body.post).toEqual(expect.objectContaining({
            ...newPostData,
            tags: expect.any(Array) // Assert that 'tags' is an array
        }));

        // Clean up: Delete the post created during the test
        await request(app).delete(`/activityPosts/${postId}`);
    });

    // Test for GET /activityPosts/findOne/:id with invalid id
    test('GET /activityPosts/findOne/:id with invalid id', async () => {
        // Extract the created post ID from the response
        const postId = new ObjectId();

        const res = await request(app).get(`/activityPosts/findOne/${postId}`);

        expect(res.status).toBe(404);
        expect(res.body.msg).toBe("Post not found");
    });

    // Test for GET /activityPosts/findAllByUserId/:userId
    test('GET /activityPosts/findAllByUserId/:userId', async () => {
        const newPostData = {
            userId: 'exampleUserId',
            userFirstName: 'Katherine',
            userLastName: 'Forbes',
            activityTitle: 'Example Activity',
            activityDescription: 'Example description',
            activityPostPicKey: 'exampleactivityPostPicKey',
            price: 1,
            tags: ['exampleTag1', 'exampleTag2']
        };
        
        // Make a POST request to create the post
        const postRes = await request(app).post('/activityPosts').send(newPostData);
    
        // Extract the created post ID from the response
        const postId = postRes.body.newPost._id;
        const userId = postRes.body.newPost.userId;

        const res = await request(app).get(`/activityPosts/findAllByUserId/${userId}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('posts');
        expect(res.body.posts[0]).toEqual(expect.objectContaining({
            ...newPostData,
            tags: expect.any(Array) // Assert that 'tags' is an array
        }));

        // Clean up: Delete the post created during the test
        await request(app).delete(`/activityPosts/${postId}`);
    });

    test('GET /activityPosts/findAllByUserId/:userId with non-existing user', async () => {
        const userId = new ObjectId();

        const res = await request(app).get(`/activityPosts/findAllByUserId/${userId}`);

        expect(res.status).toBe(200);
        expect(res.body.posts).toHaveLength(0);
    });
    
    // Test for GET /activityPosts with empty database
    test('GET /activityPosts with empty database', async () => {
        await activityPost.deleteMany({});

        const res = await request(app).get('/activityPosts');
    
        expect(res.status).toBe(200);
    });

    // Test for GET /activityPosts with multiple posts in the database
    test('GET /activityPosts with multiple posts', async () => {
        await activityPost.deleteMany({});

        const example1PostData = {
            userId: 'example1UserId',
            userFirstName: 'Matthew',
            userLastName: 'Flynn',
            activityTitle: 'Example1 Activity',
            activityDescription: 'Example1 description',
            activityPostPicKey: 'example1activityPostPicKey',
            price: 1,
            tags: ['example1Tag1', 'example1Tag2']
        };

        const example2PostData = {
            userId: 'example2UserId',
            userFirstName: 'Tad',
            userLastName: 'Berkery',
            activityTitle: 'Example2 Activity',
            activityDescription: 'Example2 description',
            activityPostPicKey: 'example2activityPostPicKey',
            price: 1,
            tags: ['example2Tag1', 'example2Tag2']
        };
        
        // Make a POST request to create the post
        const postRes1 = await request(app).post('/activityPosts').send(example1PostData);
        
        // Make a POST request to create the post
        const postRes2 = await request(app).post('/activityPosts').send(example2PostData);

        const res = await request(app).get('/activityPosts');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toMatchObject(example1PostData);
        expect(res.body[1]).toMatchObject(example2PostData);
        
        const post1Id = postRes1.body.newPost._id
        const post2Id = postRes2.body.newPost._id
        await request(app).delete(`/activityPosts/${post1Id}`);
        await request(app).delete(`/activityPosts/${post2Id}`);
    });

    // Test for PUT /activityPosts/:id
    test('PUT /activityPosts/:id', async () => {
        const newPostData = {
            userId: 'exampleUserId',
            userFirstName: 'Nolan',
            userLastName: 'Fogarty',
            activityTitle: 'Example Activity',
            activityDescription: 'Example description',
            activityPostPicKey: 'exampleactivityPostPicKey',
            price: 1,
            tags: ['exampleTag1', 'exampleTag2']
        };
        
        // Make a POST request to create the post
        const postRes = await request(app).post('/activityPosts').send(newPostData);

        // Extract the created post ID from the response
        const postId = postRes.body.newPost._id;
    
        const updatedData = {
            id: postId,
            userId: 'exampleUserId',
            userFirstName: 'Ilana',
            userLastName: 'Chalom',
            activityTitle: 'Updated Title',
            activityDescription: 'Updated Description',
        };

        const finalPostData = {
            userId: 'exampleUserId',
            userFirstName: 'Ilana',
            userLastName: 'Chalom',
            activityTitle: 'Updated Title',
            activityDescription: 'Updated Description',
            activityPostPicKey: 'exampleactivityPostPicKey',
            price: 1,
            tags: ['exampleTag1', 'exampleTag2']
        };
    
        await request(app)
        .put(`/activityPosts/${postId}`)
        .send(updatedData);

        const res = await request(app).get(`/activityPosts/findOne/${postId}`);
    
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('post');
        expect(res.body.post).toEqual(expect.objectContaining({
            activityTitle: finalPostData.activityTitle,
            activityDescription: finalPostData.activityDescription,
            activityPostPicKey: finalPostData.activityPostPicKey,
            price: finalPostData.price,
            tags: finalPostData.tags
        }));

        // Clean up: Delete the post created during the test
        await request(app).delete(`/activityPosts/${postId}`);
    });

    // Test for PUT /activityPosts/:id with invalid id
    test('PUT /activityPosts/:id with invalid id', async () => {
        const newPostData = {
            userId: 'exampleUserId',
            userFirstName: 'Nolan',
            userLastName: 'Fogarty',
            activityTitle: 'Example Activity',
            activityDescription: 'Example description',
            activityPostPicKey: 'exampleactivityPostPicKey',
            price: 1,
            tags: ['exampleTag1', 'exampleTag2']
        };
        
        // Make a POST request to create the post
        const postRes = await request(app).post('/activityPosts').send(newPostData);

        // Extract the created post ID from the response
        const postId = postRes.body.newPost._id;
        const invalidPostId = 1;
    
        const updatedData = {
            id: postId,
            userId: 'exampleUserId',
            userFirstName: 'Ilana',
            userLastName: 'Chalom',
            activityTitle: 'Updated Title',
            activityDescription: 'Updated Description',
        };

        const finalPostData = {
            userId: 'exampleUserId',
            userFirstName: 'Ilana',
            userLastName: 'Chalom',
            activityTitle: 'Updated Title',
            activityDescription: 'Updated Description',
            activityPostPicKey: 'exampleactivityPostPicKey',
            price: 1,
            tags: ['exampleTag1', 'exampleTag2']
        };
    
        const res = await request(app)
        .put(`/activityPosts/${invalidPostId}`)
        .send(updatedData);
    
        expect(res.status).toBe(500);
        expect(res.text).toBe("Server Error");

        // Clean up: Delete the post created during the test
        await request(app).delete(`/activityPosts/${postId}`);
    });

    // Test for DELETE /activityPosts/:id
    test('DELETE /activityPosts/:id', async () => {
        const newPostData = {
            userId: 'exampleUserId',
            userFirstName: 'Dokyung',
            userLastName: 'Yang',
            activityTitle: 'Example Activity',
            activityDescription: 'Example description',
            activityPostPicKey: 'exampleactivityPostPicKey',
            price: 1,
            tags: ['exampleTag1', 'exampleTag2']
        };
        
        // Make a POST request to create the post
        const postRes = await request(app).post('/activityPosts').send(newPostData);

        // Extract the created post ID from the response
        const postId = postRes.body.newPost._id;
    
        const res = await request(app).delete(`/activityPosts/${postId}`);
    
        expect(res.status).toBe(200);
        expect(res.body.msg).toBe("Post deleted successfully");
    });

    // Test for GET with simple query by userId
    test('GET /activityPosts/ for simple, one-field query', async () => {
        // Clear all existing activity posts
        await activityPost.deleteMany({});
    
        // Create example data for activity posts
        const example1PostData = {
            userId: 'example1UserId',
            userFirstName: 'Kat',
            userLastName: 'Forbes',
            activityTitle: 'Example1 Activity',
            activityDescription: 'Example1 description',
            activityPostPicKey: 'example1activityPostPicKey',
            price: 1,
            tags: ['example1Tag1', 'example1Tag2']
        };
    
        const example2PostData = {
            userId: 'example2UserId',
            userFirstName: 'Kat',
            userLastName: 'Forbes',
            activityTitle: 'Example2 Activity',
            activityDescription: 'Example2 description',
            activityPostPicKey: 'example2activityPostPicKey',
            price: 1,
            tags: ['example2Tag1', 'example2Tag2']
        };
        
        // Make POST requests to create the posts
        const postRes1 = await request(app).post('/activityPosts').send(example1PostData);
        const postRes2 = await request(app).post('/activityPosts').send(example2PostData);
    
        // Make a GET request to query activity posts by userId
        const res = await request(app).get('/activityPosts?userId=example2UserId');
    
        // Assertions
        expect(res.status).toBe(200);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1); // Ensure only one post is returned
        expect(res.body[0]).toMatchObject(example2PostData); // Verify it matches contents of post that satisifes query

        // Clean up: Delete all activity posts
        await activityPost.deleteMany({});
    });
    
    // Test for GET with query featuring multiple but not all fields for single-post right answer.
    test('GET /activityPosts with query featuring multiple but not all fields for single-post right answer', async () => {
        // Clear all existing activity posts
        await activityPost.deleteMany({});
    
        // Create example data for activity posts
        const example1PostData = {
            userId: 'example1UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example1 Activity',
            activityDescription: 'Example1 description',
            activityPostPicKey: 'example1activityPostPicKey',
            price: 1,
            tags: ['example1Tag1', 'example1Tag2']
        };
    
        const example2PostData = {
            userId: 'example2UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example2 Activity',
            activityDescription: 'Example2 description',
            activityPostPicKey: 'example2activityPostPicKey',
            price: 1,
            tags: ['example2Tag1', 'example2Tag2']
        };
        
        // Make POST requests to create the posts
        const postRes1 = await request(app).post('/activityPosts').send(example1PostData);
        const postRes2 = await request(app).post('/activityPosts').send(example2PostData);
    
        // Make a GET request to query activity posts by userId
        const res = await request(app).get('/activityPosts?userId=example2UserId&activityTitle=Example2 Activity');
    
        // Assertions
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1); // Ensure only one post is returned
        expect(res.body[0]).toMatchObject(example2PostData); // Verify it matches contents of post that satisifes query

        // Clean up: Delete all activity posts
        await activityPost.deleteMany({});
    });

    // Test for GET with query for userId
    test('GET /activityPosts with a focus on userId', async () => {
        // Clear all existing activity posts
        await activityPost.deleteMany({});
    
        // Create example data for activity posts
        const example1PostData = {
            userId: 'example1UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example1 Activity',
            activityDescription: 'Example1 description',
            activityPostPicKey: 'example1activityPostPicKey',
            price: 1,
            tags: ['example1Tag1', 'example1Tag2']
        };
    
        const example2PostData = {
            userId: 'example2UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example2 Activity',
            activityDescription: 'Example2 description',
            activityPostPicKey: 'example2activityPostPicKey',
            price: 1,
            tags: ['example2Tag1', 'example2Tag2']
        };

        const example3PostData = { // will be used for case where only UserIds match
            userId: 'example2UserId', // NOTE the 2s here
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example3 Activity',
            activityDescription: 'Example3 description',
            activityPostPicKey: 'example3activityPostPicKey',
            price: 1,
            tags: ['example3Tag1', 'example3Tag2']
        };
        
        // Make POST requests to create the posts
        const postRes1 = await request(app).post('/activityPosts').send(example1PostData);
        const postRes2 = await request(app).post('/activityPosts').send(example2PostData);
        const postRes3 = await request(app).post('/activityPosts').send(example3PostData);

        // Make a GET request to query activity posts by userId
        const res = await request(app).get('/activityPosts?userId=example2UserId');
    
        // Assertions
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2); // Ensure only one post is returned
        // Remark: assumes (tolerably right now but perhaps not in time) that return order will be the same as creation order.
        expect(res.body[0]).toMatchObject(example2PostData); // Verify it matches contents of post that satisifes query
        expect(res.body[1]).toMatchObject(example3PostData); // Verify it matches contents of post that satisifes query
        // Clean up: Delete all activity posts
        await activityPost.deleteMany({});
    });

    // Test for GET with query for activityTitle
    test('GET /activityPosts with a focus on activityTitle', async () => {
        // Clear all existing activity posts
        await activityPost.deleteMany({});
    
        // Create example data for activity posts
        const example1PostData = {
            userId: 'example1UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example1 Activity',
            activityDescription: 'Example1 description',
            activityPostPicKey: 'example1activityPostPicKey',
            price: 1,
            tags: ['example1Tag1', 'example1Tag2']
        };
    
        const example2PostData = {
            userId: 'example2UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example2 Activity',
            activityDescription: 'Example2 description',
            activityPostPicKey: 'example2activityPostPicKey',
            price: 1,
            tags: ['example2Tag1', 'example2Tag2']
        };

        const example3PostData = { // will be used for case where only activityTitles match
            userId: 'example3UserId', 
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example2 Activity', // NOTE the 2s here
            activityDescription: 'Example3 description',
            activityPostPicKey: 'example3activityPostPicKey',
            price: 1,
            tags: ['example3Tag1', 'example3Tag2']
        };
        
        // Make POST requests to create the posts
        const postRes1 = await request(app).post('/activityPosts').send(example1PostData);
        const postRes2 = await request(app).post('/activityPosts').send(example2PostData);
        const postRes3 = await request(app).post('/activityPosts').send(example3PostData);

        // Make a GET request to query activity posts by userId
        const res = await request(app).get('/activityPosts?activityTitle=Example2 Activity');
    
        // Assertions
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2); // Ensure only one post is returned
        // Remark: assumes (tolerably right now but perhaps not in time) that return order will be the same as creation order.
        expect(res.body[0]).toMatchObject(example2PostData); // Verify it matches contents of post that satisifes query
        expect(res.body[1]).toMatchObject(example3PostData); // Verify it matches contents of post that satisifes query
        // Clean up: Delete all activity posts
        await activityPost.deleteMany({});
    });

    // Test for GET with query for price
    test('GET /activityPosts with a focus on price', async () => {
        // Clear all existing activity posts
        await activityPost.deleteMany({});
    
        // Create example data for activity posts
        const example1PostData = {
            userId: 'example1UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example1 Activity',
            activityDescription: 'Example1 description',
            activityPostPicKey: 'example1activityPostPicKey',
            price: 1,
            tags: ['example1Tag1', 'example1Tag2']
        };
    
        const example2PostData = {
            userId: 'example2UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example2 Activity',
            activityDescription: 'Example2 description',
            activityPostPicKey: 'example2activityPostPicKey',
            price: 2,
            tags: ['example2Tag1', 'example2Tag2']
        };

        const example3PostData = { // will be used for case where only price matches
            userId: 'example3UserId', 
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example3 Activity',
            activityDescription: 'Example3 description',
            activityPostPicKey: 'example3activityPostPicKey',
            price: 2, // NOTE the 2s here
            tags: ['example3Tag1', 'example3Tag2']
        };
        
        // Make POST requests to create the posts
        const postRes1 = await request(app).post('/activityPosts').send(example1PostData);
        const postRes2 = await request(app).post('/activityPosts').send(example2PostData);
        const postRes3 = await request(app).post('/activityPosts').send(example3PostData);

        // Make a GET request to query activity posts by userId
        const res = await request(app).get('/activityPosts?price=2');
    
        // Assertions
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3); // Ensure only one post is returned
        // Remark: assumes (tolerably right now but perhaps not in time) that return order will be the same as creation order.
        expect(res.body[0]).toMatchObject(example1PostData); // Verify it matches contents of post that satisifes query
        expect(res.body[1]).toMatchObject(example2PostData); // Verify it matches contents of post that satisifes query
        expect(res.body[2]).toMatchObject(example3PostData); // Verify it matches contents of post that satisifes query
        // Clean up: Delete all activity posts
        await activityPost.deleteMany({});
    });

    // Test for GET with query for tags where tags are not added in same order
    test('GET /activityPosts on tags where tags are not added in same order', async () => {
        // Clear all existing activity posts
        await activityPost.deleteMany({});
    
        // Create example data for activity posts
        const example1PostData = {
            userId: 'example1UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example1 Activity',
            activityDescription: 'Example1 description',
            activityPostPicKey: 'example1activityPostPicKey',
            price: 1,
            tags: ['example2Tag2', 'example1Tag1'] // Note the 2 but ONLY for Tag2
        };
    
        const example2PostData = {
            userId: 'example2UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example2 Activity',
            activityDescription: 'Example2 description',
            activityPostPicKey: 'example2activityPostPicKey',
            price: 2,
            tags: ['example2Tag1', 'example2Tag2']
        };

        const example3PostData = { // will be used for case where only price matches
            userId: 'example3UserId', 
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example3 Activity',
            activityDescription: 'Example3 description',
            activityPostPicKey: 'example3activityPostPicKey',
            price: 2,
            tags: ['example3Tag1', 'example3Tag2']
        };
        
        // Make POST requests to create the posts
        const postRes1 = await request(app).post('/activityPosts').send(example1PostData);
        const postRes2 = await request(app).post('/activityPosts').send(example2PostData);
        const postRes3 = await request(app).post('/activityPosts').send(example3PostData);

        const res = await request(app).get('/activityPosts?tags=example2Tag2');
    
        // Assertions
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2); // Ensure only one post is returned
        // Remark: assumes (tolerably right now but perhaps not in time) that return order will be the same as creation order.
        expect(res.body[0]).toMatchObject(example1PostData); // Verify it matches contents of post that satisifes query
        expect(res.body[1]).toMatchObject(example2PostData); // Verify it matches contents of post that satisifes query
        // Clean up: Delete all activity posts
        await activityPost.deleteMany({});
    });

    // Test for GET with query for tags
    test('GET /activityPosts on tags where tags list is different but share common tag', async () => {
        // Clear all existing activity posts
        await activityPost.deleteMany({});
    
        // Create example data for activity posts
        const example1PostData = {
            userId: 'example1UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example1 Activity',
            activityDescription: 'Example1 description',
            activityPostPicKey: 'example1activityPostPicKey',
            price: 1,
            tags: ['example2Tag2', 'example1Tag1'] // Note the 2 but ONLY for Tag2
        };
    
        const example2PostData = {
            userId: 'example2UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example2 Activity',
            activityDescription: 'Example2 description',
            activityPostPicKey: 'example2activityPostPicKey',
            price: 2,
            tags: ['example4Tag1', 'example2Tag2'] // Note the 4
        };

        const example3PostData = { // will be used for case where only price matches
            userId: 'example3UserId', 
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example3 Activity',
            activityDescription: 'Example3 description',
            activityPostPicKey: 'example3activityPostPicKey',
            price: 2,
            tags: ['example3Tag1', 'example3Tag2']
        };
        
        // Make POST requests to create the posts
        const postRes1 = await request(app).post('/activityPosts').send(example1PostData);
        const postRes2 = await request(app).post('/activityPosts').send(example2PostData);
        const postRes3 = await request(app).post('/activityPosts').send(example3PostData);

        const res = await request(app).get('/activityPosts?tags=example2Tag2');
    
        // Assertions
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2); // Ensure only one post is returned
        // Remark: assumes (tolerably right now but perhaps not in time) that return order will be the same as creation order.
        expect(res.body[0]).toMatchObject(example1PostData); // Verify it matches contents of post that satisifes query
        expect(res.body[1]).toMatchObject(example2PostData); // Verify it matches contents of post that satisifes query
        // Clean up: Delete all activity posts
        await activityPost.deleteMany({});
    });

    // Test for GET with query containing multiple tags
    // REMARK: searching mulitiple tags (say tags A and B) yields all records with tag A, tag B, or both tag A and B
    test('GET /activityPosts on multiple tags', async () => {
        // Clear all existing activity posts
        await activityPost.deleteMany({});
    
        // Create example data for activity posts
        const example1PostData = {
            userId: 'example1UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example1 Activity',
            activityDescription: 'Example1 description',
            activityPostPicKey: 'example1activityPostPicKey',
            price: 1,
            tags: ['example1Tag1', 'example1Tag2']
        };
    
        const example2PostData = {
            userId: 'example2UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example2 Activity',
            activityDescription: 'Example2 description',
            activityPostPicKey: 'example2activityPostPicKey',
            price: 2,
            tags: ['example1Tag1', 'example1Tag2', 'example1Tag3'] // Note the introduction of example1Tag3 (different than before and query)
        };

        const example3PostData = { // will be used for case where only price matches
            userId: 'example3UserId', 
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example3 Activity',
            activityDescription: 'Example3 description',
            activityPostPicKey: 'example3activityPostPicKey',
            price: 2,
            tags: ['example1Tag1', 'example3Tag2'] // Note that only example1Tag1 is in common with prior examples
        };
        
        // Make POST requests to create the posts
        const postRes1 = await request(app).post('/activityPosts').send(example1PostData);
        const postRes2 = await request(app).post('/activityPosts').send(example2PostData);
        const postRes3 = await request(app).post('/activityPosts').send(example3PostData);

        const res = await request(app).get('/activityPosts?tags=example1Tag1,example1Tag2');
    
        // Assertions
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3); // Ensure only one post is returned
        // Remark: assumes (tolerably right now but perhaps not in time) that return order will be the same as creation order.
        expect(res.body[0]).toMatchObject(example1PostData); // Verify it matches contents of post that satisifes query
        expect(res.body[1]).toMatchObject(example2PostData); // Verify it matches contents of post that satisifes query
        expect(res.body[2]).toMatchObject(example3PostData); // Verify it matches contents of post that satisifes query
        // Clean up: Delete all activity posts
        await activityPost.deleteMany({});
    });

    // Test for GET with no specific query
    test('GET /activityPosts with no specific query', async () => {
        // Clear all existing activity posts
        await activityPost.deleteMany({});
    
        // Create example data for activity posts
        const example1PostData = {
            userId: 'example1UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example1 Activity',
            activityDescription: 'Example1 description',
            activityPostPicKey: 'example1activityPostPicKey',
            price: 1,
            tags: ['example1Tag1', 'example1Tag2']
        };
    
        const example2PostData = {
            userId: 'example2UserId',
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example2 Activity',
            activityDescription: 'Example2 description',
            activityPostPicKey: 'example2activityPostPicKey',
            price: 2,
            tags: ['example2Tag1', 'example2Tag2']
        };

        const example3PostData = {
            userId: 'example3UserId', 
            userFirstName: 'exampleName',
            userLastName: 'exampleName',
            activityTitle: 'Example3 Activity',
            activityDescription: 'Example3 description',
            activityPostPicKey: 'example3activityPostPicKey',
            price: 2, // NOTE the 2s here
            tags: ['example3Tag1', 'example3Tag2']
        };
        
        // Make POST requests to create the posts
        const postRes1 = await request(app).post('/activityPosts').send(example1PostData);
        const postRes2 = await request(app).post('/activityPosts').send(example2PostData);
        const postRes3 = await request(app).post('/activityPosts').send(example3PostData);

        // Make a GET request to query activity posts by userId
        const res = await request(app).get('/activityPosts');
    
        // Assertions
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3);
        // Remark: assumes (tolerably right now but perhaps not in time) that return order will be the same as creation order.
        expect(res.body[0]).toMatchObject(example1PostData); // Verify it matches contents of post that satisifes query
        expect(res.body[1]).toMatchObject(example2PostData); // Verify it matches contents of post that satisifes query
        expect(res.body[2]).toMatchObject(example3PostData); // Verify it matches contents of post that satisifes query
        // Clean up: Delete all activity posts
        await activityPost.deleteMany({});
    });

    afterAll(async () => {
        await App.close(); // Close the MongoDB connection
    });
});