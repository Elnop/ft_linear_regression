import { baseName } from './baseName.ts';
import { exportsOf } from './exportsOf.ts';
import type { Rule } from './RuleTypes.ts';

export const storeLayout: Rule = {
  create(context) {
    return {
      Program(program) {
        const store = baseName(context.filename);
        if (!store.endsWith('Store')) return;
        const actions = store.replace(/Store$/, 'Actions');
        const entries = exportsOf(program);
        for (const entry of entries) {
          if (entry.name === store || entry.name === actions) continue;
          context.report({ node: entry.node, message: `${store}.ts only exports ${store} and ${actions}: move ${entry.name} out of it.` });
        }
        if (!entries.some((entry) => entry.name === store)) context.report({ node: program, message: `${store}.ts must export ${store}.` });
      },
    };
  },
};
