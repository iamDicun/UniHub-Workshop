import request from 'supertest';
import app from '../src/app.js';

describe('Health Check API', () => {
  it('should return 200 OK and health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body.services.database).toEqual('connected');
  });
});
