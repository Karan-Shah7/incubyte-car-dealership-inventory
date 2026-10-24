import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/db/client';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

describe('Vehicles CRUD API (/api/vehicles)', () => {
  let userToken: string;
  let adminToken: string;
  let regularUserId: string;
  let adminUserId: string;

  beforeAll(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: { in: ['reg_user@dealership.com', 'admin_user@dealership.com'] },
      },
    });

    const regUser = await prisma.user.create({
      data: {
        email: 'reg_user@dealership.com',
        password: 'hashedpassword',
        name: 'Regular User',
        role: 'USER',
      },
    });
    regularUserId = regUser.id;
    userToken = jwt.sign(
      { id: regUser.id, email: regUser.email, role: regUser.role },
      env.JWT_SECRET
    );

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin_user@dealership.com',
        password: 'hashedpassword',
        name: 'Admin User',
        role: 'ADMIN',
      },
    });
    adminUserId = adminUser.id;
    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      env.JWT_SECRET
    );
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany({
      where: { id: { in: [regularUserId, adminUserId] } },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.vehicle.deleteMany();
  });

  describe('Unauthenticated access guard', () => {
    it('should return 401 when accessing GET /api/vehicles without token', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.status).toBe(401);
    });

    it('should return 401 when accessing POST /api/vehicles without token', async () => {
      const res = await request(app).post('/api/vehicles').send({});
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/vehicles (Create Vehicle)', () => {
    it('should create a new vehicle and return 201 when authenticated', async () => {
      const payload = {
        make: 'Toyota',
        model: 'Camry',
        category: 'Sedan',
        price: 26000,
        quantity: 5,
      };

      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.vehicle).toMatchObject(payload);
      expect(res.body.vehicle).toHaveProperty('id');
    });
  });

  describe('GET /api/vehicles (List All Vehicles)', () => {
    it('should return a list of all available vehicles', async () => {
      await prisma.vehicle.createMany({
        data: [
          { make: 'Honda', model: 'Civic', category: 'Sedan', price: 24000, quantity: 3 },
          { make: 'Ford', model: 'F-150', category: 'Truck', price: 45000, quantity: 2 },
        ],
      });

      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.vehicles)).toBe(true);
      expect(res.body.vehicles.length).toBe(2);
    });
  });

  describe('PUT /api/vehicles/:id (Update Vehicle)', () => {
    it('should update vehicle details and return 200', async () => {
      const created = await prisma.vehicle.create({
        data: { make: 'BMW', model: '330i', category: 'Sedan', price: 42000, quantity: 4 },
      });

      const updatePayload = {
        price: 40000,
        quantity: 6,
      };

      const res = await request(app)
        .put(`/api/vehicles/${created.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.vehicle.price).toBe(40000);
      expect(res.body.vehicle.quantity).toBe(6);
      expect(res.body.vehicle.make).toBe('BMW');
    });
  });

  describe('DELETE /api/vehicles/:id (Admin-only Delete)', () => {
    it('should return 403 Forbidden when a regular user attempts to delete a vehicle', async () => {
      const created = await prisma.vehicle.create({
        data: { make: 'Audi', model: 'A4', category: 'Sedan', price: 39000, quantity: 1 },
      });

      const res = await request(app)
        .delete(`/api/vehicles/${created.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should allow an Admin to delete a vehicle and return 200', async () => {
      const created = await prisma.vehicle.create({
        data: { make: 'Tesla', model: 'Model 3', category: 'Sedan', price: 38000, quantity: 2 },
      });

      const res = await request(app)
        .delete(`/api/vehicles/${created.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');

      const found = await prisma.vehicle.findUnique({ where: { id: created.id } });
      expect(found).toBeNull();
    });
  });
});
