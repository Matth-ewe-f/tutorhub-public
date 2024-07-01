export {}
const request = require('supertest');
const express = require('express');
const router = require('../../../server/routes/index.ts')
const course = require('../../../server/model/Course'); 
const App = require('../../../server/app.ts')
import { ObjectId } from "mongodb";


App.dbConnection(true)
const app = App.app

app.use(express.json());
app.use('/courses', router);

describe('Test courses routes', () => {
    test('POST /courses', async () => {
        // Create a post to get a valid post ID
        const newCourseData = {
            courseTitle: 'Linear Algebra',
            courseNumber: 'AS.110.201',
            courseDepartment: ['AS Mathematics']
        };

        const res = await request(app)
        .post('/courses')
        .send(newCourseData);

        // Extract the created post ID from the response
        const courseId = res.body.newCourse._id;
      
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('newCourse');
        expect(res.body.newCourse.courseTitle).toBe('Linear Algebra');
        expect(res.body.newCourse.courseNumber).toBe('AS.110.201');
        expect(res.body.newCourse.courseDepartment.length).toBe(1);
        expect(res.body.newCourse.courseDepartment[0]).toBe('AS Mathematics');

        // Clean up: Delete the post created during the test
        await request(app).delete(`/courses/${courseId}`);
    });

    test('/findOne/:id', async () => {
        // Create a post to get a valid post ID
        const newCourseData = {
            courseTitle: 'Linear Algebra',
            courseNumber: 'AS.110.201',
            courseDepartment: ['AS Mathematics']
        };

        const r = await request(app)
        .post('/courses')
        .send(newCourseData);

        // Extract the created post ID from the response
        const courseId = r.body.newCourse._id;
      
        const res = await request(app)
        .get(`/courses/findOne/${courseId}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('course');
        expect(res.body.course.courseTitle).toBe('Linear Algebra');
        expect(res.body.course.courseNumber).toBe('AS.110.201');
        expect(res.body.course.courseDepartment.length).toBe(1);
        expect(res.body.course.courseDepartment[0]).toBe('AS Mathematics');

        // Clean up: Delete the post created during the test
        await request(app).delete(`/courses/${courseId}`);
    });

    test('/findOne/:id for course that does not exist', async () => {
        const courseId =  new ObjectId()
      
        const res = await request(app)
        .get(`/courses/findOne/${courseId}`);
        expect(res.status).toBe(404);
    });

    test('/all ', async () => {
        // Create a post to get a valid post ID
        const courseTitle ='Linear Algebra';
        const newCourseData = {
            courseTitle,
            courseNumber: 'AS.110.201',
            courseDepartment: ['AS Mathematics']
        };

        const r = await request(app)
        .post('/courses')
        .send(newCourseData);
      

        // Extract the created post ID from the response
        const courseId = r.body.newCourse._id;
        const badCourseTitle = 'Linear Algebraa'
        const res = await request(app)
        .get(`/courses/all?courseTitle=${badCourseTitle}`)
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('courses');
        expect(res.body.courses.length).toBe(0);
        const res2 = await request(app)
        .get(`/courses/all?courseTitle=${courseTitle}`)
        expect(res2.status).toBe(200);
        expect(res2.body).toHaveProperty('courses');
        expect(res2.body.courses.length).toBe(1);

        // Clean up: Delete the post created during the test
        await request(app).delete(`/courses/${courseId}`);
    });


      afterAll(async () => {
        await App.close(); // Close the MongoDB connection
    });
}); 
