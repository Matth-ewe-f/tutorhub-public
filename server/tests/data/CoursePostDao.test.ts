import { simpleFaker } from "@faker-js/faker";
import exp from "constants";
import { ObjectId } from "mongodb";

require('dotenv').config()
const CoursePostDao = require('../../data/CoursePostDao');
const CoursePostModel = require('../../model/CoursePost');
const {faker} = require('@faker-js/faker');
const mg = require("mongoose");
const URI = process.env.ATLAS_URI_TEST
// console.log("uri is ", URI);

beforeAll(async () => {
    await mg.connect(URI);
    await CoursePostModel.deleteMany({});
});

afterAll(async () => {
    await CoursePostModel.deleteMany({});
    await mg.connection.close();
});

test('test create() with all fields', async ()=> {
    const coursePostDao = new CoursePostDao();
    await mg.connect(URI);
    const userId = faker.lorem.word();
    const userFirstName = faker.person.firstName();
    const userLastName = faker.person.lastName();
    const courseName =  faker.lorem.word();
    const description =  faker.lorem.sentence();
    const price = faker.number.int(100);
    const courseNumber = (faker.finance.accountNumber());
    const courseDepartment = ["Computer Science"]
    const gradeReceived = faker.string.alpha();
    const semesterTaken = faker.date.month();
    const professorTakenWith = faker.person.lastName();
    const takenAtHopkins = true;
    const schoolTakenAt = "Johns Hopkins";
    
    const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, {description, price, courseNumber, courseDepartment, gradeReceived, semesterTaken, professorTakenWith, schoolTakenAt});
    expect(post.userId).toBe(userId);
    expect(post.userFirstName).toBe(userFirstName);
    expect(post.userLastName).toBe(userLastName);
    expect(post.courseName).toBe(courseName);
    expect(post.description).toBe(description);
    expect(post.price).toBe(price);
    expect(post.courseNumber).toBe(courseNumber);
    expect(post.courseDepartment[0]).toBe(courseDepartment[0]);
    expect(post.gradeReceived).toBe(gradeReceived);
    expect(post.semesterTaken).toBe(semesterTaken);
    expect(post.professorTakenWith).toBe(professorTakenWith);
    expect(post.takenAtHopkins).toBe(takenAtHopkins);
    expect(post.schoolTakenAt).toBe(schoolTakenAt);

});

test('test create() without optional fields', async ()=> {
    const coursePostDao = new CoursePostDao();
    await mg.connect(URI);
    const userId = faker.lorem.word();
    const userFirstName = faker.person.firstName();
    const userLastName = faker.person.lastName();
    const courseName =  faker.lorem.word();
    const takenAtHopkins = false;

    
    const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins);
    expect(post.userId).toBe(userId);
    expect(post.userFirstName).toBe(userFirstName);
    expect(post.userLastName).toBe(userLastName);
    expect(post.courseName).toBe(courseName);
    expect(post.takenAtHopkins).toBe(false);
});

test('test create() with some optional fields', async ()=> {
    const coursePostDao = new CoursePostDao();
    await mg.connect(URI);
    const userId = faker.lorem.word();
    const userFirstName = faker.person.firstName();
    const userLastName = faker.person.lastName();
    const courseName =  faker.lorem.word();
    const price = faker.number.int(100);
    const courseNumber = (faker.finance.accountNumber());
    const courseDepartment = ["Computer Science"]
    const professorTakenWith = faker.person.lastName();
    const takenAtHopkins = true;
    
    const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, { price, courseNumber, courseDepartment, professorTakenWith});
    expect(post.userId).toBe(userId);
    expect(post.userFirstName).toBe(userFirstName);
    expect(post.userLastName).toBe(userLastName);
    expect(post.courseName).toBe(courseName);
    expect(post.courseNumber).toBe(courseNumber);
    expect(post.courseDepartment[0]).toBe(courseDepartment[0]);
    expect(post.professorTakenWith).toBe(professorTakenWith);
    expect(post.takenAtHopkins).toBe(takenAtHopkins);
    
});

test('test readOne() for a valid id', async ()=> {
    const coursePostDao = new CoursePostDao();
    await mg.connect(URI);
    const userId = faker.lorem.word();
    const userFirstName = faker.person.firstName();
    const userLastName = faker.person.lastName();
    const courseName =  faker.lorem.word();
    const description =  faker.lorem.sentence();
    const price = faker.number.int(100);
    const courseNumber = (faker.finance.accountNumber());
    const courseDepartment = ["Computer Science"]
    const gradeReceived = faker.string.alpha();
    const semesterTaken = faker.date.month();
    const professorTakenWith = faker.person.lastName();
    const takenAtHopkins = true;
    const schoolTakenAt = "Johns Hopkins";
    
    const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, {description, price, courseNumber, courseDepartment, gradeReceived, semesterTaken, professorTakenWith, schoolTakenAt});
    expect(post.userId).toBe(userId);
    expect(post.userFirstName).toBe(userFirstName);
    expect(post.userLastName).toBe(userLastName);
    expect(post.courseName).toBe(courseName);
    expect(post.description).toBe(description);
    expect(post.price).toBe(price);
    expect(post.courseNumber).toBe(courseNumber);
    expect(post.courseDepartment[0]).toBe(courseDepartment[0]);
    expect(post.gradeReceived).toBe(gradeReceived);
    expect(post.semesterTaken).toBe(semesterTaken);
    expect(post.professorTakenWith).toBe(professorTakenWith);
    expect(post.takenAtHopkins).toBe(takenAtHopkins);
    expect(post.schoolTakenAt).toBe(schoolTakenAt);

    const id = post._id;
    const foundPost = await coursePostDao.readOne(id);
    expect(foundPost.userId).toBe(userId);
    expect(foundPost.userFirstName).toBe(userFirstName);
    expect(foundPost.userLastName).toBe(userLastName);
    expect(foundPost.courseName).toBe(courseName);
    expect(foundPost.description).toBe(description);
    expect(foundPost.price).toBe(price);
    expect(foundPost.courseNumber).toBe(courseNumber);
    expect(foundPost.courseDepartment[0]).toBe(courseDepartment[0]);
    expect(foundPost.gradeReceived).toBe(gradeReceived);
    expect(foundPost.semesterTaken).toBe(semesterTaken);
    expect(foundPost.professorTakenWith).toBe(professorTakenWith);
    expect(foundPost.takenAtHopkins).toBe(takenAtHopkins);
    expect(foundPost.schoolTakenAt).toBe(schoolTakenAt);
});

test('test readOne() for an invalid id', async ()=> {
    await mg.connect(URI);
    const id = new ObjectId(1)
    const coursePostDao = new CoursePostDao();
    const foundPost = await coursePostDao.readOne(id);
    expect(foundPost).toBe(null);
});

test('test readAll() on non empty table without filter', async ()=> {
    const coursePostDao = new CoursePostDao();
    await coursePostDao.deleteAll()
    await mg.connect(URI);
    for(let i = 0; i < 5; i++){
        const userId = faker.lorem.word();
        const userFirstName = faker.person.firstName();
        const userLastName = faker.person.lastName();
        const courseName =  faker.lorem.word();
        const price = faker.number.int(100);
        const courseNumber = (faker.finance.accountNumber());
        const courseDepartment = ["Computer Science"]
        const professorTakenWith = faker.person.lastName();
        const takenAtHopkins = true;
        const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, { price, courseNumber, courseDepartment, professorTakenWith});

    }
    const posts = await coursePostDao.readAll({});
    expect(posts.length).toBe(5);
});

test('test readAll() on non empty table with multiple matches for filter by courseName', async ()=> {
    const coursePostDao = new CoursePostDao();
    await coursePostDao.deleteAll()
    await mg.connect(URI);
    for(let i = 0; i < 5; i++){
        const userId = faker.lorem.word();
        const userFirstName = faker.person.firstName();
        const userLastName = faker.person.lastName();
        const courseName =  "Software Testing and Debugging TEST";
        const price = faker.number.int(100);
        const courseNumber = (faker.finance.accountNumber());
        const courseDepartment = ["Computer Science"]
        const professorTakenWith = faker.person.lastName();
        const takenAtHopkins = true;
        const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, { price, courseNumber, courseDepartment, professorTakenWith});

    }
    const posts = await coursePostDao.readAll({courseName: "Software Testing and Debugging TEST"});
    expect(posts.length).toBe(5);
});


test('test readAll() on non empty table returns partial matches for filter by courseName', async ()=> {
    const coursePostDao = new CoursePostDao();
    await coursePostDao.deleteAll()
    await mg.connect(URI);
    for(let i = 0; i < 5; i++){
        const userId = faker.lorem.word();
        const userFirstName = faker.person.firstName();
        const userLastName = faker.person.lastName();
        const courseName =  "Software Testing and Debugging TEST";
        const price = faker.number.int(100);
        const courseNumber = (faker.finance.accountNumber());
        const courseDepartment = ["Computer Science"]
        const professorTakenWith = faker.person.lastName();
        const takenAtHopkins = true;
        const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, { price, courseNumber, courseDepartment, professorTakenWith});

    }
    const posts = await coursePostDao.readAll({courseName: "Software Testing"});
    expect(posts.length).toBe(5);
});


test('test readAll() on non empty table with filter for courseName with one match', async ()=> {
    const coursePostDao = new CoursePostDao();
    await coursePostDao.deleteAll()
    await mg.connect(URI);
    for(let i = 0; i < 5; i++){
        const userId = faker.lorem.word();
        const userFirstName = faker.person.firstName();
        const userLastName = faker.person.lastName();
        const courseName =  faker.lorem.word();
        const description =  faker.lorem.sentence();
        const price = faker.number.int(100);
        const courseNumber = (faker.finance.accountNumber());
        const courseDepartment = ["Computer Science"]
        const gradeReceived = faker.string.alpha();
        const semesterTaken = faker.date.month();
        const professorTakenWith = faker.person.lastName();
        const takenAtHopkins = true;
        const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, {description, price, courseNumber, courseDepartment, professorTakenWith});
    }
    
    const userId = faker.lorem.word();
    const userFirstName = faker.person.firstName();
    const userLastName = faker.person.lastName();
    const courseName =  faker.lorem.word();
    const description =  faker.lorem.sentence();
    const price = faker.number.int(100);
    const courseNumber = (faker.finance.accountNumber());
    const courseDepartment = ["Computer Science"]
    const gradeReceived = faker.string.alpha();
    const semesterTaken = faker.date.month();
    const professorTakenWith = faker.person.lastName();
    const takenAtHopkins = true;
    const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, {description, price, courseNumber, courseDepartment, professorTakenWith, gradeReceived, semesterTaken});

    const postByCourseName = await coursePostDao.readAll({courseName: courseName})
    expect(postByCourseName).toBeDefined()
    expect(postByCourseName[0].userId).toBe(userId);
    expect(postByCourseName[0].userFirstName).toBe(userFirstName);
    expect(postByCourseName[0].userLastName).toBe(userLastName);
    expect(postByCourseName[0].courseName).toBe(courseName);
    expect(postByCourseName[0].description).toBe(description);
    expect(postByCourseName[0].price).toBe(price);
    expect(postByCourseName[0].courseNumber).toBe(courseNumber);
    expect(postByCourseName[0].courseDepartment[0]).toBe(courseDepartment[0]);
    expect(postByCourseName[0].gradeReceived).toBe(gradeReceived);
    expect(postByCourseName[0].semesterTaken).toBe(semesterTaken);
    expect(postByCourseName[0].professorTakenWith).toBe(professorTakenWith);
    expect(postByCourseName[0].takenAtHopkins).toBe(takenAtHopkins);
});


test('test readAll() on non empty table with multiple filters', async ()=> {
    const coursePostDao = new CoursePostDao();
    await coursePostDao.deleteAll()
    await mg.connect(URI);
    let courseName;
    let userFirstName;
    let userLastName;
    let courseNumber;
    let userId;
    let post;
    for(let i = 0; i < 5; i++){
        userId = faker.lorem.word();
        userFirstName = faker.person.firstName();
        userLastName = faker.person.lastName();
        courseName =  faker.lorem.word();
        const price = faker.number.int(100);
        courseNumber = (faker.finance.accountNumber());
        const courseDepartment = ["Computer Science"]
        const professorTakenWith = faker.person.lastName();
        const takenAtHopkins = true;
        const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, { price, courseNumber, courseDepartment, professorTakenWith});

    }
    const posts = await coursePostDao.readAll({courseName, courseNumber});
    expect(posts.length).toBe(1);
    expect(posts[0].userId).toBe(userId);
    // expect(posts[0]).toBe(post)
});


test('test update()', async ()=> {
    const coursePostDao = new CoursePostDao();
    await mg.connect(URI);
    const userId = faker.lorem.word();
    const userFirstName = faker.person.firstName();
    const userLastName = faker.person.lastName();
    const courseName =  faker.lorem.word();
    const description =  faker.lorem.sentence();
    const price = faker.number.int(100);
    const courseNumber = (faker.finance.accountNumber());
    const courseDepartment = ["Computer Science"]
    const gradeReceived = faker.string.alpha();
    const semesterTaken = faker.date.month();
    const professorTakenWith = faker.person.lastName();
    const takenAtHopkins = true;

    const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, { price, courseNumber, courseDepartment, professorTakenWith});
    // console.log("POST IS ", post);
    expect(post.userId).toBe(userId);
    expect(post.userFirstName).toBe(userFirstName);
    expect(post.userLastName).toBe(userLastName);
    expect(post.courseName).toBe(courseName);
    expect(post.price).toBe(price);
    expect(post.courseNumber).toBe(courseNumber);
    expect(post.courseDepartment[0]).toBe(courseDepartment[0]);
    expect(post.professorTakenWith).toBe(professorTakenWith);
    expect(post.takenAtHopkins).toBe(takenAtHopkins);

    const id = post._id;
    const newCourseName = faker.lorem.word();
    const newPrice =faker.number.int(100);
    const updatingPost = await coursePostDao.update(id, userId, userFirstName, userLastName, newCourseName, takenAtHopkins, {description, price: newPrice, courseNumber, courseDepartment, gradeReceived, semesterTaken, professorTakenWith});
    const updatedPost = await coursePostDao.readOne(id);
    // console.log(updatedPost);
    expect(updatedPost.userId).toBe(userId);
    expect(updatedPost.courseName).toBe(newCourseName);
    expect(updatedPost.price).toBe(newPrice);
    expect(updatedPost.courseDepartment[0]).toBe(courseDepartment[0]);
});

test('test update() to add an optional param when none originally given', async ()=> {
    const coursePostDao = new CoursePostDao();
    await mg.connect(URI);
    const userId = faker.lorem.word();
    const userFirstName = faker.person.firstName();
    const userLastName = faker.person.lastName();
    const courseName =  faker.lorem.word();
    const takenAtHopkins = true;
    const description =  faker.lorem.sentence();
    const price = faker.number.int(100);
    const courseNumber = (faker.finance.accountNumber());
    const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins);
    expect(post.userId).toBe(userId);
    expect(post.courseName).toBe(courseName);

    const id = post._id;
    const updatingPost = await coursePostDao.update(id, userId, userFirstName, userLastName, courseName, takenAtHopkins, {description, price, courseNumber})
    const updatedPost = await coursePostDao.readOne(id);
    // console.log(updatedPost);
    expect(updatedPost.userId).toBe(userId);
    expect(updatedPost.courseName).toBe(courseName);
    expect(updatedPost.description).toBe(description);
    expect(updatedPost.price).toBe(price);
    expect(updatedPost.courseNumber).toBe(courseNumber);

});

test('test update() to add an optional param originally not given', async ()=> {
    const coursePostDao = new CoursePostDao();
    await mg.connect(URI);
    const userId = faker.lorem.word();
    const userFirstName = faker.person.firstName();
    const userLastName = faker.person.lastName();
    const courseName =  faker.lorem.word();
    const takenAtHopkins = true;
    const description =  faker.lorem.sentence();
    const price = faker.number.int(100);
    const courseNumber = (faker.finance.accountNumber());
    const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, {description});
    expect(post.userId).toBe(userId);
    expect(post.courseName).toBe(courseName);
    expect(post.description).toBe(description);

    const id = post._id;
    const updatingPost = await coursePostDao.update(id, userId, userFirstName, userLastName, courseName, takenAtHopkins, {description, price, courseNumber})
    const updatedPost = await coursePostDao.readOne(id);
    expect(updatedPost.userId).toBe(userId);
    expect(updatedPost.courseName).toBe(courseName);
    expect(updatedPost.description).toBe(description);
    expect(updatedPost.price).toBe(price);
    expect(updatedPost.courseNumber).toBe(courseNumber);
});

test('test delete() with a valid ID', async ()=> {
    const coursePostDao = new CoursePostDao();
    await mg.connect(URI);
    const userId = faker.lorem.word();
    const userFirstName = faker.person.firstName();
    const userLastName = faker.person.lastName();
    const courseName =  faker.lorem.word();
    const price = faker.number.int(100);
    const courseNumber = (faker.finance.accountNumber());
    const courseDepartment = ["Computer Science"]
    const professorTakenWith = faker.person.lastName();
    const takenAtHopkins = true;
    
    const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, { price, courseNumber, courseDepartment, professorTakenWith});
    expect(post.userId).toBe(userId);
    expect(post.courseName).toBe(courseName);
    expect(post.price).toBe(price);
    expect(post.courseNumber).toBe(courseNumber);
    expect(post.courseDepartment[0]).toBe(courseDepartment[0]);
    expect(post.professorTakenWith).toBe(professorTakenWith);
    expect(post.takenAtHopkins).toBe(takenAtHopkins);

    const id = post._id;
    const deleting = await coursePostDao.delete(id);
    expect(deleting.courseName).toBe(courseName);
    const deleted = await coursePostDao.readOne(id);
    expect(deleted).toBe(null);
});

test('test delete() for an invalid id', async ()=> {
    await mg.connect(URI);
    const id = new ObjectId(1)
    const coursePostDao = new CoursePostDao();
    const foundPost = await coursePostDao.delete(id);
    expect(foundPost).toBe(null);
});

test('test add profile view for valid id', async() => {
    const coursePostDao = new CoursePostDao();
    await mg.connect(URI);
    const userId = faker.lorem.word();
    const userFirstName = faker.person.firstName();
    const userLastName = faker.person.lastName();
    const courseName =  faker.lorem.word();
    const price = faker.number.int(100);
    const courseNumber = (faker.finance.accountNumber());
    const courseDepartment = ["Computer Science"]
    const professorTakenWith = faker.person.lastName();
    const takenAtHopkins = true;
    
    const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, { price, courseNumber, courseDepartment, professorTakenWith});

    const id = new ObjectId(1);
    const timestamp = "2022-02-17T13:36:45.954Z";
    const duration = 120;
    const updatedPost = await coursePostDao.updateViews(post._id, id, timestamp, duration)

    expect(updatedPost._id).toMatchObject(post._id);
    expect(updatedPost.views).toHaveLength(1);

    const firstView = updatedPost.views[0];
    expect(firstView.timestamp.toISOString()).toBe(timestamp); // Convert toISOString to match MongoDB Date format
    expect(firstView.durationInSeconds).toBe(duration);
    expect(firstView.viewerId).toMatchObject(id);
})

test('test observe profile view for valid id', async() => {
    const coursePostDao = new CoursePostDao();
    await mg.connect(URI);
    const userId = faker.lorem.word();
    const userFirstName = faker.person.firstName();
    const userLastName = faker.person.lastName();
    const courseName =  faker.lorem.word();
    const price = faker.number.int(100);
    const courseNumber = (faker.finance.accountNumber());
    const courseDepartment = ["Computer Science"]
    const professorTakenWith = faker.person.lastName();
    const takenAtHopkins = true;
    
    const post =  await coursePostDao.create(userId, userFirstName, userLastName, courseName, takenAtHopkins, { price, courseNumber, courseDepartment, professorTakenWith});


    const id = new ObjectId(1);
    const timestamp = "2022-02-17T13:36:45.954Z";
    const duration = 120;
    const updatedPost = await coursePostDao.updateViews(post._id, id, timestamp, duration)
    
    const retrievedPost = await coursePostDao.readViewsById(post._id);

    expect(retrievedPost._id).toMatchObject(post._id);
    expect(retrievedPost.views).toHaveLength(1);

    const firstView = retrievedPost.views[0];
    expect(firstView.timestamp.toISOString()).toBe(timestamp); // Convert toISOString to match MongoDB Date format
    expect(firstView.durationInSeconds).toBe(duration);
    expect(firstView.viewerId).toMatchObject(id);
})

