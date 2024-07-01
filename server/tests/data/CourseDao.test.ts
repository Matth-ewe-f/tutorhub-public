import { simpleFaker } from "@faker-js/faker";
import { ObjectId } from "mongodb";

require('dotenv').config()
const CourseDao = require('../../data/CourseDao');
const {faker} = require('@faker-js/faker');
const mg = require("mongoose");
const URI = process.env.ATLAS_URI_TEST

afterAll(async () => {
    await mg.disconnect();
});

test('test create() with all fields', async ()=> {
    const courseDao = new CourseDao();
    await mg.connect(URI);
    await courseDao.deleteAll()
    const courseTitle =  faker.lorem.word();
    const courseNumber = (faker.finance.accountNumber());
    const courseDepartment = ["Computer Science"]
    
    const post =  await courseDao.create(courseTitle, courseNumber, courseDepartment);
    expect(post.courseTitle).toBe(courseTitle);
    expect(post.courseNumber).toBe(courseNumber);
    expect(post.courseDepartment[0]).toBe(courseDepartment[0]);
});

test('test readOne() for a valid id', async ()=> {
    const courseDao = new CourseDao();
    await mg.connect(URI);
    await courseDao.deleteAll()
    const courseTitle =  faker.lorem.word();
    const courseNumber = (faker.finance.accountNumber());
    const courseDepartment = ["Computer Science"]
    
    const post =  await courseDao.create(courseTitle, courseNumber, courseDepartment);
    expect(post.courseTitle).toBe(courseTitle);
    expect(post.courseNumber).toBe(courseNumber);
    expect(post.courseDepartment[0]).toBe(courseDepartment[0]);

    const id = post._id;
    const foundPost = await courseDao.readOne(id);
    expect(foundPost.courseTitle).toBe(courseTitle);
    expect(foundPost.courseNumber).toBe(courseNumber);
    expect(foundPost.courseDepartment[0]).toBe(courseDepartment[0]);
});

test('test readOne() for an invalid id', async ()=> {
    await mg.connect(URI);
    const id = new ObjectId(1)
    const courseDao = new CourseDao();
    const foundPost = await courseDao.readOne(id);
    expect(foundPost).toBe(null);
});

test('test readAll() on non empty table without filter', async ()=> {
    const courseDao = new CourseDao();
    await courseDao.deleteAll()
    await mg.connect(URI);
    for(let i = 0; i < 5; i++){
        const courseTitle =  faker.lorem.word();
        const courseNumber = (faker.finance.accountNumber());
        const courseDepartment = ["Computer Science"]
        const post =  await courseDao.create(courseTitle, courseNumber, courseDepartment);
    }
    const posts = await courseDao.readAll({});
    expect(posts.length).toBe(5);
});

test('test readAll() on non empty table with match for filter by courseTitle', async ()=> {
    const courseDao = new CourseDao();
    await courseDao.deleteAll()
    await mg.connect(URI);
    for(let i = 0; i < 5; i++){
        
        const courseTitle =   `Software Testing and Debugging TEST ${i}`;
        const courseNumber = (faker.finance.accountNumber());
        const courseDepartment = ["Computer Science"]
        
        const post =  await courseDao.create(courseTitle,  courseNumber, courseDepartment);
    }
    const posts = await courseDao.readAll({courseTitle: "Software Testing and Debugging TEST 0"});
    expect(posts.length).toBe(1);
});


test('test readAll() on non empty table returns partial matches for filter by courseTitle', async ()=> {
    const courseDao = new CourseDao();
    await courseDao.deleteAll()
    await mg.connect(URI);
    for(let i = 0; i < 5; i++){
        const courseTitle =  `Software Testing and Debugging TEST ${i}`;
        const courseNumber = (faker.finance.accountNumber());
        const courseDepartment = ["Computer Science"]
        
        const post =  await courseDao.create(courseTitle,  courseNumber, courseDepartment);
    }
    const posts = await courseDao.readAll({courseTitle: "Software Testing"});
    expect(posts.length).toBe(5);
});


test('test readAll() on non empty table with multiple filters', async ()=> {
    const courseDao = new CourseDao();
    await courseDao.deleteAll()
    await mg.connect(URI);
    let courseTitle;
    let courseNumber;
    let post;
    for(let i = 0; i < 5; i++){
        courseTitle =  faker.lorem.word();
        courseNumber = (faker.finance.accountNumber());
        const courseDepartment = ["Computer Science"]
       
        const post =  await courseDao.create(courseTitle, courseNumber, courseDepartment);
    }
    const posts = await courseDao.readAll({courseTitle, courseNumber});
    expect(posts.length).toBe(1);
});


test('test update()', async ()=> {
    
    const courseDao = new CourseDao();
    await mg.connect(URI);
    await courseDao.deleteAll()
    const courseTitle =  faker.lorem.word();
    const courseNumber = (faker.finance.accountNumber());
    const courseDepartment = ["Computer Science"]
    
    const post =  await courseDao.create(courseTitle, courseNumber, courseDepartment);
    expect(post.courseTitle).toBe(courseTitle);
    expect(post.courseNumber).toBe(courseNumber);
    expect(post.courseDepartment[0]).toBe(courseDepartment[0]);

    const id = post._id;
    const newCourseTitle = faker.lorem.word();
    const updatingPost = await courseDao.update(id, newCourseTitle,  courseNumber, courseDepartment);
    const updatedPost = await courseDao.readOne(id);
    expect(updatedPost.courseNumber).toBe(courseNumber);
    expect(updatedPost.courseTitle).toBe(newCourseTitle);
    expect(updatedPost.courseDepartment[0]).toBe(courseDepartment[0]);
});

test('test delete() with a valid ID', async ()=> {
    const courseDao = new CourseDao();
    await mg.connect(URI);
    await courseDao.deleteAll()
    const courseTitle =  faker.lorem.word();
    const courseNumber = (faker.finance.accountNumber());
    const courseDepartment = ["Computer Science"]
    
    const post =  await courseDao.create(courseTitle, courseNumber, courseDepartment);
    expect(post.courseTitle).toBe(courseTitle);
    expect(post.courseNumber).toBe(courseNumber);
    expect(post.courseDepartment[0]).toBe(courseDepartment[0]);

    const id = post._id;
    const deleting = await courseDao.delete(id);
    expect(deleting.courseTitle).toBe(courseTitle);
    const deleted = await courseDao.readOne(id);
    expect(deleted).toBe(null);
});

test('test delete() for an invalid id', async ()=> {
    await mg.connect(URI);
    const id = new ObjectId(1)
    const courseDao = new CourseDao();
    const foundPost = await courseDao.delete(id);
    expect(foundPost).toBe(null);
});