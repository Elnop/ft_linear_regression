import { DashboardLayout } from '@/features/dashboard/components/orchestrators/DashboardLayout.tsx';
import { DocumentationPage } from '@/features/docs/components/orchestrators/DocumentationPage.tsx';
import { WallLayout } from '@/features/wall/components/orchestrators/WallLayout.tsx';

export function App() {
  return (
    <>
      <WallLayout />
      <DashboardLayout documentation={<DocumentationPage />} />
    </>
  );
}
