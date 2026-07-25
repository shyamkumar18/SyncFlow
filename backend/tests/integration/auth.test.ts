import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'Test@1234', displayName: 'Test User' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.accessToken).toBeTruthy();
      expect(res.body.data.refreshToken).toBeTruthy();
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid', password: 'Test@1234', displayName: 'Test' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'weak@example.com', password: '123', displayName: 'Test' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Full auth flow', () => {
    let accessToken: string;
    let refreshToken: string;

    it('should register, login, refresh, and get profile', async () => {
      // Register
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ email: 'flow@test.com', password: 'Flow@1234', displayName: 'Flow Test' })
        .expect(201);

      expect(regRes.body.success).toBe(true);

      // Try duplicate - should now fail since user exists
      const dupRes = await request(app)
        .post('/api/auth/register')
        .send({ email: 'flow@test.com', password: 'Flow@1234', displayName: 'Flow Test' })
        .expect(400);

      expect(dupRes.body.success).toBe(false);

      // Login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'flow@test.com', password: 'Flow@1234' })
        .expect(200);

      expect(loginRes.body.success).toBe(true);
      accessToken = loginRes.body.data.accessToken;
      refreshToken = loginRes.body.data.refreshToken;

      // Get profile with token
      const profileRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileRes.body.success).toBe(true);
      expect(profileRes.body.data.email).toBe('flow@test.com');

      // Refresh token
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data.accessToken).toBeTruthy();
      expect(refreshRes.body.data.refreshToken).toBeTruthy();

      const newRefreshToken = refreshRes.body.data.refreshToken;

      // Old refresh token should now be revoked
      const oldRefreshRes = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(oldRefreshRes.body.success).toBe(false);

      // Logout
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: newRefreshToken })
        .expect(200);

      expect(logoutRes.body.success).toBe(true);

      // Used refresh token should fail after logout
      const afterLogoutRes = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: newRefreshToken })
        .expect(401);

      expect(afterLogoutRes.body.success).toBe(false);
    });
  });

  describe('Error cases', () => {
    it('should reject login with wrong password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'error@test.com', password: 'Test@1234', displayName: 'Error Test' })
        .expect(201);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'error@test.com', password: 'WrongPass@1' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject login for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noone@example.com', password: 'Test@1234' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated profile request', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
