import { DOCUMENTATION_ID } from '@/shared/documentation/DocumentationConfig.ts';
import { scrollToElement } from '@/shared/scroll/lib/scrollToElement.ts';

export function scrollToDocumentation(): void {
  scrollToElement(DOCUMENTATION_ID);
}
