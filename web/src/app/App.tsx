import { Dashboard } from '@/app/layout/components/orchestrators/Dashboard.tsx';
import { DashboardPortsContext } from '@/features/dashboard/shared/ports/DashboardPorts.ts';
import type { DashboardPorts } from '@/features/dashboard/shared/types/PortsTypes.ts';
import { DATA } from '@/features/model/configs/DatasetConfig.ts';
import { DEFAULT_TRAIN } from '@/features/model/configs/TrainingConfig.ts';
import { modelActions, modelStore } from '@/features/model/stores/modelStore.ts';
import { trainingOptionsStore } from '@/features/model/stores/trainingOptionsStore.ts';
import { PaintWall } from '@/features/wall/canvas/components/orchestrators/PaintWall.tsx';
import { SprayCan } from '@/features/wall/spray-can/components/orchestrators/SprayCan.tsx';
import { Stickers } from '@/features/wall/stickers/components/orchestrators/Stickers.tsx';
import { useSequenceRuntime } from '@/features/wall/sequence/hooks/useSequenceRuntime.ts';
import { sequenceStore } from '@/features/wall/sequence/stores/sequenceStore.ts';
import type { SequenceDependencies } from '@/features/wall/sequence/types/SequenceTypes.ts';

const SEQUENCE_DEPENDENCIES: SequenceDependencies = { samples: DATA, defaults: DEFAULT_TRAIN, model: modelActions };

const DASHBOARD_PORTS: DashboardPorts = { sequence: sequenceStore, model: modelStore, trainingOptions: trainingOptionsStore };

export function App() {
  useSequenceRuntime(SEQUENCE_DEPENDENCIES);
  return (
    <DashboardPortsContext.Provider value={DASHBOARD_PORTS}>
      <PaintWall />
      <Stickers />
      <Dashboard />
      <SprayCan />
    </DashboardPortsContext.Provider>
  );
}
