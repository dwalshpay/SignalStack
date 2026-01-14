import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { AppError } from './errorHandler.js';
import { createHash } from 'crypto';

export interface JWTPayload {
  sub: string;      // User ID
  org: string;      // Organization ID
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  type: 'access' | 'refresh';
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        organizationId: string;
        role: 'ADMIN' | 'MEMBER' | 'VIEWER';
      };
      organization?: {
        id: string;
        name: string;
        slug: string;
      };
      apiKey?: {
        id: string;
        scopes: string[];
      };
    }
  }
}

export async function jwtAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JWTPayload;

    if (payload.type !== 'access') {
      throw new AppError(401, 'Invalid token type');
    }

    req.user = {
      id: payload.sub,
      organizationId: payload.org,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token'));
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'Token expired'));
      return;
    }
    next(error);
  }
}

export function requireRole(...roles: ('ADMIN' | 'MEMBER' | 'VIEWER')[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'Insufficient permissions'));
      return;
    }

    next();
  };
}

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export async function apiKeyAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer sk_')) {
      throw new AppError(401, 'Invalid API key format. Expected: Bearer sk_...');
    }

    const apiKey = authHeader.slice(7);
    const keyHash = hashApiKey(apiKey);

    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { organization: true },
    });

    if (!apiKeyRecord) {
      throw new AppError(401, 'Invalid API key');
    }

    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      throw new AppError(401, 'API key expired');
    }

    // Update last used (fire and forget)
    prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => { /* ignore */ });

    req.organization = {
      id: apiKeyRecord.organization.id,
      name: apiKeyRecord.organization.name,
      slug: apiKeyRecord.organization.slug,
    };
    req.apiKey = {
      id: apiKeyRecord.id,
      scopes: apiKeyRecord.scopes,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireScope(scope: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.apiKey) {
      next(new AppError(401, 'API key authentication required'));
      return;
    }

    if (!req.apiKey.scopes.includes(scope) && !req.apiKey.scopes.includes('*')) {
      next(new AppError(403, `API key missing required scope: ${scope}`));
      return;
    }

    next();
  };
}
