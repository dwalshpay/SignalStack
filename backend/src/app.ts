import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { authRoutes } from './routes/auth.routes.js';
import { funnelRoutes } from './routes/funnel.routes.js';
import { metricsRoutes } from './routes/metrics.routes.js';
import { segmentRoutes } from './routes/segment.routes.js';
import { scoringRuleRoutes } from './routes/scoringRule.routes.js';
import { leadRoutes } from './routes/lead.routes.js';
import { integrationRoutes } from './routes/integration.routes.js';
import { monitoringRoutes } from './routes/monitoring.routes.js';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));

  // Request logging
  app.use(requestLogger);

  // Health check
  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/funnels', funnelRoutes);
  app.use('/api/v1/metrics', metricsRoutes);
  app.use('/api/v1/segments', segmentRoutes);
  app.use('/api/v1/scoring-rules', scoringRuleRoutes);
  app.use('/api/v1/score-lead', leadRoutes);
  app.use('/api/v1/integrations', integrationRoutes);
  app.use('/api/v1/monitoring', monitoringRoutes);

  // Error handling
  app.use(errorHandler);

  return app;
}
