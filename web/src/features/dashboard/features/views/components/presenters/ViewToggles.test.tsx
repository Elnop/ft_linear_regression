import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { ViewToggles } from '@/features/dashboard/features/views/components/presenters/ViewToggles.tsx';
import type { View } from '@/features/dashboard/shared/DashboardTypes.ts';

test('aria-pressed follows the view prop', async () => {
  const screen = await render(<ViewToggles view="chart" onToggle={vi.fn<(view: View) => void>()} />);
  await expect.element(screen.getByRole('button', { name: /GRAPHE/u })).toHaveAttribute('aria-pressed', 'true');
  await expect.element(screen.getByRole('button', { name: /DATA/u })).toHaveAttribute('aria-pressed', 'false');
});

test('clicking a toggle reports its view', async () => {
  const onToggle = vi.fn<(view: View) => void>();
  const screen = await render(<ViewToggles view="chart" onToggle={onToggle} />);
  await screen.getByRole('button', { name: /DATA/u }).click();
  expect(onToggle).toHaveBeenCalledWith('dataset');
});
