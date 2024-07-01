export {}

const request = require('supertest');
const express = require('express');
const router = require('../../../server/routes/index.ts');
const App = require('../../../server/app.ts');

App.dbConnection(true);
const app = App.app;
app.use(express.json());
app.use('/reports', router);

describe('Test Report Routes', () => {
    // Test POST /reports
    test('POST /reports', async () => {
        const newReportData = {
            reporterId: 'exampleReporterId',
            reporterFirstName: 'John',
            reporterLastName: 'Doe',
            content: 'Example content',
            reporteeId: 'exampleReporteeId',
            reporteeFirstName: 'Jane',
            reporteeLastName: 'Doe'
        };

        const res = await request(app)
            .post('/reports')
            .send(newReportData);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('newReport');
        await request(app).delete(`/reports/${res.body.newReport._id}`);
    });

    // Test GET /reports/findAll
    test('GET /reports/findAll', async () => {
        const res = await request(app)
            .get('/reports/findAll');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('reports');
    });

    // Test GET /reports/findOne/:id
    test('should return the report when it exists', async () => {
        const newReportData = {
            reporterId: 'exampleReporterId',
            reporterFirstName: 'John',
            reporterLastName: 'Doe',
            content: 'Example content',
            reporteeId: 'exampleReporteeId',
            reporteeFirstName: 'Jane',
            reporteeLastName: 'Doe'
        };
    
        const createRes = await request(app)
            .post('/reports')
            .send(newReportData);
        
        const reportId = createRes.body.newReport._id;
    
        const getRes = await request(app).get(`/reports/findOne/${reportId}`);
        
        expect(getRes.status).toBe(200);
        expect(getRes.body).toHaveProperty('report');
    
        await request(app).delete(`/reports/${reportId}`);
    });

    test('should return all reports by a specific reporter', async () => {
        const reporterId = 'exampleReporterId';
        const newReportData =
            {
                id: 1,
                reporterId: reporterId,
                reporterFirstName: 'John',
                reporterLastName: 'Doe',
                content: 'Report 1 by John Doe',
                reporteeId: 'reporteeId1',
                reporteeFirstName: 'Jane',
                reporteeLastName: 'Doe'
            }
        const createRes = await request(app)
        .post('/reports')
        .send(newReportData);
        const reportId = createRes.body.newReport._id;
    
        // Make a GET request to fetch reports by the specific reporter
        const res = await request(app).get(`/reports/findAllByReporterId/${reporterId}`);
        
        // Assertions
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('reports');
        expect(res.body.reports).toHaveLength(1);
        await request(app).delete(`/reports/${reportId}`);
    });

    test('should return all reports for a specific reportee', async () => {
        // Create mock data for the reports for the specific reportee
        const reporteeId = 'exampleReporteeId';
        const newReportData = 
            {
                id: 1,
                reporterId: 'reporterId1',
                reporterFirstName: 'John',
                reporterLastName: 'Doe',
                content: 'Report 1 for Jane Doe',
                reporteeId: reporteeId,
                reporteeFirstName: 'Jane',
                reporteeLastName: 'Doe'
            }
        const createRes = await request(app)
        .post('/reports')
        .send(newReportData);
        const reportId = createRes.body.newReport._id;

        const res = await request(app).get(`/reports/findAllByReporteeId/${reporteeId}`);
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('reports');
        expect(res.body.reports).toHaveLength(1);
        await request(app).delete(`/reports/${reportId}`)
    })

    test('should update a report by ID', async () => {
        const newReportData = {
            reporterId: 'exampleReporterId',
            reporterFirstName: 'John',
            reporterLastName: 'Doe',
            content: 'Example content',
            reporteeId: 'exampleReporteeId',
            reporteeFirstName: 'Jane',
            reporteeLastName: 'Doe'
        };
    
        const createRes = await request(app)
            .post('/reports')
            .send(newReportData);
        
        const reportId = createRes.body.newReport._id;
    
        const updatedReportData = {
            reporterId: 'updatedReporterId',
            reporterFirstName: 'Updated John',
            reporterLastName: 'Updated Doe',
            content: 'Updated content',
            reporteeId: 'updatedReporteeId',
            reporteeFirstName: 'Updated Jane',
            reporteeLastName: 'Updated Doe'
        };
    
        const updateRes = await request(app)
            .put(`/reports/${reportId}`)
            .send(updatedReportData);
    
        expect(updateRes.status).toBe(200);
        expect(updateRes.body).toHaveProperty('report');
        expect(updateRes.body.report).toMatchObject(updatedReportData);
    
        await request(app).delete(`/reports/${reportId}`);
    });

    test('should delete a report by ID', async () => {
        const newReportData = {
            reporterId: 'exampleReporterId',
            reporterFirstName: 'John',
            reporterLastName: 'Doe',
            content: 'Example content',
            reporteeId: 'exampleReporteeId',
            reporteeFirstName: 'Jane',
            reporteeLastName: 'Doe'
        };
    
        const createRes = await request(app)
            .post('/reports')
            .send(newReportData);
        
        const reportId = createRes.body.newReport._id;
    
        const deleteRes = await request(app)
            .delete(`/reports/${reportId}`);

        const getRes = await request(app).get(`/reports/findOne/${reportId}`);
        expect(getRes.status).toBe(404);
    });

    test('should resolve a report by ID', async () => {
        const newReportData = {
            reporterId: 'exampleReporterId',
            reporterFirstName: 'John',
            reporterLastName: 'Doe',
            content: 'Example content',
            reporteeId: 'exampleReporteeId',
            reporteeFirstName: 'Jane',
            reporteeLastName: 'Doe'
        };
    
        const createRes = await request(app)
            .post('/reports')
            .send(newReportData);
        
        const reportId = createRes.body.newReport._id;
        const resolveRes = await request(app)
            .put(`/reports/resolve/${reportId}`);

        const getRes = await request(app).get(`/reports/findOne/${reportId}`);
        expect(getRes.status).toBe(200);
        expect(getRes.body.report.resolved).toBe(true);
        await request(app).delete(`/reports/${reportId}`);
    });

    test('should return server error if deleting non-existing report', async () => {
        const res = await request(app).delete('/reports/nonExistingReportId');
        expect(res.status).toBe(500);
        expect(res.text).toBe('Server Error');
    });

    test('should return server error when updating non-existing report', async () => {
        const nonExistingId = 'nonExistingId';
    
        const invalidData = {
        };
    
        const updateRes = await request(app)
            .put(`/reports/${nonExistingId}`)
            .send(invalidData);
    
        expect(updateRes.status).toBe(500);
        expect(updateRes.text).toBe('Server Error');
    });
    
    test('should return server error when fetching a non-existing report', async () => {
        const nonExistingId = 'nonExistingId';
    
        const getRes = await request(app).get(`/reports/findOne/${nonExistingId}`);
    
        expect(getRes.status).toBe(500);
        expect(getRes.text).toBe('Server Error');
    });
    
    
    test('should return server error when resolving a non-existing report', async () => {
        const nonExistingId = 'nonExistingId';
            const putRes = await request(app).put(`/reports/resolve/${nonExistingId}`);
    
        expect(putRes.status).toBe(500);
        expect(putRes.text).toBe('Server Error');
    });
    
    afterAll(async () => {
        await App.close(); // Close the MongoDB connection
    });

});
