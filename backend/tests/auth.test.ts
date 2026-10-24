import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/db/client';
import bcrypt from 'bcryptjs';

describe('Authentication & Authorization', () => {
  const testUser = {
    email: 'login_tester@dealership.com',
    password: 'SecurePassword123!',
    name: 'Login Tester',
    role: 'USER' as const,
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'alice@dealership.com',
            'bob@dealership.com',
            'dup@dealership.com',
            'login_tester@dealership.com',
          ],
        },
      },
    });

    // Create user for login tests
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name,
        role: testUser.role,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'alice@dealership.com',
            'bob@dealership.com',
            'dup@dealership.com',
            'login_tester@dealership.com',
          ],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return 201 with user info and token', async () => {
      const payload = {
        email: 'alice@dealership.com',
        password: 'SecurePassword123!',
        name: 'Alice Manager',
        role: 'USER',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        email: payload.email,
        name: payload.name,
        role: 'USER',
      });
      expect(response.body.user).not.toHaveProperty('password');

      const userInDb = await prisma.user.findUnique({
        where: { email: payload.email },
      });
      expect(userInDb).not.toBeNull();
      const isPasswordMatch = await bcrypt.compare(payload.password, userInDb!.password);
      expect(isPasswordMatch).toBe(true);
    });

    it('should return 409 Conflict when registering with an existing email', async () => {
      const payload = {
        email: 'dup@dealership.com',
        password: 'Password123!',
        name: 'Duplicate User',
      };

      const firstRes = await request(app)
        .post('/api/auth/register')
        .send(payload);
      expect(firstRes.status).toBe(201);

      const secondRes = await request(app)
        .post('/api/auth/register')
        .send(payload);

      expect(secondRes.status).toBe(409);
      expect(secondRes.body).toHaveProperty('error');
    });

    it('should return 400 Bad Request when payload is invalid', async () => {
      const invalidPayload = {
        email: 'not-an-email',
        password: '123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in successfully with valid credentials and return JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        email: testUser.email,
        name: testUser.name,
        role: 'USER',
      });
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 Unauthorized with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should return 401 Unauthorized with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown_user_999@dealership.com',
          password: 'SomePassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });
  });

  describe('GET /api/auth/me (Protected Route Verification)', () => {
    it('should return 200 and user data when called with a valid Bearer token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const token = loginRes.body.token;

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.user).toMatchObject({
        email: testUser.email,
        role: 'USER',
      });
    });

    it('should return 401 Unauthorized when called without Authorization header', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 Unauthorized when called with an invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-garbage-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
