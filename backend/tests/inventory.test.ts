import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/db/client';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

describe('Inventory Operations: Purchase & Restock', () => {
  let userToken: string;
  let adminToken: string;
  let testUserId: string;
  let adminUserId: string;

  beforeAll(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: { in: ['inv_user@dealership.com', 'inv_admin@dealership.com'] },
      },
    });

    const user = await prisma.user.create({
      data: {
        email: 'inv_user@dealership.com',
        password: 'hashedpassword',
        name: 'Inventory User',
        role: 'USER',
      },
    });
    testUserId = user.id;
    userToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET);

    const admin = await prisma.user.create({
      data: {
        email: 'inv_admin@dealership.com',
        password: 'hashedpassword',
        name: 'Inventory Admin',
        role: 'ADMIN',
      },
    });
    adminUserId = admin.id;
    adminToken = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, env.JWT_SECRET);
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany({
      where: { id: { in: [testUserId, adminUserId] } },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.vehicle.deleteMany();
  });

  describe('POST /api/vehicles/:id/purchase (Atomic Purchase)', () => {
    it('should return 401 when attempting to purchase without a token', async () => {
      const res = await request(app).post('/api/vehicles/dummy-id/purchase');
      expect(res.status).toBe(401);
    });

    it('should return 404 when purchasing a non-existent vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles/00000000-0000-0000-0000-000000000000/purchase')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should successfully purchase a vehicle, decrementing quantity by 1', async () => {
      const vehicle = await prisma.vehicle.create({
        data: {
          make: 'Mazda',
          model: 'CX-5',
          category: 'SUV',
          price: 29000,
          quantity: 3,
        },
      });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.vehicle.quantity).toBe(2);

      const inDb = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
      expect(inDb?.quantity).toBe(2);
    });

    it('should return 409 Conflict when attempting to purchase an out-of-stock vehicle (quantity = 0)', async () => {
      const vehicle = await prisma.vehicle.create({
        data: {
          make: 'Mazda',
          model: 'MX-5',
          category: 'Coupe',
          price: 28000,
          quantity: 0,
        },
      });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/out of stock/i);
    });

    it('should handle concurrent purchases atomically and prevent overselling', async () => {
      const vehicle = await prisma.vehicle.create({
        data: {
          make: 'Subaru',
          model: 'Outback',
          category: 'Wagon',
          price: 33000,
          quantity: 1, // Only 1 in stock!
        },
      });

      // Fire 2 simultaneous purchase requests
      const [res1, res2] = await Promise.all([
        request(app)
          .post(`/api/vehicles/${vehicle.id}/purchase`)
          .set('Authorization', `Bearer ${userToken}`),
        request(app)
          .post(`/api/vehicles/${vehicle.id}/purchase`)
          .set('Authorization', `Bearer ${userToken}`),
      ]);

      const statuses = [res1.status, res2.status].sort();
      expect(statuses).toEqual([200, 409]);

      const finalState = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
      expect(finalState?.quantity).toBe(0);
    });
  });

  describe('POST /api/vehicles/:id/restock (Admin Restock)', () => {
    it('should return 401 when restocking without a token', async () => {
      const res = await request(app)
        .post('/api/vehicles/dummy-id/restock')
        .send({ amount: 5 });

      expect(res.status).toBe(401);
    });

    it('should return 403 Forbidden when a regular user attempts to restock a vehicle', async () => {
      const vehicle = await prisma.vehicle.create({
        data: { make: 'Volvo', model: 'XC90', category: 'SUV', price: 58000, quantity: 2 },
      });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 5 });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/admin role required/i);
    });

    it('should return 400 Bad Request when restock amount is not a positive integer', async () => {
      const vehicle = await prisma.vehicle.create({
        data: { make: 'Volvo', model: 'XC90', category: 'SUV', price: 58000, quantity: 2 },
      });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: -3 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return 404 when admin attempts to restock a non-existent vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles/00000000-0000-0000-0000-000000000000/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 5 });

      expect(res.status).toBe(404);
    });

    it('should successfully restock a vehicle by increasing quantity by amount', async () => {
      const vehicle = await prisma.vehicle.create({
        data: { make: 'Volvo', model: 'XC60', category: 'SUV', price: 48000, quantity: 2 },
      });

      const res = await request(app)
        .post(`/api/vehicles/${vehicle.id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 7 });

      expect(res.status).toBe(200);
      expect(res.body.vehicle.quantity).toBe(9);

      const inDb = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
      expect(inDb?.quantity).toBe(9);
    });
  });
});

