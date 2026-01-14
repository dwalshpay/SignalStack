import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import {
  getDefaultFunnel,
  getCurrentMetrics,
  listSegments,
  listScoringRules,
  createFunnel,
  createMetrics,
  updateFunnel,
  mapBackendFunnelToFrontend,
  mapBackendMetricsToFrontend,
  mapBackendSegmentsToFrontend,
  mapBackendScoringRulesToFrontend,
  mapFrontendMetricsToBackend,
} from '@/lib/api';
import { getErrorMessage } from '@/lib/api/errors';

export type SyncStatus = 'idle' | 'loading' | 'syncing' | 'error' | 'success';

interface UseDataSyncOptions {
  autoSync?: boolean;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

interface UseDataSyncResult {
  status: SyncStatus;
  error: string | null;
  lastSyncedAt: Date | null;
  syncFromBackend: () => Promise<void>;
  syncToBackend: () => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
}

export function useDataSync(options: UseDataSyncOptions = {}): UseDataSyncResult {
  const { autoSync = true, onError, onSuccess } = options;

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const setFunnel = useStore((state) => state.setFunnel);
  const setMetrics = useStore((state) => state.setMetrics);
  const setSegments = useStore((state) => state.setSegments);
  const setScoringRules = useStore((state) => state.setScoringRules);
  const funnel = useStore((state) => state.funnel);
  const metrics = useStore((state) => state.metrics);

  const [status, setStatus] = useState<SyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [backendFunnelId, setBackendFunnelId] = useState<string | null>(null);

  // Load data from backend
  const syncFromBackend = useCallback(async () => {
    if (!isAuthenticated) return;

    setStatus('loading');
    setError(null);

    try {
      // Fetch all data in parallel
      const [funnelData, metricsData, segmentsData, rulesData] = await Promise.all([
        getDefaultFunnel(),
        getCurrentMetrics(),
        listSegments(),
        listScoringRules(),
      ]);

      // Update store with backend data
      if (funnelData) {
        setBackendFunnelId(funnelData.id);
        setFunnel(mapBackendFunnelToFrontend(funnelData));
      }

      if (metricsData) {
        setMetrics(mapBackendMetricsToFrontend(metricsData));
      }

      if (segmentsData.length > 0) {
        setSegments(mapBackendSegmentsToFrontend(segmentsData));
      }

      if (rulesData.length > 0) {
        setScoringRules(mapBackendScoringRulesToFrontend(rulesData));
      }

      setLastSyncedAt(new Date());
      setStatus('success');
      onSuccess?.();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setStatus('error');
      onError?.(errorMessage);
    }
  }, [
    isAuthenticated,
    setFunnel,
    setMetrics,
    setSegments,
    setScoringRules,
    onError,
    onSuccess,
  ]);

  // Save current state to backend
  const syncToBackend = useCallback(async () => {
    if (!isAuthenticated) return;

    setStatus('syncing');
    setError(null);

    try {
      // Sync funnel
      if (backendFunnelId) {
        // Update existing funnel
        await updateFunnel(backendFunnelId, {
          steps: funnel.map((step) => ({
            id: step.id,
            name: step.name,
            order: step.order,
            conversionRate: step.conversionRate,
            monthlyVolume: step.monthlyVolume,
            isTrackable: step.isTrackable,
            eventName: step.eventName,
          })),
        });
      } else {
        // Create new funnel
        const created = await createFunnel({
          name: 'Default Funnel',
          isDefault: true,
          steps: funnel.map((step) => ({
            name: step.name,
            order: step.order,
            conversionRate: step.conversionRate,
            monthlyVolume: step.monthlyVolume,
            isTrackable: step.isTrackable,
            eventName: step.eventName,
          })),
        });
        setBackendFunnelId(created.id);
      }

      // Sync metrics (creates a new record)
      await createMetrics(mapFrontendMetricsToBackend(metrics));

      setLastSyncedAt(new Date());
      setStatus('success');
      onSuccess?.();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setStatus('error');
      onError?.(errorMessage);
    }
  }, [
    isAuthenticated,
    backendFunnelId,
    funnel,
    metrics,
    onError,
    onSuccess,
  ]);

  // Auto-sync on mount when authenticated
  useEffect(() => {
    if (autoSync && isAuthenticated && isInitialized) {
      syncFromBackend();
    }
  }, [autoSync, isAuthenticated, isInitialized, syncFromBackend]);

  return {
    status,
    error,
    lastSyncedAt,
    syncFromBackend,
    syncToBackend,
    isLoading: status === 'loading',
    isSyncing: status === 'syncing',
  };
}
