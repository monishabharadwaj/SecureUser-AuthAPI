const request = require('supertest');
const app = require('../app');

describe('Auth API Integration Tests', () => {

    const uniqueEmail = `jest${Date.now()}@gmail.com`;

    const testUser = {
        name: "Jest User",
        username: `jestuser${Date.now()}`,
        email: uniqueEmail,
        password: "Password@123",
        phone: "9999999999",
        website: "jest.com"
    };

    let accessToken;

    it('should register a user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('accessToken');
    });

    it('should login the user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: uniqueEmail,
                password: testUser.password
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('accessToken');

        accessToken = res.body.accessToken;
    });

    it('should access protected route with valid token', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(res.statusCode).toBe(200);
    });

});