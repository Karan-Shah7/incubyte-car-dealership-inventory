describe('Database Models Verification', () => {
  it('should have a User model accessible on PrismaClient', async () => {
    // Dynamic import to test presence after Prisma generation
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const prismaModule = require('@prisma/client');
    expect(prismaModule).toHaveProperty('PrismaClient');
    const prisma = new prismaModule.PrismaClient();
    expect(prisma).toHaveProperty('user');
    const users = await prisma.user.findMany();
    expect(Array.isArray(users)).toBe(true);
    await prisma.$disconnect();
  });

  it('should have a Vehicle model accessible on PrismaClient', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const prismaModule = require('@prisma/client');
    expect(prismaModule).toHaveProperty('PrismaClient');
    const prisma = new prismaModule.PrismaClient();
    expect(prisma).toHaveProperty('vehicle');
    const vehicles = await prisma.vehicle.findMany();
    expect(Array.isArray(vehicles)).toBe(true);
    await prisma.$disconnect();
  });
});
