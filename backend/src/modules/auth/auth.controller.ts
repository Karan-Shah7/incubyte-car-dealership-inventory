import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      return res.status(201).json(result);
    } catch (err: any) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      return next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      return res.status(200).json(result);
    } catch (err: any) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      return next(err);
    }
  }

  async me(req: Request, res: Response) {
    return res.status(200).json({ user: req.user });
  }
}

export const authController = new AuthController();
