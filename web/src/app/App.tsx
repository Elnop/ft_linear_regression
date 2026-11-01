import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout.tsx';
import { DocumentationPage } from '@/features/docs/components/DocumentationPage.tsx';
import { GraffitiLayout } from '@/features/graffiti/GraffitiLayout.tsx';

export function App() {
  return (
    <>
      <GraffitiLayout />
      <DashboardLayout documentation={<DocumentationPage />} />
    </>
  );
}
