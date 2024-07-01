import { ObjectId } from "mongodb";

export {}
const request = require('supertest');
const express = require('express');
const router = require('../../../server/routes/index.ts')
const coursePost = require('../../../server/model/CoursePost'); 
const App = require('../../../server/app.ts')
const Profile = require('../../model/Profile');
const ProfileDao = require('../../data/ProfileDao');

App.dbConnection(true)
const app = App.app

describe('Test profile routes', () => {

    // Test for POST /profiles
    test('POST /profiles', async () => {
        await Profile.deleteMany({});

        const newProfileData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
            affiliation: 'Faculty',
            graduationYear: '2023',
            department: 'Computer Science',
            description: 'I am a computer science student with a passion for coding.'
        };

        const res = await request(app)
            .post('/profiles')
            .send(newProfileData);

        const profileId = res.body.data._id;

        expect(res.status).toBe(200);
        expect(res.body.data.firstName).toBe(newProfileData.firstName);
        expect(res.body.data.lastName).toBe(newProfileData.lastName);
        expect(res.body.data.email).toBe(newProfileData.email);
        expect(res.body.data.affiliation).toBe(newProfileData.affiliation);
        expect(res.body.data.graduationYear).toBe(newProfileData.graduationYear);
        expect(res.body.data.department).toBe(newProfileData.department);
        expect(res.body.data.description).toBe(newProfileData.description);

        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profileId}`);
    });

    // Test for GET /profiles with no data
    test('GET /profiles with no data', async () => {
        const res = await request(app).get('/profiles');

        expect(res.status).toBe(200);
    });

    // Test for GET /profiles with multiple profiles
    test('GET /profiles with multiple profiles', async () => {

        const newProfile1Data = {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'janesmith@example.com',
            affiliation: 'Faculty',
            department: 'Physics'
        };

        const newProfile2Data = {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'janedoe@example.com',
            affiliation: 'Faculty',
            department: 'Physics'
        };
        const newProfile1 = await Profile.create(newProfile1Data);
        const newProfile2 = await Profile.create(newProfile2Data);

        const res = await request(app).get('/profiles');
        
        expect(res.status).toBe(200);
        expect(res.body.data[0].firstName).toBe(newProfile1Data.firstName);
        expect(res.body.data[0].lastName).toBe(newProfile1Data.lastName);
        expect(res.body.data[0].email).toBe(newProfile1Data.email);
        expect(res.body.data[0].affiliation).toBe(newProfile1Data.affiliation);
        expect(res.body.data[0].department).toBe(newProfile1Data.department);

        expect(res.body.data[1].firstName).toBe(newProfile2Data.firstName);
        expect(res.body.data[1].lastName).toBe(newProfile2Data.lastName);
        expect(res.body.data[1].email).toBe(newProfile2Data.email);
        expect(res.body.data[1].affiliation).toBe(newProfile2Data.affiliation);
        expect(res.body.data[1].department).toBe(newProfile2Data.department);

        const res1 = await request(app).get(`/profiles/${newProfile1._id}`);
        const res2 = await request(app).get(`/profiles/${newProfile2._id}`);

        const profileId1 = res1.body.data._id;
        const profileId2 = res2.body.data._id;

        await request(app).delete(`/profiles/${profileId1}`);
        await request(app).delete(`/profiles/${profileId2}`);
    });

    // Test for GET /profiles with multiple profiles and query
    test('GET /profiles with multiple profiles', async () => {

        const newProfile1Data = {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'janesmith@example.com',
            affiliation: 'Faculty',
            department: 'Physics'
        };

        const newProfile2Data = {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'janedoe@example.com',
            affiliation: 'Faculty',
            department: 'Physics'
        };
        const newProfile1 = await Profile.create(newProfile1Data);
        const newProfile2 = await Profile.create(newProfile2Data);

        const res = await request(app).get('/profiles?firstName=Jane&lastName=Smith');
        
        expect(res.status).toBe(200);
        expect(res.body.data[0].firstName).toBe(newProfile1Data.firstName);
        expect(res.body.data[0].lastName).toBe(newProfile1Data.lastName);
        expect(res.body.data[0].email).toBe(newProfile1Data.email);
        expect(res.body.data[0].affiliation).toBe(newProfile1Data.affiliation);
        expect(res.body.data[0].department).toBe(newProfile1Data.department);

        const res1 = await request(app).get(`/profiles/${newProfile1._id}`);
        const res2 = await request(app).get(`/profiles/${newProfile2._id}`);

        const profileId1 = res1.body.data._id;
        const profileId2 = res2.body.data._id;

        await request(app).delete(`/profiles/${profileId1}`);
        await request(app).delete(`/profiles/${profileId2}`);
    });

    // Test for GET /profiles/:_id
    test('GET /profiles/:_id', async () => {
        // First, create a profile to get its ID
        const newProfileData = {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'janesmith@example.com',
            affiliation: 'Faculty',
            department: 'Physics'
        };
        const newProfile = await Profile.create(newProfileData);

        const res = await request(app).get(`/profiles/${newProfile._id}`);

        const profileId = res.body.data._id;

        expect(res.status).toBe(200);
        expect(res.body.data.firstName).toBe(newProfileData.firstName);
        expect(res.body.data.lastName).toBe(newProfileData.lastName);
        expect(res.body.data.email).toBe(newProfileData.email);
        expect(res.body.data.affiliation).toBe(newProfileData.affiliation);
        expect(res.body.data.department).toBe(newProfileData.department);

        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profileId}`);
    });

    // Test for GET /profiles/:_id with multiple profiles
    test('GET /profiles/:_id with multiple profiles', async () => {
        // First, create a profile to get its ID
        const newProfile1Data = {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'janesmith@example.com',
            affiliation: 'Faculty',
            department: 'Physics'
        };

        const newProfile2Data = {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'janedoe@example.com',
            affiliation: 'Faculty',
            department: 'Physics'
        };
        const newProfile1 = await Profile.create(newProfile1Data);
        const newProfile2 = await Profile.create(newProfile2Data);

        const res1 = await request(app).get(`/profiles/${newProfile1._id}`);
        const res2 = await request(app).get(`/profiles/${newProfile2._id}`);


        const profileId1 = res1.body.data._id;
        const profileId2 = res2.body.data._id;

        expect(res1.status).toBe(200);
        expect(res1.body.data.firstName).toBe(newProfile1Data.firstName);
        expect(res1.body.data.lastName).toBe(newProfile1Data.lastName);
        expect(res1.body.data.email).toBe(newProfile1Data.email);
        expect(res1.body.data.affiliation).toBe(newProfile1Data.affiliation);
        expect(res1.body.data.department).toBe(newProfile1Data.department);

        expect(res2.status).toBe(200);
        expect(res2.body.data.firstName).toBe(newProfile2Data.firstName);
        expect(res2.body.data.lastName).toBe(newProfile2Data.lastName);
        expect(res2.body.data.email).toBe(newProfile2Data.email);
        expect(res2.body.data.affiliation).toBe(newProfile2Data.affiliation);
        expect(res2.body.data.department).toBe(newProfile2Data.department);

        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profileId1}`);
        await request(app).delete(`/profiles/${profileId2}`);
    });

    // Test for GET /profiles/getByEmail/:email
    test('GET /profiles/getByEmail/:email', async () => {
        // First, create a profile to get its ID
        const newProfileData = {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'janesmith@example.com',
            affiliation: 'Faculty',
            department: 'AMS'
        };
        const newProfile = await Profile.create(newProfileData);
        
        const res = await request(app).get(`/profiles/getByEmail/${newProfile.email}`);

        const profileId = res.body.data[0]._id;

        expect(res.status).toBe(200);
        expect(res.body.data[0].firstName).toBe(newProfileData.firstName);
        expect(res.body.data[0].lastName).toBe(newProfileData.lastName);
        expect(res.body.data[0].email).toBe(newProfileData.email);
        expect(res.body.data[0].affiliation).toBe(newProfileData.affiliation);
        expect(res.body.data[0].department).toBe(newProfileData.department);

        const resDelete = await request(app).delete(`/profiles/${profileId}`);

    });

    afterAll(async () => {
        await App.close(); // Close the MongoDB connection
    });

    test('PUT /profiles/:_id', async () => {
        await Profile.deleteMany({});

        const profileData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
            affiliation: 'Student',
            graduationYear: '2023',
            department: 'Computer Science'
        };

        const r = await request(app)
            .post('/profiles')
            .send(profileData);

        const profileId = r.body.data._id;
        const newProfileData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
            affiliation: 'Student',
            graduationYear: '2023',
            department: 'Computer Science',
            description: 'I am a computer science student with a passion for coding.'
        };

        const updateRes = await request(app)
            .put(`/profiles/${profileId}`)
            .send(newProfileData);


        const res = await request(app)
            .get(`/profiles/${profileId}`);
            
        expect(res.status).toBe(200);
        expect(res.body.data.firstName).toBe(newProfileData.firstName);
        expect(res.body.data.lastName).toBe(newProfileData.lastName);
        expect(res.body.data.email).toBe(newProfileData.email);
        expect(res.body.data.affiliation).toBe(newProfileData.affiliation);
        expect(res.body.data.graduationYear).toBe(newProfileData.graduationYear);
        expect(res.body.data.department).toBe(newProfileData.department);
        expect(res.body.data.description).toBe(newProfileData.description);

        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profileId}`);
    });


    test('PUT /profiles/addBookmark/:id', async () => {
        // First, create a profile to get its ID
        const newProfileData = {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'janesmith@example.com',
            affiliation: 'Faculty',
            department: 'Physics'
        };
        const newProfile = await request(app).post('/profiles').send(newProfileData);

        const _id = newProfile._body.data._id
        const bmId = new ObjectId()
        const bookmark = {
            bookmark: bmId,
            isCourse: false
        }
        const res = await request(app)
        .put(`/profiles/addBookmark/${_id}`)
        .send(bookmark);

        expect(res.status).toBe(200);
        expect(res._body.data.activityBookmarks).toHaveLength(1);
        expect(res._body.data.courseBookmarks).toHaveLength(0);
    });

    test('PUT /profiles/deleteBookmark/:id', async () => {
        // First, create a profile to get its ID
        const newProfileData = {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'janesmith@example.com',
            affiliation: 'Faculty',
            department: 'Physics'
        };
        const newProfile = await request(app).post('/profiles').send(newProfileData);

        const _id = newProfile._body.data._id
        const bmId = new ObjectId()
        const bookmark1 = {
            bookmark: bmId,
            isCourse: false
        }

        const bmId2 = new ObjectId()
        const bookmark2 = {
            bookmark: bmId2,
            isCourse: false
        }
        const res = await request(app)
        .put(`/profiles/addBookmark/${_id}`)
        .send(bookmark1);

        const res2 = await request(app)
        .put(`/profiles/addBookmark/${_id}`)
        .send(bookmark2);

        expect(res2.status).toBe(200);
        expect(res2._body.data.activityBookmarks).toHaveLength(2);
        expect(res2._body.data.courseBookmarks).toHaveLength(0);

        const res3 = await request(app)
        .put(`/profiles/deleteBookmark/${_id}`)
        .send(bookmark2);

        expect(res3.status).toBe(200);
        expect(res3._body.data.activityBookmarks).toHaveLength(1);
        expect(res3._body.data.courseBookmarks).toHaveLength(0);
    });

    test('GET /profiles/allBookmarks/:id', async () => {
        // First, create a profile to get its ID
        const newProfileData = {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'janesmith@example.com',
            affiliation: 'Faculty',
            department: 'Physics'
        };
        const newProfile = await request(app).post('/profiles').send(newProfileData);

        const _id = newProfile._body.data._id
        const bmId = new ObjectId()
        const bookmark1 = {
            bookmark: bmId,
            isCourse: false
        }

        const bmId2 = new ObjectId()
        const bookmark2 = {
            bookmark: bmId2,
            isCourse: false
        }
        const res = await request(app)
        .put(`/profiles/addBookmark/${_id}`)
        .send(bookmark1);

        const res2 = await request(app)
        .put(`/profiles/addBookmark/${_id}`)
        .send(bookmark2);

        expect(res2.status).toBe(200);
        expect(res2._body.data.activityBookmarks).toHaveLength(2);
        expect(res2._body.data.courseBookmarks).toHaveLength(0);

        const res3 = await request(app)
        .get(`/profiles/allBookmarks/${_id}`)

        expect(res3.status).toBe(200);
        expect(res3._body.data.activityBookmarks).toHaveLength(2);
        expect(res3._body.data.courseBookmarks).toHaveLength(0);
    });

});
