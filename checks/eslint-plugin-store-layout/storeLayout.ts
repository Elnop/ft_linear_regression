import { defineRule } from '@oxlint/plugins';
import { baseName } from '@elnop/lint-utils/baseName';
import { exportsOf } from '@elnop/lint-utils/exportsOf';

export const storeLayout = defineRule({
  meta: {
    type: 'suggestion',
    docs: { description: 'A xStore.ts file exports only xStore and xActions.' },
    messages: {
      foreignExport: '{{store}}.ts only exports {{store}} and {{actions}}: move {{name}} out of it.',
      missingStore: '{{store}}.ts must export {{store}}.',
    },
    schema: [],
  },
  create(context) {
    return {
      Program(program) {
        const store = baseName(context.filename);
        if (!store.endsWith('Store')) return;
        const actions = store.replace(/Store$/, 'Actions');
        const entries = exportsOf(program);
        for (const entry of entries) {
          if (entry.name === store || entry.name === actions) continue;
          context.report({ node: entry.node, messageId: 'foreignExport', data: { store, actions, name: entry.name } });
        }
        if (!entries.some((entry) => entry.name === store)) context.report({ node: program, messageId: 'missingStore', data: { store } });
      },
    };
  },
});
