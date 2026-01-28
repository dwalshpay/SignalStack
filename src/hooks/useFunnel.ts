import { useCallback } from 'react';
import { useStore } from '@/store/useStore';
import type { FunnelStep } from '@/types';
import type { ParsedFunnelStep } from '@/lib/csvImportValidation';
import type { ImportMode } from '@/components/funnel/FunnelCSVImport';

export function useFunnel() {
  const funnel = useStore((state) => state.funnel);
  const setFunnel = useStore((state) => state.setFunnel);
  const updateStep = useStore((state) => state.updateStep);
  const addStep = useStore((state) => state.addStep);
  const removeStep = useStore((state) => state.removeStep);
  const reorderSteps = useStore((state) => state.reorderSteps);

  const createStep = useCallback((name: string): FunnelStep => {
    const maxOrder = Math.max(...funnel.map(s => s.order), -1);
    return {
      id: crypto.randomUUID(),
      name,
      order: maxOrder + 1,
      conversionRate: 50,
      monthlyVolume: 100,
      isTrackable: true,
      eventName: name.toLowerCase().replace(/\s+/g, '_'),
    };
  }, [funnel]);

  const handleAddStep = useCallback((name: string = 'New Step') => {
    const step = createStep(name);
    addStep(step);
    return step;
  }, [createStep, addStep]);

  const canRemoveStep = funnel.length > 2;
  const canAddStep = funnel.length < 10;

  const importFunnel = useCallback((parsedSteps: ParsedFunnelStep[], mode: ImportMode) => {
    const startOrder = mode === 'append'
      ? Math.max(...funnel.map(s => s.order), -1) + 1
      : 0;

    const newSteps: FunnelStep[] = parsedSteps.map((step, index) => ({
      id: crypto.randomUUID(),
      name: step.name,
      order: startOrder + index,
      conversionRate: step.conversionRate,
      monthlyVolume: step.monthlyVolume,
      isTrackable: true,
      eventName: step.eventName,
    }));

    if (mode === 'replace') {
      setFunnel(newSteps);
    } else {
      // Append mode - add new steps to existing funnel
      setFunnel([...funnel, ...newSteps]);
    }
  }, [funnel, setFunnel]);

  return {
    funnel,
    setFunnel,
    updateStep,
    addStep: handleAddStep,
    removeStep,
    reorderSteps,
    importFunnel,
    canRemoveStep,
    canAddStep,
  };
}
