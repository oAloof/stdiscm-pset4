import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
}

/**
 * Generates a JWT token with the provided user payload
 * @param payload User information to encode in the token
 * @returns Signed JWT token string
 */
export function generateToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(payload, secret, { expiresIn } as any);
}


/**
 * Type guard to check if an object matches the JWTPayload structure
 */
function isJWTPayload(obj: any): obj is JWTPayload {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.userId === 'string' &&
    obj.userId.length > 0 &&
    typeof obj.email === 'string' &&
    obj.email.length > 0 &&
    (obj.role === 'STUDENT' || obj.role === 'FACULTY' || obj.role === 'ADMIN')
  );
}

/**
 * Verifies and decodes a JWT token
 * @param token JWT token string to verify
 * @returns Decoded payload if valid, null if invalid or expired
 */
export function verifyToken(token: string): JWTPayload | null {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (!isJWTPayload(decoded)) {
      return null;
    }

    return decoded;
  } catch (error) {
    // Token is invalid, expired, or tampered with
    return null;
  }
}
