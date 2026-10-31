import { DashboardLayout } from '@/features/dashboard/components/orchestrators/DashboardLayout.tsx';
import { DashboardPortsContext } from '@/features/dashboard/shared/ports/DashboardPorts.ts';
import type { DashboardPorts } from '@/features/dashboard/shared/types/PortsTypes.ts';
import { DocumentationPage } from '@/features/docs/components/orchestrators/DocumentationPage.tsx';
import { DATA } from '@/features/model/configs/DatasetConfig.ts';
import { DEFAULT_TRAIN } from '@/features/model/configs/TrainingConfig.ts';
import { modelActions, modelStore } from '@/features/model/stores/modelStore.ts';
import { trainingOptionsStore } from '@/features/model/stores/trainingOptionsStore.ts';
import { WallLayout } from '@/features/wall/components/orchestrators/WallLayout.tsx';
import { sequenceStore } from '@/features/wall/sequence/stores/sequenceStore.ts';
import type { SequenceDependencies } from '@/features/wall/sequence/types/SequenceTypes.ts';

const SEQUENCE_DEPENDENCIES: SequenceDependencies = { samples: DATA, defaults: DEFAULT_TRAIN, model: modelActions };

const DASHBOARD_PORTS: DashboardPorts = { sequence: sequenceStore, model: modelStore, trainingOptions: trainingOptionsStore };

export function App() {
  return (
    <DashboardPortsContext.Provider value={DASHBOARD_PORTS}>
      <WallLayout sequence={SEQUENCE_DEPENDENCIES} />
      <DashboardLayout documentation={<DocumentationPage />} />
    </DashboardPortsContext.Provider>
  );
}
