import { ActivityPostDao } from "./ActivityPostDao";

const Report = require("../model/Report.ts");
const mongoose = require("mongoose")

interface PostReview {
    postId: string;
    posterId: string;
    reviewerId: string;
    reviewDescription: string;
    rating: number;
}

export class ReportDao {

    async create(reporterId: string, reporterFirstName: string, reporterLastName: string, content: string, reporteeId: string, reporteeFirstName: string, reporteeLastName: string) {
        const newReport = {reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName, resolved: false}
        const data = await Report.create(newReport);
        return data;
    }

    async readAll() {
        const reports = await Report.find();
        return reports
    }

    async readOne( id: any ) { // find one Report by _id
        const report = await Report.findOne({ _id: id });
        return report;
    }

    async readAllByReporter(reporterId: any) {
        const reports = await Report.find({reporterId: reporterId});
        return reports;
    }

    async readAllByReportee(reporteeId: any) {
        const reports = await Report.find({reporteeId: reporteeId});
        return reports;
    }

    async update( id: any, reporterId: string, reporterFirstName: string, reporterLastName: string, content: string, reporteeId: string, reporteeFirstName: string, reporteeLastName: string) {
        const updatedReport = {reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName}
        const data = await Report.findByIdAndUpdate(id, updatedReport, {new: true});
        return data;
    }

    async updateResolved( id: any ) {
        const report = await Report.findOne({ _id: id });
        const data = await Report.findByIdAndUpdate(id, {resolved: !report.resolved});
        return data;
    }

    async delete( id: any ) {
        const data = await Report.findByIdAndDelete({ _id: id });
    }

    async deleteAll() {
        await Report.deleteMany({})
    }
}

module.exports = ReportDao;