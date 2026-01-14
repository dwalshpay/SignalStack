import { Router } from 'express';
import * as authService from '../services/auth.service.js';
import { jwtAuth, requireRole } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  inviteUserSchema,
  acceptInviteSchema,
  createApiKeySchema,
} from '../utils/validation.js';

export const authRoutes = Router();

// Register a new organization and admin user
authRoutes.post('/register', authRateLimit, async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Login
authRoutes.post('/login', authRateLimit, async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Refresh token
authRoutes.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const tokens = await authService.refreshToken(refreshToken);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

// Get current user
authRoutes.get('/me', jwtAuth, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Invite user to organization (admin only)
authRoutes.post('/invite', jwtAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const input = inviteUserSchema.parse(req.body);
    const result = await authService.inviteUser(
      req.user!.organizationId,
      input.email,
      input.role
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Accept invite
authRoutes.post('/invite/accept', authRateLimit, async (req, res, next) => {
  try {
    const input = acceptInviteSchema.parse(req.body);
    const result = await authService.acceptInvite(input.token, input.password, input.name);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Create API key (admin only)
authRoutes.post('/api-keys', jwtAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const input = createApiKeySchema.parse(req.body);
    const result = await authService.createApiKey(
      req.user!.organizationId,
      input.name,
      input.scopes,
      input.expiresInDays
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// List API keys
authRoutes.get('/api-keys', jwtAuth, async (req, res, next) => {
  try {
    const keys = await authService.listApiKeys(req.user!.organizationId);
    res.json(keys);
  } catch (error) {
    next(error);
  }
});

// Delete API key (admin only)
authRoutes.delete('/api-keys/:id', jwtAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const keyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await authService.deleteApiKey(req.user!.organizationId, keyId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
