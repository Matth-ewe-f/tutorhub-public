const axios = require("axios");

async function getCourses(school) {
    let coursesToAdd = new Map();
    const data = await axios.get(`https://sis.jhu.edu/api/classes/${school}/Spring 2024?key=KFc5nPpzg735eByE0sb6iWumaOtORpSt`)
    for (let i = 0; i < data.data.length; i++) {
        if ((i != 0 && data.data[i].OfferingName === data.data[i-1].OfferingName) || !data.data[i].AllDepartments || !data.data[i].OfferingName || coursesToAdd.has(data.data[i].OfferingName)){
            continue;
        }
        const departments = data.data[i].AllDepartments.split("^")
        const curCourse = {"courseTitle": data.data[i].Title, "courseNumber": data.data[i].OfferingName, "courseDepartment": departments};
        coursesToAdd.set(data.data[i].OfferingName, curCourse);
    }
    const dataFall = await axios.get(`https://sis.jhu.edu/api/classes/${school}/Fall 2023?key=KFc5nPpzg735eByE0sb6iWumaOtORpSt`)
    for (let i = 0; i < dataFall.data.length; i++) {
        if ((i != 0 && dataFall.data[i].OfferingName === dataFall.data[i-1].OfferingName) || !dataFall.data[i].AllDepartments || !dataFall.data[i].OfferingName || coursesToAdd.has(dataFall.data[i].OfferingName)){
            continue;
        }
        const departments = dataFall.data[i].AllDepartments.split("^")
        const curCourse = {"courseTitle": dataFall.data[i].Title, "courseNumber": dataFall.data[i].OfferingName, "courseDepartment": departments};
        coursesToAdd.set(dataFall.data[i].OfferingName, curCourse);
    }
    return coursesToAdd.values();
}

async function storeCourses(school) {
    const courses = await getCourses(school);    
    for(const course of courses){
        try {
            const data = await axios.post(`http://localhost:6300/courses/`, course);
        } catch (err) {
            console.log("error is ", err);
        }
    }
}

storeCourses("Whiting School of Engineering");
storeCourses("Krieger School of Arts and Sciences");

