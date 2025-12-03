import * as grpc from '@grpc/grpc-js';
import bcrypt from 'bcrypt';
import { createSupabaseClient, createLogger, generateToken, verifyToken, roleToProtoEnum, User } from '@pset4/shared-types';

const logger = createLogger('auth-handler');

/**
 * Handles login requests by validating credentials and generating JWT tokens.
 */
export async function handleLogin(call: any, callback: grpc.sendUnaryData<any>): Promise<void> {
  const { email, password } = call.request;

  logger.info('Login attempt', { email });

  try {
    if (!email || !password) {
      logger.warn('Login failed: Missing credentials', { email });
      callback(null, {
        success: false,
        message: 'Email and password are required',
        token: '',
        user: null,
      });
      return;
    }

    const supabase = createSupabaseClient();
    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    const typedUser = user as User | null;

    if (dbError || !typedUser) {
      logger.warn('Login failed: User not found', { email, error: dbError?.message });
      callback(null, {
        success: false,
        message: 'Invalid email or password',
        token: '',
        user: null,
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, typedUser.password_hash);

    if (!isPasswordValid) {
      logger.warn('Login failed: Invalid password', { email });
      callback(null, {
        success: false,
        message: 'Invalid email or password',
        token: '',
        user: null,
      });
      return;
    }

    const token = generateToken({
      userId: typedUser.id,
      email: typedUser.email,
      role: typedUser.role,
    });

    logger.info('Login successful', { email, userId: typedUser.id, role: typedUser.role });

    callback(null, {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: typedUser.id,
        email: typedUser.email,
        name: typedUser.name,
        role: roleToProtoEnum(typedUser.role),
      },
    });
  } catch (error: any) {
    logger.error('Login error', { email, error: error.message });

    callback({
      code: grpc.status.INTERNAL,
      message: 'An error occurred during login',
    });
  }
}

/**
 * Handles logout requests.
 * This handler logs the event for audit purposes and returns success.
 */
export function handleLogout(call: any, callback: grpc.sendUnaryData<any>): void {
  const { token } = call.request;

  logger.info('Logout request received', {
    tokenProvided: !!token
  });

  callback(null, {
    success: true,
    message: 'Logged out successfully',
  });
}

/**
 * Handles token validation requests from other microservices.
 * Verifies JWT token and returns user data if valid.
 */
export function handleValidateToken(call: any, callback: grpc.sendUnaryData<any>): void {
  const { token } = call.request;

  if (!token) {
    logger.warn('Token validation failed: No token provided');
    callback(null, {
      valid: false,
      user: null,
    });
    return;
  }

  const payload = verifyToken(token);

  if (!payload) {
    logger.warn('Token validation failed: Invalid or expired token');
    callback(null, {
      valid: false,
      user: null,
    });
    return;
  }

  logger.info('Token validation successful', {
    userId: payload.userId,
    role: payload.role
  });

  callback(null, {
    valid: true,
    user: {
      id: payload.userId,
      email: payload.email,
      name: '',
      role: roleToProtoEnum(payload.role),
    },
  });
}
