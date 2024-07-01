import { ObjectId } from "mongodb";

require('dotenv').config()
const PostReviewDao = require('../../data/PostReviewDao');
const PostReviewSchema = require('../../model/PostReview');
const {faker} = require('@faker-js/faker');
const mg = require("mongoose");
const URI = process.env.ATLAS_URI_TEST

beforeAll(async () => {
    await mg.connect(URI);
    await PostReviewSchema.deleteMany({});
});

afterAll(async () => {
    await PostReviewSchema.deleteMany({});
    await mg.connection.close();
});

test('test create() with all fields', async ()=> {
    const postReviewDao = new PostReviewDao();
    await mg.connect(URI);
    const postId = String(faker.number.int());
    const posterId = String(faker.number.int());
    const reviewerId = String(faker.number.int());
    const reviewDescription =  faker.lorem.word();
    const rating =  faker.number.int();
    const isAnonymous = faker.datatype.boolean();
    
    const postReview =  await postReviewDao.create(postId, posterId, reviewerId, reviewDescription, rating, isAnonymous);
    expect(postReview.postId).toBe(postId);
    expect(postReview.posterId).toBe(posterId);
    expect(postReview.reviewerId).toBe(reviewerId);
    expect(postReview.reviewDescription).toBe(reviewDescription);
    expect(postReview.rating).toBe(rating);
    expect(postReview.isAnonymous).toBe(isAnonymous);
    await PostReviewSchema.deleteMany({});
});

test('test create() with missing fields', async ()=> {
    const postReviewDao = new PostReviewDao();

    // Missing postId
    let postId: string | undefined = undefined;
    let posterId: string | undefined = String(faker.number.int());
    let reviewerId: string | undefined = String(faker.number.int());
    let reviewDescription: string | undefined =  faker.lorem.word();
    let rating: number | undefined =  faker.number.int();
    await expect(postReviewDao.create(postId, posterId, reviewerId, reviewDescription, rating)).rejects.toThrow();

    // Missing posterId
    postId = String(faker.number.int());
    posterId = undefined;
    await expect(postReviewDao.create(postId, posterId, reviewerId, reviewDescription, rating)).rejects.toThrow();

    // Missing reviewerId
    posterId = String(faker.number.int());
    reviewerId = undefined;
    await expect(postReviewDao.create(postId, posterId, reviewerId, reviewDescription, rating)).rejects.toThrow();

    // Missing reviewDescription
    reviewerId = String(faker.number.int());
    reviewDescription = undefined;
    await expect(postReviewDao.create(postId, posterId, reviewerId, reviewDescription, rating)).rejects.toThrow();

    // Missing rating
    reviewDescription = faker.lorem.word();
    rating = undefined;
    await expect(postReviewDao.create(postId, posterId, reviewerId, reviewDescription, rating)).rejects.toThrow();
});

test('test readAll()', async ()=> {
    const postReviewDao = new PostReviewDao();
    await mg.connect(URI);
    PostReviewSchema.deleteMany({});

    // Create some test reviews
    const postId = String(faker.number.int());
    const posterId = String(faker.number.int());
    const reviewerId = String(faker.number.int());
    const reviewDescription =  faker.lorem.word();
    const rating =  faker.number.int();
    const isAnonymous = faker.datatype.boolean();

    await postReviewDao.create(postId, posterId, reviewerId, reviewDescription, rating, isAnonymous);

    // Fetch reviews by postId
    const postReviews = await postReviewDao.readAll();
    
    // Check if the retrieved reviews match the created ones
    expect(postReviews).toHaveLength(1);
    expect(postReviews[0].postId).toBe(postId);
    expect(postReviews[0].posterId).toBe(posterId);
    expect(postReviews[0].reviewerId).toBe(reviewerId);
    expect(postReviews[0].reviewDescription).toBe(reviewDescription);
    expect(postReviews[0].rating).toBe(rating);
    expect(postReviews[0].isAnonymous).toBe(isAnonymous);
});

test('test readAllByPostId()', async ()=> {
    const postReviewDao = new PostReviewDao();
    await mg.connect(URI);

    // Create some test reviews
    const postId = String(faker.number.int());
    const posterId = String(faker.number.int());
    const reviewerId = String(faker.number.int());
    const reviewDescription =  faker.lorem.word();
    const rating =  faker.number.int();
    const isAnonymous = faker.datatype.boolean();

    await postReviewDao.create(postId, posterId, reviewerId, reviewDescription, rating, isAnonymous);

    // Fetch reviews by postId
    const postReviews = await postReviewDao.readAllByPostId(postId);
    
    // Check if the retrieved reviews match the created ones
    expect(postReviews).toHaveLength(1);
    expect(postReviews[0].postId).toBe(postId);
    expect(postReviews[0].posterId).toBe(posterId);
    expect(postReviews[0].reviewerId).toBe(reviewerId);
    expect(postReviews[0].reviewDescription).toBe(reviewDescription);
    expect(postReviews[0].rating).toBe(rating);
    expect(postReviews[0].isAnonymous).toBe(isAnonymous);
});

test('test readOne()', async ()=> {
    const postReviewDao = new PostReviewDao();
    await mg.connect(URI);

    // Create a test review
    const postId = String(faker.number.int());
    const posterId = String(faker.number.int());
    const reviewerId = String(faker.number.int());
    const reviewDescription =  faker.lorem.word();
    const rating =  faker.number.int();
    const isAnonymous = faker.datatype.boolean();

    const createdReview = await postReviewDao.create(postId, posterId, reviewerId, reviewDescription, rating, isAnonymous);

    // Fetch the review by ID
    const retrievedReview = await postReviewDao.readOne(createdReview._id);
    
    // Check if the retrieved review matches the created one
    expect(retrievedReview.postId).toBe(postId);
    expect(retrievedReview.posterId).toBe(posterId);
    expect(retrievedReview.posterId).toBe(posterId);

});

test('test delete()', async ()=> {
    const postReviewDao = new PostReviewDao();
    await mg.connect(URI);

    // Create a test review
    const postId = String(faker.number.int());
    const posterId = String(faker.number.int());
    const reviewerId = String(faker.number.int());
    const reviewDescription =  faker.lorem.word();
    const rating =  faker.number.int();

    const createdReview = await postReviewDao.create(postId, posterId, reviewerId, reviewDescription, rating);

    // Delete the review
    await postReviewDao.delete(createdReview._id);

    // Attempt to fetch the deleted review
    const deletedReview = await postReviewDao.readOne(createdReview._id);

    // Check if the deleted review is null
    expect(deletedReview).toBeNull();
});

