import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createLogger } from '@pset4/shared-types';
import { errorHandler } from './middleware/error-handler';
import authRoutes from './routes/auth';
import courseRoutes from './routes/course';
import gradeRoutes from './routes/grade';

// Load .env from root directory for local development
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // Fallback/Override

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

app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/grades', gradeRoutes);

// Error handling middleware
app.use(errorHandler);

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

