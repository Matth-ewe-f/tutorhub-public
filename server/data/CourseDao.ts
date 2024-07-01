const Course = require("../model/Course.ts");
const mongoose = require("mongoose");

export class CourseDao {
    async create(courseTitle:string, courseNumber:string, courseDepartment:string[]) {
        try {
            const data = await Course.create({courseTitle, courseNumber, courseDepartment});
            return data;
        } catch (err) {
            console.error("Error creating course ", courseTitle, ": ", err);
        }
    }
    async readOne( id : any ) { // find one course by _id
        const course = await Course.findOne({ _id: id });
        return course;
    }
    async readAll({courseTitle, courseNumber, courseDepartment} : {courseTitle: string, courseNumber: string, courseDepartment: string}) {
        const filter : any = {};
        if (courseTitle) {
            filter.courseTitle = {$regex: courseTitle, $options: 'i'};
        }
        if (courseNumber) {
            filter.courseNumber = {$regex: courseNumber, $options: 'i'};
        }
        if (courseDepartment) {
            filter.courseDepartment = {$regex: courseDepartment, $options: 'i'};
        }
        try {
            const courses = await Course.find(filter);
            return courses
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    }
    async update( id: any, courseTitle:string, courseCode:string, courseDepartment:string[], isUpperLevel:boolean, courseDescription:string ) {
        const data = await Course.findByIdAndUpdate(id, {courseTitle, courseCode, courseDepartment, isUpperLevel, courseDescription})
        return data;
    }
    async delete(id : any) {
        const data = await Course.findOneAndDelete({ _id: id });
        return data;
    }
    async deleteAll(){
        await Course.deleteMany({})
    }
}
module.exports = CourseDao;