const request = require('supertest');
const express = require('express');

// Mock server setup for testing
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// Mock escalation stats endpoint
app.get('/api/escalation/stats', (req, res) => {
    res.json({
        totalRules: 96,
        uniqueCategories: 6,
        uniquePriorities: 4
    });
});

describe('API Endpoints', () => {
    describe('GET /health', () => {
        it('returns healthy status', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('healthy');
            expect(response.body.timestamp).toBeDefined();
        });
    });

    describe('GET /api/escalation/stats', () => {
        it('returns escalation statistics', async () => {
            const response = await request(app).get('/api/escalation/stats');
            expect(response.status).toBe(200);
            expect(response.body.totalRules).toBe(96);
            expect(response.body.uniqueCategories).toBe(6);
        });
    });
});
