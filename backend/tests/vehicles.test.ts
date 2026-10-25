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
    it('should let an admin update vehicle details and quantity', async () => {
      const created = await prisma.vehicle.create({
        data: { make: 'BMW', model: '330i', category: 'Sedan', price: 42000, quantity: 4 },
      });

      const updatePayload = {
        price: 40000,
        quantity: 6,
      };

      const res = await request(app)
        .put(`/api/vehicles/${created.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.vehicle.price).toBe(40000);
      expect(res.body.vehicle.quantity).toBe(6);
      expect(res.body.vehicle.make).toBe('BMW');
    });

    it.each([0, 6])('rejects an ordinary user setting quantity to %s without changing the vehicle', async quantity => {
      const vehicle = await prisma.vehicle.create({
        data: { make: 'BMW', model: '330i', category: 'Sedan', price: 42000, quantity: 4 },
      });
      const res = await request(app).put(`/api/vehicles/${vehicle.id}`)
        .set('Authorization', `Bearer ${userToken}`).send({ quantity, price: 1 });
      expect(res.status).toBe(403);
      expect(await prisma.vehicle.findUnique({ where: { id: vehicle.id } }))
        .toMatchObject({ quantity: 4, price: 42000 });
    });

    it('allows ordinary users to update details without changing stock', async () => {
      const vehicle = await prisma.vehicle.create({
        data: { make: 'BMW', model: '330i', category: 'Sedan', price: 42000, quantity: 4 },
      });
      const res = await request(app).put(`/api/vehicles/${vehicle.id}`)
        .set('Authorization', `Bearer ${userToken}`).send({ price: 40000 });
      expect(res.status).toBe(200);
      expect(res.body.vehicle).toMatchObject({ price: 40000, quantity: 4 });
    });

    it.each([-1, 1.5, '6', null])('rejects invalid admin quantity %s', async quantity => {
      const vehicle = await prisma.vehicle.create({
        data: { make: 'BMW', model: '330i', category: 'Sedan', price: 42000, quantity: 4 },
      });
      const res = await request(app).put(`/api/vehicles/${vehicle.id}`)
        .set('Authorization', `Bearer ${adminToken}`).send({ quantity });
      expect(res.status).toBe(400);
      expect((await prisma.vehicle.findUnique({ where: { id: vehicle.id } }))?.quantity).toBe(4);
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

  describe('GET /api/vehicles/search (Search & Filter)', () => {
    beforeEach(async () => {
      await prisma.vehicle.createMany({
        data: [
          { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 32000, quantity: 4 },
          { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 6 },
          { make: 'Honda', model: 'CR-V', category: 'SUV', price: 34000, quantity: 2 },
          { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 55000, quantity: 1 },
        ],
      });
    });

    it('should search vehicles by make case-insensitively', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=toyota')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.vehicles.length).toBe(2);
      expect(res.body.vehicles.every((v: any) => v.make === 'Toyota')).toBe(true);
    });

    it('should search vehicles by category', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?category=SUV')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.vehicles.length).toBe(2);
      expect(res.body.vehicles.every((v: any) => v.category === 'SUV')).toBe(true);
    });

    it('should search vehicles by price range (minPrice & maxPrice)', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=30000&maxPrice=40000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.vehicles.length).toBe(2);
    });

    it('should combine multiple search criteria (make + category)', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=Toyota&category=Sedan')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.vehicles.length).toBe(1);
      expect(res.body.vehicles[0].model).toBe('Corolla');
    });

    it('should return empty list when no vehicles match the criteria', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=Ferrari')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.vehicles).toEqual([]);
    });

    it('should search vehicles by model', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?model=Mustang')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.vehicles.length).toBe(1);
      expect(res.body.vehicles[0].model).toBe('Mustang');
    });
  });

  describe('GET /api/vehicles/:id (Get Single Vehicle)', () => {
    it('should return 200 and vehicle details for an existing vehicle', async () => {
      const created = await prisma.vehicle.create({
        data: { make: 'Porsche', model: '911', category: 'Coupe', price: 110000, quantity: 2 },
      });

      const res = await request(app)
        .get(`/api/vehicles/${created.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.vehicle.model).toBe('911');
    });

    it('should return 404 when vehicle ID does not exist', async () => {
      const res = await request(app)
        .get('/api/vehicles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Vehicle not found');
    });
  });

  describe('404 Not Found Handling for PUT and DELETE', () => {
    it('should return 404 when updating non-existent vehicle', async () => {
      const res = await request(app)
        .put('/api/vehicles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 30000 });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Vehicle not found');
    });

    it('should return 404 when admin deletes non-existent vehicle', async () => {
      const res = await request(app)
        .delete('/api/vehicles/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Vehicle not found');
    });
  });

  describe('Health check endpoint GET /api/health', () => {
    it('should return 200 status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });
});


