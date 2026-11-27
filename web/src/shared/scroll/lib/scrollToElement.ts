import { prefersReducedMotion } from '@/shared/scroll/lib/prefersReducedMotion.ts';

export function scrollToElement(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  target.focus({ preventScroll: true });
  history.replaceState(null, '', `#${id}`);
}
