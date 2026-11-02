export function scrollToElement(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  target.focus({ preventScroll: true });
  history.replaceState(null, '', `#${id}`);
}
