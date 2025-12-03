import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createLogger } from '@pset4/shared-types';
import { authClient, courseClient, gradeClient } from './grpc-clients';

dotenv.config();

const logger = createLogger('api-gateway');
const app = express();
const PORT = process.env.API_GATEWAY_PORT || 4000;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request processed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
});

// Health endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'API Gateway running' });
});

// Auth routes
import authRoutes from './routes/auth';
app.use('/auth', authRoutes);


// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info('API Gateway started');
  logger.info(`REST API listening on port ${PORT}`);
  logger.info(`CORS configured for origin: ${corsOptions.origin}`);
});

const shutdown = () => {
  logger.info('Shutting down API Gateway...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.warn('Forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

