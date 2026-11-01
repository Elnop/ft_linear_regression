import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout.tsx';
import { DocumentationPage } from '@/features/docs/components/DocumentationPage.tsx';
import { WallLayout } from '@/features/wall/WallLayout.tsx';

export function App() {
  return (
    <>
      <WallLayout />
      <DashboardLayout documentation={<DocumentationPage />} />
    </>
  );
}
