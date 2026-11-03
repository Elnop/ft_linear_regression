import { ruleTester } from '@elnop/lint-utils/ruleTester';
import { storeLayout } from './storeLayout.ts';

ruleTester.run('store-layout', storeLayout, {
  valid: [
    { filename: 'src/stores/viewStore.ts', code: 'export const viewStore = create(); export const viewActions = {};' },
    { filename: 'src/sceneStore.ts', code: 'export const sceneStore = create();' },
    { filename: 'src/lib/useView.ts', code: 'export function useView() {}' },
  ],
  invalid: [
    {
      filename: 'src/stores/viewStore.ts',
      code: 'export const viewStore = create(); export function useView() {}',
      errors: [{ messageId: 'foreignExport', data: { store: 'viewStore', actions: 'viewActions', name: 'useView' } }],
    },
    { filename: 'src/stores/viewStore.ts', code: 'export const store = create();', errors: [{ messageId: 'foreignExport' }, { messageId: 'missingStore' }] },
  ],
});
