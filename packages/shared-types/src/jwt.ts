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

    // Cast to any to access custom fields
    const payload = decoded as any;

    // Validate that expected fields exist
    if (!payload.userId || !payload.email || !payload.role) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    // Token is invalid, expired, or tampered with
    return null;
  }
}
