import { z } from 'zod';

export const createVehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than zero'),
  quantity: z.number().int().nonnegative('Quantity cannot be negative').default(0),
});

export const updateVehicleSchema = z.object({
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  quantity: z.number().int().nonnegative().optional(),
});

export const vehicleSearchQuerySchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
});

export const restockSchema = z.object({
  amount: z.number().int().positive('Restock amount must be a positive integer'),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleSearchQuery = z.infer<typeof vehicleSearchQuerySchema>;
export type RestockInput = z.infer<typeof restockSchema>;
