import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/db/client';
import bcrypt from 'bcryptjs';

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ['alice@dealership.com', 'bob@dealership.com'] } },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ['alice@dealership.com', 'bob@dealership.com'] } },
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
});
