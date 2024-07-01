import { ObjectId } from 'mongodb';

require('dotenv').config()

const ReportDaoClass = require('../../data/ReportDao.ts');
const ReportModel = require('../../model/Report.ts');
const { faker } = require('@faker-js/faker');
const mg = require('mongoose');
const URI = process.env.ATLAS_URI_TEST

beforeAll(async () => {
    await mg.connect(URI);
    await ReportModel.deleteMany({});
});

afterAll(async () => {
    await ReportModel.deleteMany({});
    await mg.connection.close();
});

test ('create report', async () => {
    const ReportDao = new ReportDaoClass();
    const reporterId = faker.lorem.word();
    const reporterFirstName = faker.person.firstName();
    const reporterLastName = faker.person.lastName();
    const content = faker.lorem.words();
    const reporteeId = faker.lorem.word();
    const reporteeFirstName = faker.person.firstName();
    const reporteeLastName = faker.person.lastName();

    const newReport = await ReportDao.create(reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName);

    expect(newReport).toBeDefined();
    expect(newReport.reporterId).toBe(reporterId);
    expect(newReport.reporterFirstName).toBe(reporterFirstName);
    expect(newReport.reporterLastName).toBe(reporterLastName);
    expect(newReport.content).toBe(content);
    expect(newReport.reporteeId).toBe(reporteeId);
    expect(newReport.reporteeFirstName).toBe(reporteeFirstName);
    expect(newReport.reporteeLastName).toBe(reporteeLastName);
});

test('read all reports', async () => {
    const ReportDao = new ReportDaoClass();

    const reporterId = faker.lorem.word();
    const reporterFirstName = faker.person.firstName();
    const reporterLastName = faker.person.lastName();
    const content = faker.lorem.words();
    const reporteeId = faker.lorem.word();
    const reporteeFirstName = faker.person.firstName();
    const reporteeLastName = faker.person.lastName();

    await ReportDao.create(reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName);

    const reports = await ReportDao.readAll();

    expect(Array.isArray(reports)).toBe(true);

    expect(reports.length).toBeGreaterThan(0);
    reports.forEach((report: any) => {
        expect(report).toHaveProperty('reporterId');
        expect(report).toHaveProperty('reporterFirstName');
        expect(report).toHaveProperty('reporterLastName');
        expect(report).toHaveProperty('content');
        expect(report).toHaveProperty('reporteeId');
        expect(report).toHaveProperty('reporteeFirstName');
        expect(report).toHaveProperty('reporteeLastName');
    });
});

test('read all reports by reporter id', async () => {
    const ReportDao = new ReportDaoClass();

    const reporterId = faker.lorem.word();
    const reporterFirstName = faker.person.firstName();
    const reporterLastName = faker.person.lastName();
    const content = faker.lorem.words();
    const reporteeId = faker.lorem.word();
    const reporteeFirstName = faker.person.firstName();
    const reporteeLastName = faker.person.lastName();

    await ReportDao.create(reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName);
    await ReportDao.create(reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName);

    const reports = await ReportDao.readAllByReporter(reporterId);

    expect(Array.isArray(reports)).toBe(true);
    expect(reports.length).toBe(2);
});

test('read all reports by reportee id', async () => {
    const ReportDao = new ReportDaoClass();

    const reporterId = faker.lorem.word();
    const reporterFirstName = faker.person.firstName();
    const reporterLastName = faker.person.lastName();
    const content = faker.lorem.words();
    const reporteeId = faker.lorem.word();
    const reporteeFirstName = faker.person.firstName();
    const reporteeLastName = faker.person.lastName();

    await ReportDao.create(reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName);
    await ReportDao.create(reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName);

    const reports = await ReportDao.readAllByReportee(reporteeId);

    expect(Array.isArray(reports)).toBe(true);
    expect(reports.length).toBe(2);
});

test('update report', async () => {
    const ReportDao = new ReportDaoClass();

    const reporterId = faker.lorem.word();
    const reporterFirstName = faker.person.firstName();
    const reporterLastName = faker.person.lastName();
    const content = faker.lorem.words();
    const reporteeId = faker.lorem.word();
    const reporteeFirstName = faker.person.firstName();
    const reporteeLastName = faker.person.lastName();

    const newReport = await ReportDao.create(reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName);

    const updatedContent = faker.lorem.words();
    const updatedReport = await ReportDao.update(newReport._id, reporterId, reporterFirstName, reporterLastName, updatedContent, reporteeId, reporteeFirstName, reporteeLastName);

    expect(updatedReport).toBeDefined();
    expect(updatedReport._id).toEqual(newReport._id);
    expect(updatedReport.content).toBe(updatedContent);
});

test('update resolved status of report', async () => {
    const ReportDao = new ReportDaoClass();

    const reporterId = faker.lorem.word();
    const reporterFirstName = faker.person.firstName();
    const reporterLastName = faker.person.lastName();
    const content = faker.lorem.words();
    const reporteeId = faker.lorem.word();
    const reporteeFirstName = faker.person.firstName();
    const reporteeLastName = faker.person.lastName();

    const newReport = await ReportDao.create(reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName);

    const initialResolvedStatus = newReport.resolved;

    const updatedReport = await ReportDao.updateResolved(newReport._id);

    expect(updatedReport).toBeDefined();
    expect(updatedReport._id).toEqual(newReport._id);
    //expect(updatedReport.resolved).toBe(!initialResolvedStatus);
});

test('delete report', async () => {
    const ReportDao = new ReportDaoClass();

    const reporterId = faker.lorem.word();
    const reporterFirstName = faker.person.firstName();
    const reporterLastName = faker.person.lastName();
    const content = faker.lorem.words();
    const reporteeId = faker.lorem.word();
    const reporteeFirstName = faker.person.firstName();
    const reporteeLastName = faker.person.lastName();

    const newReport = await ReportDao.create(reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName);

    await ReportDao.delete(newReport._id);

    const deletedReport = await ReportDao.readOne(newReport._id);

    expect(deletedReport).toBeNull();
});

test('delete all reports', async () => {
    const ReportDao = new ReportDaoClass();

    const reporterId = faker.lorem.word();
    const reporterFirstName = faker.person.firstName();
    const reporterLastName = faker.person.lastName();
    const content = faker.lorem.words();
    const reporteeId = faker.lorem.word();
    const reporteeFirstName = faker.person.firstName();
    const reporteeLastName = faker.person.lastName();

    await ReportDao.create(reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName);
    await ReportDao.create(reporterId, reporterFirstName, reporterLastName, content, reporteeId, reporteeFirstName, reporteeLastName);

    await ReportDao.deleteAll();

    const reports = await ReportDao.readAll();

    expect(reports.length).toBe(0);
});