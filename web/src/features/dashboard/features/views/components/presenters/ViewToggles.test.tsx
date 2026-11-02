import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { ViewToggles } from '@/features/dashboard/features/views/components/presenters/ViewToggles.tsx';

test('aria-pressed follows the view prop', async () => {
  const screen = await render(<ViewToggles view="chart" onToggle={vi.fn()} />);
  await expect.element(screen.getByRole('button', { name: /GRAPHE/ })).toHaveAttribute('aria-pressed', 'true');
  await expect.element(screen.getByRole('button', { name: /DATA/ })).toHaveAttribute('aria-pressed', 'false');
});

test('clicking a toggle reports its view', async () => {
  const onToggle = vi.fn();
  const screen = await render(<ViewToggles view="chart" onToggle={onToggle} />);
  await screen.getByRole('button', { name: /DATA/ }).click();
  expect(onToggle).toHaveBeenCalledWith('dataset');
});
