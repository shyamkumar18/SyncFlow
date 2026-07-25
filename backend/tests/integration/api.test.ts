import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('Protected API Endpoints', () => {
  let accessToken: string;

  beforeAll(async () => {
    // Register and login to get token
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'api@test.com', password: 'Test@1234', displayName: 'API Test' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'api@test.com', password: 'Test@1234' });

    accessToken = loginRes.body.data.accessToken;
  });

  describe('Health Check', () => {
    it('GET /api/health should return OK', async () => {
      const res = await request(app).get('/api/health').expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Transactions API', () => {
    it('GET /api/transactions should return empty list', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('POST /api/transactions should create a transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 1500,
          type: 'debit',
          date: '2024-03-15',
          bank: 'HDFC Bank',
          description: 'Test transaction',
          merchant: 'Amazon',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(1500);
      expect(res.body.data.type).toBe('debit');
    });

    it('GET /api/transactions/summary should return summary', async () => {
      const res = await request(app)
        .get('/api/transactions/summary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalIncome');
      expect(res.body.data).toHaveProperty('totalExpense');
    });
  });

  describe('Categories API', () => {
    it('GET /api/categories should return default categories', async () => {
      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/categories should create a category', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Groceries', type: 'expense', icon: 'shopping_cart', color: '#10B981' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Groceries');
    });
  });

  describe('Analytics API', () => {
    it('GET /api/analytics/overview should return dashboard data', async () => {
      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalIncome');
      expect(res.body.data).toHaveProperty('totalExpense');
      expect(res.body.data).toHaveProperty('savings');
      expect(res.body.data).toHaveProperty('cashFlow');
    });
  });

  describe('Budget API', () => {
    it('GET /api/budgets should return empty list', async () => {
      const res = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Goal API', () => {
    it('GET /api/goals should return empty list', async () => {
      const res = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Settings API', () => {
    it('GET /api/settings should return user settings', async () => {
      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('theme');
    });
  });

  describe('Email API', () => {
    it('GET /api/emails should return empty list', async () => {
      const res = await request(app)
        .get('/api/emails')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/emails/stats should return stats', async () => {
      const res = await request(app)
        .get('/api/emails/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('POST /api/emails/sync should attempt sync', async () => {
      const res = await request(app)
        .post('/api/emails/sync')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ maxResults: 10 })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
