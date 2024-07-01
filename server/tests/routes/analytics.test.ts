export {}
const request = require('supertest');
const express = require('express');
const router = require('../../../server/routes/index.ts')
const App = require('../../../server/app.ts')

App.dbConnection(true)
const app = App.app

app.use(express.json());
app.use('/profiles', router);

describe('Test analytics reporting capabilities', () => {
    test('GET /profiles/demographics/:_id with no views of profile _id', async () => {
        
        const profile1Info = {
            "firstName": "Tad",
            "lastName": "Berkery",
            "email": "tberker2@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }

        const profile2Info = {
            "firstName": "Kat",
            "lastName": "Forbes",
            "email": "kforbes6@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }

        const res1 = await request(app)
            .post('/profiles')
            .send(profile1Info);

        const res2 = await request(app)
            .post('/profiles')
            .send(profile2Info);

        // Extract the created post ID from the response
        const profile1Id = res1.body.data._id;
        const profile2Id = res2.body.data._id;

        const resAnalytics = await request(app)
            .get(`/profiles/demographics/${profile1Id}?start=2020-03-05T19:49:35.744Z`)

        expect(resAnalytics.body.departments).toEqual([]);
        expect(resAnalytics.body.affiliations).toEqual([]);
        expect(resAnalytics.body.graduationYears).toEqual([]);

        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profile1Id}`);
        await request(app).delete(`/profiles/${profile2Id}`);
    });

    test('GET /profiles/demographics/:_id with single view of profile _id', async () => {
        
        const profile1Info = {
            "firstName": "Tad",
            "lastName": "Berkery",
            "email": "tberker2@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }

        const profile2Info = {
            "firstName": "Kat",
            "lastName": "Forbes",
            "email": "kforbes6@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }

        const res1 = await request(app)
            .post('/profiles')
            .send(profile1Info);

        const res2 = await request(app)
            .post('/profiles')
            .send(profile2Info);

        // Extract the created post ID from the response
        const profile1Id = res1.body.data._id;
        const profile2Id = res2.body.data._id;

        const viewInfo = {
            "viewerId": profile2Id,
            "timestamp": "2022-02-17T13:36:45.954Z",
            "duration": 120
        }

        const resView = await request(app)
            .put(`/profiles/views/${profile1Id}`)
            .send(viewInfo)

        const resAnalytics = await request(app)
            .get(`/profiles/demographics/${profile1Id}?start=2020-03-05T19:49:35.744Z`)

        expect(resAnalytics.body.departments).toHaveLength(1);
        expect(resAnalytics.body.affiliations).toHaveLength(1);
        expect(resAnalytics.body.graduationYears).toHaveLength(1);

        const computerScienceDepartment = resAnalytics.body.departments.find((department: { _id: string; }) => department._id === 'Computer Science');
        expect(computerScienceDepartment).toBeDefined();
        expect(computerScienceDepartment.count).toBe(1);

        const affiliationStudent = resAnalytics.body.affiliations.find((affiliation: { _id: string; }) => affiliation._id === 'Student');
        expect(affiliationStudent).toBeDefined();
        expect(affiliationStudent.count).toBe(1);

        const graduationYear2023 = resAnalytics.body.graduationYears.find((graduationYear: { _id: string; }) => graduationYear._id === '2023');
        expect(graduationYear2023).toBeDefined();
        expect(graduationYear2023.count).toBe(1);

        const resAnalytics2 = await request(app)
            .get(`/profiles/demographics/${profile2Id}?start=2020-03-05T19:49:35.744Z`)

        expect(resAnalytics2.body.departments).toEqual([]);
        expect(resAnalytics2.body.affiliations).toEqual([]);
        expect(resAnalytics2.body.graduationYears).toEqual([]);

        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profile1Id}`);
        await request(app).delete(`/profiles/${profile2Id}`);
    });

    test('GET /profiles/demographics/:_id with multiple views of profile _id', async () => {
        
        const profile1Info = {
            "firstName": "Tad",
            "lastName": "Berkery",
            "email": "tberker2@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }

        const profile2Info = {
            "firstName": "Kat",
            "lastName": "Forbes",
            "email": "kforbes6@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }

        const profile3Info = {
            "firstName": "Tad",
            "lastName": "Berkery",
            "email": "tberker2@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Economics",
            "description": "I'm creating this profile just for example."
        }

        const res1 = await request(app)
            .post('/profiles')
            .send(profile1Info);

        const res2 = await request(app)
            .post('/profiles')
            .send(profile2Info);

        const res3 = await request(app)
            .post('/profiles')
            .send(profile3Info);

        // Extract the created post ID from the response
        const profile1Id = res1.body.data._id;
        const profile2Id = res2.body.data._id;
        const profile3Id = res3.body.data._id;

        const viewInfo1 = {
            "viewerId": profile2Id,
            "timestamp": "2022-02-17T13:36:45.954Z",
            "duration": 120
        }

        const viewInfo2 = {
            "viewerId": profile3Id,
            "timestamp": "2022-02-18T13:36:45.954Z",
            "duration": 130
        }

        const resView1 = await request(app)
            .put(`/profiles/views/${profile1Id}`)
            .send(viewInfo1)

        const resView2 = await request(app)
            .put(`/profiles/views/${profile1Id}`)
            .send(viewInfo2)

        const resAnalytics1 = await request(app)
            .get(`/profiles/demographics/${profile1Id}?start=2021-03-05T19:49:35.744Z`)

        expect(resAnalytics1.body.departments).toHaveLength(2);
        expect(resAnalytics1.body.affiliations).toHaveLength(1);
        expect(resAnalytics1.body.graduationYears).toHaveLength(2);

        const computerScienceDepartment = resAnalytics1.body.departments.find((department: { _id: string; }) => department._id === 'Computer Science');
        expect(computerScienceDepartment).toBeDefined();
        expect(computerScienceDepartment.count).toBe(1);

        const economicsScienceDepartment = resAnalytics1.body.departments.find((department: { _id: string; }) => department._id === 'Economics');
        expect(economicsScienceDepartment).toBeDefined();
        expect(economicsScienceDepartment.count).toBe(1);

        const affiliationStudent = resAnalytics1.body.affiliations.find((affiliation: { _id: string; }) => affiliation._id === 'Student');
        expect(affiliationStudent).toBeDefined();
        expect(affiliationStudent.count).toBe(2);

        const graduationYear2023 = resAnalytics1.body.graduationYears.find((graduationYear: { _id: string; }) => graduationYear._id === '2023');
        expect(graduationYear2023).toBeDefined();
        expect(graduationYear2023.count).toBe(1);

        const graduationYear2024 = resAnalytics1.body.graduationYears.find((graduationYear: { _id: string; }) => graduationYear._id === '2024');
        expect(graduationYear2024).toBeDefined();
        expect(graduationYear2024.count).toBe(1);

        const resAnalytics2 = await request(app)
            .get(`/profiles/demographics/${profile2Id}?start=2021-03-05T19:49:35.744Z`)

        expect(resAnalytics2.body.departments).toEqual([]);
        expect(resAnalytics2.body.affiliations).toEqual([]);
        expect(resAnalytics2.body.graduationYears).toEqual([]);


        const resAnalytics3 = await request(app)
            .get(`/profiles/demographics/${profile3Id}?start=2021-03-05T19:49:35.744Z`)

        expect(resAnalytics3.body.departments).toEqual([]);
        expect(resAnalytics3.body.affiliations).toEqual([]);
        expect(resAnalytics3.body.graduationYears).toEqual([]);

        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profile1Id}`);
        await request(app).delete(`/profiles/${profile2Id}`);
        await request(app).delete(`/profiles/${profile3Id}`);
    });


    test('GET /coursePosts/demographics/:_id with no views of coursePost _id', async () => {
        
        const profile = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
        const profileRes = await request(app)
        .post('/profiles')
        .send(profile);
    
        const coursePost1 = {
            "userId": profileRes.body.data._id,
            "userFirstName": "Ilana",
            "userLastName": "Chalom",
            "courseName": "Linear Algebra",
            "takenAtHopkins": true
        }
    
        const res1 = await request(app)
            .post('/coursePosts')
            .send(coursePost1);
    
        // Extract the created post ID from the response
        const coursePost1Id = res1.body.newPost._id;
    
        const resAnalytics = await request(app)
            .get(`/coursePosts/demographics/${coursePost1Id}?start=2020-03-05T19:49:35.744Z`)
    
        expect(resAnalytics.body.departments).toEqual([]);
        expect(resAnalytics.body.affiliations).toEqual([]);
        expect(resAnalytics.body.graduationYears).toEqual([]);
    
        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profileRes.body.data._id}`);
        await request(app).delete(`/coursePosts/${coursePost1Id}`);
    });
    
    test('GET /coursePosts/demographics/:_id with single view of profile _id', async () => {
        
        const profile1 = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
        const profileRes1 = await request(app)
        .post('/profiles')
        .send(profile1);
    
    
        const profile2 = {
            "firstName": "Tad",
            "lastName": "Berkery",
            "email": "tberker2@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }
        const profileRes2 = await request(app)
        .post('/profiles')
        .send(profile2);
    
        const coursePost1 = {
            "userId": profileRes1.body.data._id,
            "userFirstName": "Ilana",
            "userLastName": "Chalom",
            "courseName": "Linear Algebra",
            "takenAtHopkins": true
        }
    
        const coursePost2 = {
            "userId": profileRes1.body.data._id,
            "userFirstName": "Ilana",
            "userLastName": "Chalom",
            "courseName": "Data Structures",
            "takenAtHopkins": true
        }
    
        const res1 = await request(app)
            .post('/coursePosts')
            .send(coursePost1);
    
        // Extract the created post ID from the response
        const coursePost1Id = res1.body.newPost._id;
        const profile2Id = profileRes2.body.data._id;
    
        const viewInfo = {
            "viewerId": profile2Id,
            "timestamp": "2022-02-17T13:36:45.954Z",
            "duration": 120
        }
    
        const resView = await request(app)
            .put(`/coursePosts/views/${coursePost1Id}`)
            .send(viewInfo)
    
        const resAnalytics = await request(app)
            .get(`/coursePosts/demographics/${coursePost1Id}?start=2020-03-05T19:49:35.744Z`)
    
        expect(resAnalytics.body.departments).toHaveLength(1);
        expect(resAnalytics.body.affiliations).toHaveLength(1);
        expect(resAnalytics.body.graduationYears).toHaveLength(1);
    
        const computerScienceDepartment = resAnalytics.body.departments.find((department: { _id: string; }) => department._id === 'Computer Science');
        expect(computerScienceDepartment).toBeDefined();
        expect(computerScienceDepartment.count).toBe(1);
    
        const affiliationStudent = resAnalytics.body.affiliations.find((affiliation: { _id: string; }) => affiliation._id === 'Student');
        expect(affiliationStudent).toBeDefined();
        expect(affiliationStudent.count).toBe(1);
    
        const graduationYear2023 = resAnalytics.body.graduationYears.find((graduationYear: { _id: string; }) => graduationYear._id === '2023');
        expect(graduationYear2023).toBeDefined();
        expect(graduationYear2023.count).toBe(1);
    
    
        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profileRes1.body.data._id}`);
        await request(app).delete(`/profiles/${profile2Id}`);
        await request(app).delete(`/coursePosts/${coursePost1Id}`);
    });
    
    test('GET /coursePosts/demographics/:_id with multiple views of profile _id', async () => {
        
        const profile1 = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
    
        const profile2 = {
            "firstName": "Kat",
            "lastName": "Forbes",
            "email": "kforbes6@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }
    
        const profile3 = {
            "firstName": "Tad",
            "lastName": "Berkery",
            "email": "tberker2@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Economics",
            "description": "I'm creating this profile just for example."
        }
    
        const res1 = await request(app)
            .post('/profiles')
            .send(profile1);
    
        const res2 = await request(app)
            .post('/profiles')
            .send(profile2);
    
        const res3 = await request(app)
            .post('/profiles')
            .send(profile3);
    
        const coursePost1 = {
                "userId": res1.body.data._id,
                "userFirstName": "Ilana",
                "userLastName": "Chalom",
                "courseName": "Linear Algebra",
                "takenAtHopkins": true
        }
        const coursePost2 = {
            "userId": res1.body.data._id,
            "userFirstName": "Ilana",
            "userLastName": "Chalom",
            "courseName": "Data Structures",
            "takenAtHopkins": true
    }
        const res4 = await request(app)
            .post('/coursePosts')
            .send(coursePost1);
    
        const res5 = await request(app)
            .post('/coursePosts')
            .send(coursePost2);
        // Extract the created post ID from the response
        const profile1Id = res1.body.data._id;
        const profile2Id = res2.body.data._id;
        const profile3Id = res3.body.data._id;
        const postId = res4.body.newPost._id;
        const otherPostId = res5.body.newPost._id;
        const viewInfo1 = {
            "viewerId": profile2Id,
            "timestamp": "2022-02-17T13:36:45.954Z",
            "duration": 120
        }
    
        const viewInfo2 = {
            "viewerId": profile3Id,
            "timestamp": "2022-02-18T13:36:45.954Z",
            "duration": 130
        }
    
        const resView1 = await request(app)
            .put(`/coursePosts/views/${postId}`)
            .send(viewInfo1)
    
        const resView2 = await request(app)
            .put(`/coursePosts/views/${postId}`)
            .send(viewInfo2)
    
        const resAnalytics1 = await request(app)
            .get(`/coursePosts/demographics/${postId}?start=2021-03-05T19:49:35.744Z`)
    
        expect(resAnalytics1.body.departments).toHaveLength(2);
        expect(resAnalytics1.body.affiliations).toHaveLength(1);
        expect(resAnalytics1.body.graduationYears).toHaveLength(2);
    
        const computerScienceDepartment = resAnalytics1.body.departments.find((department: { _id: string; }) => department._id === 'Computer Science');
        expect(computerScienceDepartment).toBeDefined();
        expect(computerScienceDepartment.count).toBe(1);
    
        const economicsScienceDepartment = resAnalytics1.body.departments.find((department: { _id: string; }) => department._id === 'Economics');
        expect(economicsScienceDepartment).toBeDefined();
        expect(economicsScienceDepartment.count).toBe(1);
    
        const affiliationStudent = resAnalytics1.body.affiliations.find((affiliation: { _id: string; }) => affiliation._id === 'Student');
        expect(affiliationStudent).toBeDefined();
        expect(affiliationStudent.count).toBe(2);
    
        const graduationYear2023 = resAnalytics1.body.graduationYears.find((graduationYear: { _id: string; }) => graduationYear._id === '2023');
        expect(graduationYear2023).toBeDefined();
        expect(graduationYear2023.count).toBe(1);
    
        const graduationYear2024 = resAnalytics1.body.graduationYears.find((graduationYear: { _id: string; }) => graduationYear._id === '2024');
        expect(graduationYear2024).toBeDefined();
        expect(graduationYear2024.count).toBe(1);
    
        const resAnalytics2 = await request(app)
            .get(`/coursePosts/demographics/${otherPostId}?start=2021-03-05T19:49:35.744Z`)
    
        expect(resAnalytics2.body.departments).toEqual([]);
        expect(resAnalytics2.body.affiliations).toEqual([]);
        expect(resAnalytics2.body.graduationYears).toEqual([]);
    
    
        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profile1Id}`);
        await request(app).delete(`/profiles/${profile2Id}`);
        await request(app).delete(`/profiles/${profile3Id}`);
        await request(app).delete(`/coursePosts/${postId}`);
        await request(app).delete(`/coursePosts/${otherPostId}`);
    });

    test('PUT /coursePosts/views/:_id with bogus profile id', async () => {
        
        const profile1 = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }

        const profileRes1 = await request(app)
        .post('/profiles')
        .send(profile1);

        const profile2 = {
            "firstName": "Kat",
            "lastName": "Forbes",
            "email": "kforbes6@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }

        const profileRes2 = await request(app)
        .post('/profiles')
        .send(profile2);

        const profile2Id = profileRes2.body.data._id;
    
        const coursePost1 = {
            "userId": profileRes1.body.data._id,
            "userFirstName": "Ilana",
            "userLastName": "Chalom",
            "courseName": "Linear Algebra",
            "takenAtHopkins": true
        }
    
        const res1 = await request(app)
            .post('/coursePosts')
            .send(coursePost1);
    
        // Extract the created post ID from the response
        const coursePost1Id = res1.body.newPost._id;
    
        const viewInfo = {
            "viewerId": profile2Id,
            "timestamp": "2022-02-17T13:36:45.954Z",
            "duration": 120
        }
    
        const resView = await request(app)
            .put(`/coursePosts/views/nonSenseCoursePostId`)
            .send(viewInfo)
    
        expect(resView.status).toBe(500);
    
        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profileRes1.body.data._id}`);
        await request(app).delete(`/profiles/${profileRes2.body.data._id}`);
        await request(app).delete(`/coursePosts/${coursePost1Id}`);
    });


    test('GET /coursePosts/demographics/:_id with bogus of viewer Id', async () => {
        
        const profile1 = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
        const profileRes1 = await request(app)
        .post('/profiles')
        .send(profile1);
    
        const coursePost1 = {
            "userId": profileRes1.body.data._id,
            "userFirstName": "Ilana",
            "userLastName": "Chalom",
            "courseName": "Linear Algebra",
            "takenAtHopkins": true
        }
    
        const res1 = await request(app)
            .post('/coursePosts')
            .send(coursePost1);
    
        // Extract the created post ID from the response
        const coursePost1Id = res1.body.newPost._id;
    
        const viewInfo = {
            "viewerId": "nonsenseViewerId",
            "timestamp": "2022-02-17T13:36:45.954Z",
            "duration": 120
        }
    
        const resView = await request(app)
            .put(`/coursePosts/views/${coursePost1Id}`)
            .send(viewInfo)
    
        expect(resView.status).toBe(500);
    
        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profileRes1.body.data._id}`);
        await request(app).delete(`/coursePosts/${coursePost1Id}`);
    });


    test('GET /coursePosts/demographics/:_id with no views of post', async () => {
        
        const profile1 = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
        const profileRes1 = await request(app)
        .post('/profiles')
        .send(profile1);
    
        const coursePost1 = {
            "userId": profileRes1.body.data._id,
            "userFirstName": "Ilana",
            "userLastName": "Chalom",
            "courseName": "Linear Algebra",
            "takenAtHopkins": true
        }
    
        const res1 = await request(app)
            .post('/coursePosts')
            .send(coursePost1);
    
        // Extract the created post ID from the response
        const coursePost1Id = res1.body.newPost._id;

        const response = await request(app)
            .get(`/coursePosts/demographics/${coursePost1Id}?start=2020-03-05T19:49:35.744Z`)
        expect(response.status).toBe(200);
        expect(response.body.departments).toEqual([]);
        expect(response.body.affiliations).toEqual([]);
        expect(response.body.graduationYears).toEqual([]);
        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profileRes1.body.data._id}`);
        await request(app).delete(`/coursePosts/${coursePost1Id}`);
    });


    test('GET /activityPosts/demographics/:_id with no views of coursePost _id', async () => {
        
        const profile = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
        const profileRes = await request(app)
        .post('/profiles')
        .send(profile);
    
        const activityPost1 = {
            "userId": profileRes.body.data._id,
            "userFirstName": "Ilana",
            "userLastName": "Chalom",
            "activityTitle": "Testing your code"
        }
    
    
        const res1 = await request(app)
            .post('/activityPosts')
            .send(activityPost1);
    
    
        // Extract the created post ID from the response
        const activityPostId = res1.body.newPost._id;
    
        const resAnalytics = await request(app)
            .get(`/activityPosts/demographics/${activityPostId}?start=2020-03-05T19:49:35.744Z`)
    
        expect(resAnalytics.body.departments).toEqual([]);
        expect(resAnalytics.body.affiliations).toEqual([]);
        expect(resAnalytics.body.graduationYears).toEqual([]);
    
        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profileRes.body.data._id}`);
        await request(app).delete(`/activityPosts/${activityPostId}`);
    });
    
    test('GET /activityPosts/demographics/:_id with single view of profile _id', async () => {
        
        const profile1 = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
        const profileRes1 = await request(app)
        .post('/profiles')
        .send(profile1);
    
    
        const profile2 = {
            "firstName": "Tad",
            "lastName": "Berkery",
            "email": "tberker2@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }
        const profileRes2 = await request(app)
        .post('/profiles')
        .send(profile2);
    
        const activityPost1 = {
            "userId": profileRes1.body.data._id,
            "userFirstName": "Ilana",
            "userLastName": "Chalom",
            "activityTitle": "Testing your code"
        }
    
        const res1 = await request(app)
            .post('/activityPosts')
            .send(activityPost1);
    
        // Extract the created post ID from the response
        const activityPostId = res1.body.newPost._id;
        const profile2Id = profileRes2.body.data._id;
    
        const viewInfo = {
            "viewerId": profile2Id,
            "timestamp": "2022-02-17T13:36:45.954Z",
            "duration": 120
        }
    
        const resView = await request(app)
            .put(`/activityPosts/views/${activityPostId}`)
            .send(viewInfo)
    
        const resAnalytics = await request(app)
            .get(`/activityPosts/demographics/${activityPostId}?start=2020-03-05T19:49:35.744Z`)
    
        expect(resAnalytics.body.departments).toHaveLength(1);
        expect(resAnalytics.body.affiliations).toHaveLength(1);
        expect(resAnalytics.body.graduationYears).toHaveLength(1);
    
        const computerScienceDepartment = resAnalytics.body.departments.find((department: { _id: string; }) => department._id === 'Computer Science');
        expect(computerScienceDepartment).toBeDefined();
        expect(computerScienceDepartment.count).toBe(1);
    
        const affiliationStudent = resAnalytics.body.affiliations.find((affiliation: { _id: string; }) => affiliation._id === 'Student');
        expect(affiliationStudent).toBeDefined();
        expect(affiliationStudent.count).toBe(1);
    
        const graduationYear2023 = resAnalytics.body.graduationYears.find((graduationYear: { _id: string; }) => graduationYear._id === '2023');
        expect(graduationYear2023).toBeDefined();
        expect(graduationYear2023.count).toBe(1);
    
    
        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profileRes1.body.data._id}`);
        await request(app).delete(`/profiles/${profile2Id}`);
        await request(app).delete(`/activityPosts/${activityPostId}`);
    });
    
    test('GET /activityPosts/demographics/:_id with multiple views of profile _id', async () => {
        
        const profile1 = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
    
        const profile2 = {
            "firstName": "Kat",
            "lastName": "Forbes",
            "email": "kforbes6@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }
    
        const profile3 = {
            "firstName": "Tad",
            "lastName": "Berkery",
            "email": "tberker2@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Economics",
            "description": "I'm creating this profile just for example."
        }
    
        const res1 = await request(app)
            .post('/profiles')
            .send(profile1);
    
        const res2 = await request(app)
            .post('/profiles')
            .send(profile2);
    
        const res3 = await request(app)
            .post('/profiles')
            .send(profile3);
    
        const activityPost1 = {
                "userId": res1.body.data._id,
                "userFirstName": "Ilana",
                "userLastName": "Chalom",
                "activityTitle": "Debugging your code"
        }
        const activityPost2 = {
            "userId": res1.body.data._id,
            "userFirstName": "Ilana",
            "userLastName": "Chalom",
            "activityTitle": "testing your code"
    }
        const res4 = await request(app)
            .post('/activityPosts')
            .send(activityPost1);
    
        const res5 = await request(app)
            .post('/activityPosts')
            .send(activityPost2);
        // Extract the created post ID from the response
        const profile1Id = res1.body.data._id;
        const profile2Id = res2.body.data._id;
        const profile3Id = res3.body.data._id;
        const postId = res4.body.newPost._id;
        const otherPostId = res5.body.newPost._id;
        const viewInfo1 = {
            "viewerId": profile2Id,
            "timestamp": "2022-02-17T13:36:45.954Z",
            "duration": 120
        }
    
        const viewInfo2 = {
            "viewerId": profile3Id,
            "timestamp": "2022-02-18T13:36:45.954Z",
            "duration": 130
        }
    
        const resView1 = await request(app)
            .put(`/activityPosts/views/${postId}`)
            .send(viewInfo1)
    
        const resView2 = await request(app)
            .put(`/activityPosts/views/${postId}`)
            .send(viewInfo2)
    
        const resAnalytics1 = await request(app)
            .get(`/activityPosts/demographics/${postId}?start=2021-03-05T19:49:35.744Z`)
        
        expect(resAnalytics1.body.departments).toHaveLength(2);
        expect(resAnalytics1.body.affiliations).toHaveLength(1);
        expect(resAnalytics1.body.graduationYears).toHaveLength(2);
    
        const computerScienceDepartment = resAnalytics1.body.departments.find((department: { _id: string; }) => department._id === 'Computer Science');
        expect(computerScienceDepartment).toBeDefined();
        expect(computerScienceDepartment.count).toBe(1);
    
        const economicsScienceDepartment = resAnalytics1.body.departments.find((department: { _id: string; }) => department._id === 'Economics');
        expect(economicsScienceDepartment).toBeDefined();
        expect(economicsScienceDepartment.count).toBe(1);
    
        const affiliationStudent = resAnalytics1.body.affiliations.find((affiliation: { _id: string; }) => affiliation._id === 'Student');
        expect(affiliationStudent).toBeDefined();
        expect(affiliationStudent.count).toBe(2);
    
        const graduationYear2023 = resAnalytics1.body.graduationYears.find((graduationYear: { _id: string; }) => graduationYear._id === '2023');
        expect(graduationYear2023).toBeDefined();
        expect(graduationYear2023.count).toBe(1);
    
        const graduationYear2024 = resAnalytics1.body.graduationYears.find((graduationYear: { _id: string; }) => graduationYear._id === '2024');
        expect(graduationYear2024).toBeDefined();
        expect(graduationYear2024.count).toBe(1);
    
        const resAnalytics2 = await request(app)
            .get(`/activityPosts/demographics/${otherPostId}?start=2021-03-05T19:49:35.744Z`)
    
        expect(resAnalytics2.body.departments).toEqual([]);
        expect(resAnalytics2.body.affiliations).toEqual([]);
        expect(resAnalytics2.body.graduationYears).toEqual([]);
    
    
        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profile1Id}`);
        await request(app).delete(`/profiles/${profile2Id}`);
        await request(app).delete(`/profiles/${profile3Id}`);
        await request(app).delete(`/activityPosts/${postId}`);
        await request(app).delete(`/activityPosts/${otherPostId}`);
    });

    test('GET demographics for invalid profile ID with start date', async () => {
        const invalid_id = '1234567890abcdefg'
        const res = await request(app)
        .get(`/profiles/demographics/${invalid_id}?start=2020-03-05T19:49:35.744Z`)
        expect(res.status).toBe(500);
    });

    test('GET /activityPosts/demographics/:_id with no views of profile _id', async () => {
        
        const profile1 = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
        const profileRes1 = await request(app)
        .post('/profiles')
        .send(profile1);
    
    
        const profile2 = {
            "firstName": "Tad",
            "lastName": "Berkery",
            "email": "tberker2@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }
        const profileRes2 = await request(app)
        .post('/profiles')
        .send(profile2);
    
        const activityPost1 = {
            "userId": profileRes1.body.data._id,
            "userFirstName": "Ilana",
            "userLastName": "Chalom",
            "activityTitle": "Testing your code"
        }
    
        const res1 = await request(app)
            .post('/activityPosts')
            .send(activityPost1);
    
        // Extract the created post ID from the response
        const activityPostId = res1.body.newPost._id;
        const profile2Id = profileRes2.body.data._id;
    
    
        const resAnalytics = await request(app)
            .get(`/activityPosts/demographics/${activityPostId}?start=2020-03-05T19:49:35.744Z`)
    
        expect(resAnalytics.body.departments).toHaveLength(0);
        expect(resAnalytics.body.affiliations).toHaveLength(0);
        expect(resAnalytics.body.graduationYears).toHaveLength(0);
    
        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profileRes1.body.data._id}`);
        await request(app).delete(`/profiles/${profile2Id}`);
        await request(app).delete(`/activityPosts/${activityPostId}`);
    });

    test("PUT view for bogus profile ID", async () => {
        const profile1 = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
    
        const profile2 = {
            "firstName": "Kat",
            "lastName": "Forbes",
            "email": "kforbes6@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }
    
        const res1 = await request(app)
            .post('/profiles')
            .send(profile1);
    
        const res2 = await request(app)
            .post('/profiles')
            .send(profile2);

        // Extract the created post ID from the response
        const profile1Id = res1.body.data._id;
        const profile2Id = res2.body.data._id;
        
        const viewInfo1 = {
            "viewerId": profile2Id,
            "timestamp": "2022-02-17T13:36:45.954Z",
            "duration": 120
        }
    
        const resView1 = await request(app)
            .put(`/profiles/views/notARealId}`)
            .send(viewInfo1)

        expect(resView1.status).toBe(500);
    
        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profile1Id}`);
        await request(app).delete(`/profiles/${profile2Id}`);
    })

    test("PUT view for bogus viewer ID and other bogus combinations", async () => {
        const profile1 = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
    
        const profile2 = {
            "firstName": "Kat",
            "lastName": "Forbes",
            "email": "kforbes6@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }
    
        const res1 = await request(app)
            .post('/profiles')
            .send(profile1);
    
        const res2 = await request(app)
            .post('/profiles')
            .send(profile2);

        // Extract the created post ID from the response
        const profile1Id = res1.body.data._id;
        const profile2Id = res2.body.data._id;
        
        const viewInfo1 = {
            "viewerId": "notARealId",
            "timestamp": "2022-02-17T13:36:45.954Z",
            "duration": 120
        };
    
        const resView1Put = await request(app)
            .put(`/profiles/views/${profile1Id}}`)
            .send(viewInfo1);

        expect(resView1Put.status).toBe(500);

        const resViewGetInvalid = await request(app)
            .get(`/profiles/views/bogusInvalidId`)
            .send(viewInfo1);

        expect(resViewGetInvalid.status).toBe(500);

        const resViewGetValid = await request(app)
            .get(`/profiles/views/${profile1Id}`)
            .send(viewInfo1);

        expect(resViewGetValid.status).toBe(200);

        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profile1Id}`);
        await request(app).delete(`/profiles/${profile2Id}`);
    })

    test("GET demographics for invalid profile ID", async () => {
       const response = await request(app)
        .get("/profiles/demographics/nonsenseInvalidId")
       expect(response.status).toBe(500)
    })

    test("GET demographics for valid profile ID with no views", async () => {
        const profile1 = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
    
        const profile2 = {
            "firstName": "Kat",
            "lastName": "Forbes",
            "email": "kforbes6@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }
    
        const res1 = await request(app)
            .post('/profiles')
            .send(profile1);
    
        const res2 = await request(app)
            .post('/profiles')
            .send(profile2);

        // Extract the created post ID from the response
        const profile1Id = res1.body.data._id;
        const profile2Id = res2.body.data._id;

        const resView = await request(app)
            .get(`/profiles/demographics/${profile1Id}`)

        expect(resView.status).toBe(200);
        expect(resView.body.departments).toEqual([]);
        expect(resView.body.affiliations).toEqual([]);
        expect(resView.body.graduationYears).toEqual([]);

        await request(app).delete(`/profiles/${profile1Id}`);
        await request(app).delete(`/profiles/${profile2Id}`);
     })
 


    



     test("GET demographics for valid post ID with no views", async () => {
        const profile1 = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
    
        const profile2 = {
            "firstName": "Kat",
            "lastName": "Forbes",
            "email": "kforbes6@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }
    
        const res1 = await request(app)
            .post('/profiles')
            .send(profile1);
    
        const res2 = await request(app)
            .post('/profiles')
            .send(profile2);

        // Extract the created post ID from the response
        const profile1Id = res1.body.data._id;
        const profile2Id = res2.body.data._id;

        const activityPost1 = {
            "userId": profile1Id,
            "userFirstName": "Ilana",
            "userLastName": "Chalom",
            "activityTitle": "Debugging your code"
    }
        const res3 = await request(app)
            .post('/activityPosts')
            .send(activityPost1);
        const postId = res3.body.newPost._id;
        const resView = await request(app)
            .get(`/activityPosts/views/${postId}`);
        
        expect(resView.status).toBe(200);
        expect(resView.body.data.views).toEqual([]);

        await request(app).delete(`/profiles/${profile1Id}`);
        await request(app).delete(`/profiles/${profile2Id}`);
        await request(app).delete(`/activityPosts/${postId}`)
     })
 


     test('GET /activityPosts/demographics/:_id with multiple views of profile _id', async () => {
        
        const profile1 = {
            "firstName": "Ilana",
            "lastName": "Chalom",
            "email": "ichalom1@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2024"
        }
    
        const profile2 = {
            "firstName": "Kat",
            "lastName": "Forbes",
            "email": "kforbes6@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2023,
            "department": "Computer Science",
            "description": "I'm a member of the JHU Class of 2023"
        }
    
        const profile3 = {
            "firstName": "Tad",
            "lastName": "Berkery",
            "email": "tberker2@jhu.edu",
            "affiliation": "Student",
            "graduationYear": 2024,
            "department": "Economics",
            "description": "I'm creating this profile just for example."
        }
    
        const res1 = await request(app)
            .post('/profiles')
            .send(profile1);
    
        const res2 = await request(app)
            .post('/profiles')
            .send(profile2);
    
        const res3 = await request(app)
            .post('/profiles')
            .send(profile3);
    
        const activityPost1 = {
                "userId": res1.body.data._id,
                "userFirstName": "Ilana",
                "userLastName": "Chalom",
                "activityTitle": "Debugging your code"
        }
        const activityPost2 = {
            "userId": res1.body.data._id,
            "userFirstName": "Ilana",
            "userLastName": "Chalom",
            "activityTitle": "testing your code"
    }
        const res4 = await request(app)
            .post('/activityPosts')
            .send(activityPost1);
    
        const res5 = await request(app)
            .post('/activityPosts')
            .send(activityPost2);
        // Extract the created post ID from the response
        const profile1Id = res1.body.data._id;
        const profile2Id = res2.body.data._id;
        const profile3Id = res3.body.data._id;
        const postId = res4.body.newPost._id;
        const otherPostId = res5.body.newPost._id;
        const viewInfo1 = {
            "viewerId": profile2Id,
            "timestamp": "2022-02-17T13:36:45.954Z",
            "duration": 120
        }
    
        const viewInfo2 = {
            "viewerId": profile3Id,
            "timestamp": "2022-02-18T13:36:45.954Z",
            "duration": 130
        }
    
        const resView1 = await request(app)
            .put(`/activityPosts/views/${postId}`)
            .send(viewInfo1)
    
        const resView2 = await request(app)
            .put(`/activityPosts/views/${postId}`)
            .send(viewInfo2)
    
        const resAnalytics1 = await request(app)
            .get(`/activityPosts/demographics/${postId}?start=2021-03-05T19:49:35.744Z`)
        
        expect(resAnalytics1.body.departments).toHaveLength(2);
        expect(resAnalytics1.body.affiliations).toHaveLength(1);
        expect(resAnalytics1.body.graduationYears).toHaveLength(2);
    
        const computerScienceDepartment = resAnalytics1.body.departments.find((department: { _id: string; }) => department._id === 'Computer Science');
        expect(computerScienceDepartment).toBeDefined();
        expect(computerScienceDepartment.count).toBe(1);
    
        const economicsScienceDepartment = resAnalytics1.body.departments.find((department: { _id: string; }) => department._id === 'Economics');
        expect(economicsScienceDepartment).toBeDefined();
        expect(economicsScienceDepartment.count).toBe(1);
    
        const affiliationStudent = resAnalytics1.body.affiliations.find((affiliation: { _id: string; }) => affiliation._id === 'Student');
        expect(affiliationStudent).toBeDefined();
        expect(affiliationStudent.count).toBe(2);
    
        const graduationYear2023 = resAnalytics1.body.graduationYears.find((graduationYear: { _id: string; }) => graduationYear._id === '2023');
        expect(graduationYear2023).toBeDefined();
        expect(graduationYear2023.count).toBe(1);
    
        const graduationYear2024 = resAnalytics1.body.graduationYears.find((graduationYear: { _id: string; }) => graduationYear._id === '2024');
        expect(graduationYear2024).toBeDefined();
        expect(graduationYear2024.count).toBe(1);
    
        const resAnalytics2 = await request(app)
            .get(`/activityPosts/demographics/${otherPostId}?start=2021-03-05T19:49:35.744Z`)
    
        expect(resAnalytics2.body.departments).toEqual([]);
        expect(resAnalytics2.body.affiliations).toEqual([]);
        expect(resAnalytics2.body.graduationYears).toEqual([]);
    
    
        // Clean up: Delete the post created during the test
        await request(app).delete(`/profiles/${profile1Id}`);
        await request(app).delete(`/profiles/${profile2Id}`);
        await request(app).delete(`/profiles/${profile3Id}`);
        await request(app).delete(`/activityPosts/${postId}`);
        await request(app).delete(`/activityPosts/${otherPostId}`);
    });


  
  afterAll(async () => {
        await App.close(); // Close the MongoDB connection
    });

});



