// API Module - Barrel Export

// Core client
export {
  api,
  apiRequest,
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  hasValidSession,
} from './client';

// Error handling
export { APIError, NetworkError, getErrorMessage } from './errors';

// Auth
export {
  login,
  register,
  refreshSession,
  getCurrentUser,
  logout,
  inviteUser,
  acceptInvite,
  createAPIKey,
  listAPIKeys,
  deleteAPIKey,
} from './auth';

// Funnels
export {
  listFunnels,
  getFunnel,
  createFunnel,
  updateFunnel,
  deleteFunnel,
  getDefaultFunnel,
} from './funnels';

// Metrics
export { getCurrentMetrics, getMetricsHistory, createMetrics } from './metrics';

// Segments
export {
  listSegments,
  getSegment,
  createSegment,
  updateSegment,
  deleteSegment,
} from './segments';

// Scoring Rules
export {
  listScoringRules,
  getScoringRule,
  createScoringRule,
  updateScoringRule,
  deleteScoringRule,
  reorderScoringRules,
  toggleScoringRule,
} from './scoringRules';

// Integrations
export {
  listIntegrations,
  getIntegration,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testIntegrationConnection,
  triggerIntegrationSync,
  getIntegrationLogs,
} from './integrations';

// Monitoring
export {
  getOverview,
  getEventsByDay,
  getEMQTrend,
  getScoreDistribution,
  getValueBySegment,
} from './monitoring';

// Data mappers
export {
  mapBackendFunnelToFrontend,
  mapBackendStepToFrontend,
  mapFrontendStepToBackend,
  mapBackendMetricsToFrontend,
  mapFrontendMetricsToBackend,
  mapBackendSegmentToFrontend,
  mapFrontendSegmentToBackend,
  mapBackendSegmentsToFrontend,
  mapBackendScoringRuleToFrontend,
  mapFrontendScoringRuleToBackend,
  mapBackendScoringRulesToFrontend,
} from './mappers';
