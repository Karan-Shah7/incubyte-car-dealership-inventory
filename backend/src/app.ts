import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRouter from './modules/auth/auth.router';

const app: Application = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Central error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
});

export default app;
