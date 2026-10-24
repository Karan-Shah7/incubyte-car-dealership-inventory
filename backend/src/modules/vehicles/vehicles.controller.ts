import { Request, Response, NextFunction } from 'express';
import { vehiclesService } from './vehicles.service';

export class VehiclesController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehiclesService.create(req.body);
      return res.status(201).json({ vehicle });
    } catch (err: any) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      return next(err);
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await vehiclesService.getAll();
      return res.status(200).json({ vehicles });
    } catch (err: any) {
      return next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehiclesService.getById(req.params.id as string);
      return res.status(200).json({ vehicle });
    } catch (err: any) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      return next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehiclesService.update(req.params.id as string, req.body);
      return res.status(200).json({ vehicle });
    } catch (err: any) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      return next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await vehiclesService.delete(req.params.id as string);
      return res.status(200).json(result);
    } catch (err: any) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      return next(err);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await vehiclesService.search(req.query as any);
      return res.status(200).json({ vehicles });
    } catch (err: any) {
      return next(err);
    }
  }
}

export const vehiclesController = new VehiclesController();
