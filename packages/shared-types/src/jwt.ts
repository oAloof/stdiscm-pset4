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

// TODO: Implement verifyToken(token: string): JWTPayload | null
