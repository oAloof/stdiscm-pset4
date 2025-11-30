// TODO: Implement JWT utilities

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
}

// TODO: Implement generateToken(payload: JWTPayload): string
// TODO: Implement verifyToken(token: string): JWTPayload | null
