import { ruleTester } from './ruleTester.ts';
import { storeLayout } from './storeLayout.ts';

ruleTester.run('store-layout', storeLayout, {
  valid: [
    { filename: 'src/stores/viewStore.ts', code: 'export const viewStore = create(); export const viewActions = {};' },
    { filename: 'src/sceneStore.ts', code: 'export const sceneStore = create();' },
    { filename: 'src/lib/useView.ts', code: 'export function useView() {}' },
  ],
  invalid: [
    { filename: 'src/stores/viewStore.ts', code: 'export const viewStore = create(); export function useView() {}', errors: [{ message: /move useView/ }] },
    { filename: 'src/stores/viewStore.ts', code: 'export const store = create();', errors: 2 },
  ],
});
