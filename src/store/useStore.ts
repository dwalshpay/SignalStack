import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  FunnelStep,
  BusinessMetrics,
  AudienceSegment,
  ScoringRule
} from '@/types';
import {
  DEFAULT_FUNNEL,
  DEFAULT_METRICS,
  DEFAULT_SEGMENTS,
  STORAGE_KEY,
  STORAGE_VERSION
} from '@/lib/constants';

// Store state interface
interface StoreState {
  // Data
  funnel: FunnelStep[];
  metrics: BusinessMetrics;
  segments: AudienceSegment[];
  scoringRules: ScoringRule[];

  // Funnel actions
  setFunnel: (funnel: FunnelStep[]) => void;
  updateStep: (id: string, updates: Partial<FunnelStep>) => void;
  addStep: (step: FunnelStep) => void;
  removeStep: (id: string) => void;
  reorderSteps: (startIndex: number, endIndex: number) => void;

  // Metrics actions
  setMetrics: (metrics: BusinessMetrics) => void;
  updateMetrics: (updates: Partial<BusinessMetrics>) => void;

  // Segment actions
  setSegments: (segments: AudienceSegment[]) => void;
  addSegment: (segment: AudienceSegment) => void;
  updateSegment: (id: string, updates: Partial<AudienceSegment>) => void;
  removeSegment: (id: string) => void;

  // Scoring rules actions (Phase 3 prep)
  setScoringRules: (rules: ScoringRule[]) => void;

  // Global actions
  reset: () => void;
}

// Initial state
const initialState = {
  funnel: DEFAULT_FUNNEL,
  metrics: DEFAULT_METRICS,
  segments: DEFAULT_SEGMENTS,
  scoringRules: [] as ScoringRule[],
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...initialState,

      // Funnel actions
      setFunnel: (funnel) => set({ funnel }),

      updateStep: (id, updates) => set((state) => ({
        funnel: state.funnel.map((step) =>
          step.id === id ? { ...step, ...updates } : step
        )
      })),

      addStep: (step) => set((state) => ({
        funnel: [...state.funnel, step]
      })),

      removeStep: (id) => set((state) => ({
        funnel: state.funnel
          .filter((step) => step.id !== id)
          .map((step, index) => ({ ...step, order: index }))
      })),

      reorderSteps: (startIndex, endIndex) => set((state) => {
        const result = Array.from(state.funnel);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return {
          funnel: result.map((step, index) => ({ ...step, order: index }))
        };
      }),

      // Metrics actions
      setMetrics: (metrics) => set({ metrics }),

      updateMetrics: (updates) => set((state) => ({
        metrics: { ...state.metrics, ...updates }
      })),

      // Segment actions
      setSegments: (segments) => set({ segments }),

      addSegment: (segment) => set((state) => ({
        segments: [...state.segments, segment]
      })),

      updateSegment: (id, updates) => set((state) => ({
        segments: state.segments.map((segment) =>
          segment.id === id ? { ...segment, ...updates } : segment
        )
      })),

      removeSegment: (id) => set((state) => ({
        segments: state.segments.filter((segment) => segment.id !== id)
      })),

      // Scoring rules actions
      setScoringRules: (scoringRules) => set({ scoringRules }),

      // Reset to defaults
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Selector hooks for optimized re-renders
export const useFunnelSteps = () => useStore((state) => state.funnel);
export const useBusinessMetrics = () => useStore((state) => state.metrics);
export const useSegments = () => useStore((state) => state.segments);
