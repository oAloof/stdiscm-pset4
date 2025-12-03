import { Router, Request, Response } from 'express';
import { authClient } from '../grpc-clients';
import { createLogger } from '@pset4/shared-types';

const router = Router();
const logger = createLogger('auth-routes');

router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  logger.info('Login attempt', { email });

  authClient.Login({ email, password }, (error: any, response: any) => {
    if (error) {
      logger.error('Login gRPC error', {
        error: error.message,
        email
      });
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (!response.success) {
      logger.warn('Login failed', { email, message: response.message });
      res.status(401).json({
        success: false,
        message: response.message,
      });
      return;
    }

    logger.info('Login successful', {
      email,
      userId: response.user?.id,
      role: response.user?.role
    });

    res.json({
      success: true,
      message: response.message,
      token: response.token,
      user: response.user,
    });
  });
});

router.post('/logout', (req: Request, res: Response): void => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ error: 'Token required' });
    return;
  }

  logger.info('Logout attempt');

  authClient.Logout({ token }, (error: any, response: any) => {
    if (error) {
      logger.error('Logout gRPC error', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    logger.info('Logout successful');

    res.json({
      success: response.success,
      message: response.message,
    });
  });
});

export default router;
