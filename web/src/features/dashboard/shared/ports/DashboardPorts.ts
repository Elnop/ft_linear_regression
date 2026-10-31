import { createContext, useContext } from 'react';
import { useStore } from 'zustand';
import type { DashboardPorts, ModelView, SequenceView, TrainingOptionsView } from '@/features/dashboard/shared/types/PortsTypes.ts';

export const DashboardPortsContext = createContext<DashboardPorts | null>(null);

function usePorts(): DashboardPorts {
  const ports = useContext(DashboardPortsContext);
  if (!ports) throw new Error('DashboardPortsContext is not provided');
  return ports;
}

export const useSequencePort = <T,>(selector: (state: SequenceView) => T): T => useStore(usePorts().sequence, selector);

export const useModelPort = <T,>(selector: (state: ModelView) => T): T => useStore(usePorts().model, selector);

export const useTrainingOptionsPort = <T,>(selector: (state: TrainingOptionsView) => T): T =>
  useStore(usePorts().trainingOptions, selector);
