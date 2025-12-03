import { JWTPayload } from '@pset4/shared-types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export { };
