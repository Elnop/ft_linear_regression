import { DOCUMENTATION_ID } from '@/shared/configs/DocumentationConfig.ts';
import { scrollToElement } from '@/shared/lib/scrollToElement.ts';

export function scrollToDocumentation(): void {
  scrollToElement(DOCUMENTATION_ID);
}
