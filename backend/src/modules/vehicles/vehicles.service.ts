import { prisma } from '../../db/client';
import { CreateVehicleInput, UpdateVehicleInput, VehicleSearchQuery } from './vehicles.schema';

export class VehiclesService {
  async create(data: CreateVehicleInput) {
    return prisma.vehicle.create({
      data: {
        make: data.make,
        model: data.model,
        category: data.category,
        price: data.price,
        quantity: data.quantity,
      },
    });
  }

  async getAll() {
    return prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      const error: any = new Error('Vehicle not found');
      error.statusCode = 404;
      throw error;
    }

    return vehicle;
  }

  async update(id: string, data: UpdateVehicleInput) {
    await this.getById(id);

    return prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.getById(id);

    await prisma.vehicle.delete({
      where: { id },
    });

    return { message: 'Vehicle deleted successfully' };
  }

  async search(query: VehicleSearchQuery) {
    const where: any = {};

    if (query.make) {
      where.make = { contains: query.make, mode: 'insensitive' };
    }

    if (query.model) {
      where.model = { contains: query.model, mode: 'insensitive' };
    }

    if (query.category) {
      where.category = { contains: query.category, mode: 'insensitive' };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = query.maxPrice;
      }
    }

    return prisma.vehicle.findMany({
      where,
      orderBy: { price: 'asc' },
    });
  }
}

export const vehiclesService = new VehiclesService();
