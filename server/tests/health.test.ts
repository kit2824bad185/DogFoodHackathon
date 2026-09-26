import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Health check API', () => {
  it('should return 200 and healthy status', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.database).toBe('connected');
  });

  it('should return 404 for unknown route', async () => {
    const response = await request(app).get('/api/unknown');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
