import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { SkipButton } from '@/features/dashboard/features/training/components/presenters/SkipButton.tsx';

test('visible, it shows PASSER and calls onSkip on click', async () => {
  const onSkip = vi.fn<() => void>();
  const screen = await render(<SkipButton visible onSkip={onSkip} />);
  await screen.getByRole('button', { name: /PASSER/ }).click();
  expect(onSkip).toHaveBeenCalledOnce();
});

test('hidden, it renders no button', async () => {
  const screen = await render(<SkipButton visible={false} onSkip={vi.fn<() => void>()} />);
  await expect.element(screen.getByRole('button', { name: /PASSER/ })).not.toBeInTheDocument();
});

test('hiding it removes the button once the exit animation ends', async () => {
  const onSkip = vi.fn<() => void>();
  const screen = await render(<SkipButton visible onSkip={onSkip} />);
  await expect.element(screen.getByRole('button', { name: /PASSER/ })).toBeVisible();
  await screen.rerender(<SkipButton visible={false} onSkip={onSkip} />);
  await expect.element(screen.getByRole('button', { name: /PASSER/ })).not.toBeInTheDocument();
});
