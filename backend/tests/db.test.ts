import { prisma } from '../src/db/client';

describe('Database Models Verification', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should have a User model accessible on PrismaClient', async () => {
    expect(prisma).toHaveProperty('user');
    const users = await prisma.user.findMany();
    expect(Array.isArray(users)).toBe(true);
  });

  it('should have a Vehicle model accessible on PrismaClient', async () => {
    expect(prisma).toHaveProperty('vehicle');
    const vehicles = await prisma.vehicle.findMany();
    expect(Array.isArray(vehicles)).toBe(true);
  });
});
