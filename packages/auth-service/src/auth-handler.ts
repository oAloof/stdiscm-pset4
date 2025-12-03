import * as grpc from '@grpc/grpc-js';
import bcrypt from 'bcrypt';
import { createSupabaseClient, createLogger, generateToken, User } from '@pset4/shared-types';

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
        role: mapRoleToProtoEnum(typedUser.role),
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

/** Converts database role strings to protobuf enum integers. */
function mapRoleToProtoEnum(role: string): number {
  switch (role) {
    case 'STUDENT':
      return 0;
    case 'FACULTY':
      return 1;
    case 'ADMIN':
      return 2;
    default:
      return 0;
  }
}

/** Placeholder for Logout RPC. */
export function handleLogout(call: any, callback: grpc.sendUnaryData<any>): void {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: 'Logout handler not yet implemented',
  });
}

/** Placeholder for ValidateToken RPC. */
export function handleValidateToken(call: any, callback: grpc.sendUnaryData<any>): void {
  callback({
    code: grpc.status.UNIMPLEMENTED,
    message: 'ValidateToken handler not yet implemented',
  });
}
