import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@pset4/shared-types';
import { mapGrpcToHttpStatus } from '../utils/grpc-error-mapper';

const logger = createLogger('error-handler');

/**
 * Global error handling middleware.
 * Handles gRPC errors and general application errors.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  // Check if it's a gRPC error (has numeric 'code' property)
  if (err.code !== undefined && typeof err.code === 'number') {
    const { status, message } = mapGrpcToHttpStatus(err.code);

    logger.error('gRPC Error', {
      code: err.code,
      details: err.details || err.message,
      path: req.path,
      method: req.method,
      mappedStatus: status
    });

    res.status(status).json({
      error: message,
      message: err.details || err.message,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle general application errors
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
}
