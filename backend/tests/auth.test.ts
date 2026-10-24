import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/db/client';
import bcrypt from 'bcryptjs';

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ['alice@dealership.com', 'bob@dealership.com', 'dup@dealership.com'] } },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ['alice@dealership.com', 'bob@dealership.com', 'dup@dealership.com'] } },
    });
    await prisma.$disconnect();
  });

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

    // Verify user is in database with hashed password
    const userInDb = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    expect(userInDb).not.toBeNull();
    expect(userInDb!.password).not.toBe(payload.password);
    const isPasswordMatch = await bcrypt.compare(payload.password, userInDb!.password);
    expect(isPasswordMatch).toBe(true);
  });

  it('should return 409 Conflict when registering with an existing email', async () => {
    const payload = {
      email: 'dup@dealership.com',
      password: 'Password123!',
      name: 'Duplicate User',
    };

    // First registration
    const firstRes = await request(app)
      .post('/api/auth/register')
      .send(payload);
    expect(firstRes.status).toBe(201);

    // Second registration with same email
    const secondRes = await request(app)
      .post('/api/auth/register')
      .send(payload);

    expect(secondRes.status).toBe(409);
    expect(secondRes.body).toHaveProperty('error');
    expect(secondRes.body.error).toMatch(/already exists/i);
  });

  it('should return 400 Bad Request when payload is invalid (invalid email or short password)', async () => {
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
