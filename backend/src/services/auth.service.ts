import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateToken, hashApiKey, generateApiKey } from '../utils/crypto.js';
import type { RegisterInput, LoginInput, TokenResponse } from '../types/index.js';
import type { JWTPayload } from '../middleware/auth.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const INVITE_TOKEN_EXPIRY_DAYS = 7;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

async function generateUniqueSlug(baseName: string): Promise<string> {
  let slug = generateSlug(baseName);
  let counter = 0;

  while (true) {
    const finalSlug = counter === 0 ? slug : `${slug}-${counter}`;
    const existing = await prisma.organization.findUnique({
      where: { slug: finalSlug },
    });
    if (!existing) return finalSlug;
    counter++;
  }
}

function generateTokens(user: { id: string; organizationId: string; role: string }): {
  accessToken: string;
  refreshToken: string;
} {
  const accessPayload: JWTPayload = {
    sub: user.id,
    org: user.organizationId,
    role: user.role as 'ADMIN' | 'MEMBER' | 'VIEWER',
    type: 'access',
  };

  const refreshPayload: JWTPayload = {
    sub: user.id,
    org: user.organizationId,
    role: user.role as 'ADMIN' | 'MEMBER' | 'VIEWER',
    type: 'refresh',
  };

  return {
    accessToken: jwt.sign(accessPayload, process.env.JWT_SECRET!, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }),
    refreshToken: jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    }),
  };
}

export async function register(input: RegisterInput): Promise<TokenResponse> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError(409, 'User with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, 12);

  // Generate unique slug for organization
  const slug = await generateUniqueSlug(input.organizationName);

  // Create organization and user in transaction
  const result = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: input.organizationName,
        slug,
      },
    });

    const user = await tx.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        role: 'ADMIN',
        organizationId: organization.id,
      },
    });

    // Create default funnel
    await tx.funnel.create({
      data: {
        organizationId: organization.id,
        name: 'Default Funnel',
        isDefault: true,
        steps: [
          { id: '1', name: 'Website Visit', order: 0, conversionRate: 8, monthlyVolume: 10000, isTrackable: true, eventName: 'page_view' },
          { id: '2', name: 'Email Captured', order: 1, conversionRate: 25, monthlyVolume: 800, isTrackable: true, eventName: 'email_captured' },
          { id: '3', name: 'Application Started', order: 2, conversionRate: 60, monthlyVolume: 200, isTrackable: true, eventName: 'application_started' },
          { id: '4', name: 'Signup Complete', order: 3, conversionRate: 40, monthlyVolume: 120, isTrackable: true, eventName: 'signup_complete' },
          { id: '5', name: 'First Transaction', order: 4, conversionRate: 50, monthlyVolume: 48, isTrackable: true, eventName: 'first_transaction' },
          { id: '6', name: 'Activated', order: 5, conversionRate: 100, monthlyVolume: 24, isTrackable: true, eventName: 'activated' },
        ],
      },
    });

    // Create default business metrics
    await tx.businessMetrics.create({
      data: {
        organizationId: organization.id,
        ltv: 5700,
        ltvCacRatio: 4,
        grossMargin: 100,
        currency: 'AUD',
        effectiveFrom: new Date(),
        source: 'MANUAL',
      },
    });

    // Create default segments
    await tx.audienceSegment.createMany({
      data: [
        {
          organizationId: organization.id,
          name: 'Business Email',
          multiplier: 1.5,
          identificationType: 'email_domain',
          identificationCondition: 'not_in_blocklist',
        },
        {
          organizationId: organization.id,
          name: 'Consumer Email',
          multiplier: 0.1,
          identificationType: 'email_domain',
          identificationCondition: 'in_blocklist',
        },
      ],
    });

    return { organization, user };
  });

  const tokens = generateTokens(result.user);

  return {
    ...tokens,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
      },
    },
  };
}

export async function login(input: LoginInput): Promise<TokenResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: { organization: true },
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new AppError(401, 'Invalid email or password');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const tokens = generateTokens(user);

  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
      },
    },
  };
}

export async function refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;

    if (payload.type !== 'refresh') {
      throw new AppError(401, 'Invalid token type');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new AppError(401, 'User not found');
    }

    return generateTokens(user);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid refresh token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Refresh token expired');
    }
    throw error;
  }
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organization: {
      id: user.organization.id,
      name: user.organization.name,
      slug: user.organization.slug,
    },
  };
}

export async function inviteUser(
  organizationId: string,
  email: string,
  role: 'ADMIN' | 'MEMBER' | 'VIEWER' = 'MEMBER'
) {
  // Check if user already exists in this org
  const existingUser = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      organizationId,
    },
  });

  if (existingUser) {
    throw new AppError(409, 'User is already a member of this organization');
  }

  // Check for existing pending invite
  const existingInvite = await prisma.organizationInvite.findFirst({
    where: {
      email: email.toLowerCase(),
      organizationId,
      expiresAt: { gt: new Date() },
    },
  });

  if (existingInvite) {
    throw new AppError(409, 'An invite has already been sent to this email');
  }

  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TOKEN_EXPIRY_DAYS);

  const invite = await prisma.organizationInvite.create({
    data: {
      email: email.toLowerCase(),
      role,
      organizationId,
      token,
      expiresAt,
    },
    include: { organization: true },
  });

  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    expiresAt: invite.expiresAt,
    inviteUrl: `${process.env.FRONTEND_URL}/invite/${token}`,
  };
}

export async function acceptInvite(token: string, password: string, name: string): Promise<TokenResponse> {
  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invite) {
    throw new AppError(404, 'Invite not found');
  }

  if (invite.expiresAt < new Date()) {
    throw new AppError(410, 'Invite has expired');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
  });

  if (existingUser) {
    throw new AppError(409, 'User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Create user and delete invite in transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: invite.email,
        passwordHash,
        name,
        role: invite.role,
        organizationId: invite.organizationId,
      },
    });

    await tx.organizationInvite.delete({
      where: { id: invite.id },
    });

    return newUser;
  });

  const tokens = generateTokens(user);

  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: {
        id: invite.organization.id,
        name: invite.organization.name,
        slug: invite.organization.slug,
      },
    },
  };
}

export async function createApiKey(
  organizationId: string,
  name: string,
  scopes: string[] = ['score-lead'],
  expiresInDays?: number
) {
  const key = generateApiKey();
  const keyHash = hashApiKey(key);
  const keyPrefix = key.slice(0, 16); // sk_live_ + first 8 chars

  let expiresAt: Date | undefined;
  if (expiresInDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      keyHash,
      keyPrefix,
      organizationId,
      scopes,
      expiresAt,
    },
  });

  // Return the actual key only once - it cannot be retrieved again
  return {
    id: apiKey.id,
    name: apiKey.name,
    key, // Only returned on creation
    keyPrefix: apiKey.keyPrefix,
    scopes: apiKey.scopes,
    expiresAt: apiKey.expiresAt,
    createdAt: apiKey.createdAt,
  };
}

export async function listApiKeys(organizationId: string) {
  const keys = await prisma.apiKey.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      scopes: true,
      expiresAt: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return keys;
}

export async function deleteApiKey(organizationId: string, keyId: string) {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, organizationId },
  });

  if (!key) {
    throw new AppError(404, 'API key not found');
  }

  await prisma.apiKey.delete({
    where: { id: keyId },
  });
}
