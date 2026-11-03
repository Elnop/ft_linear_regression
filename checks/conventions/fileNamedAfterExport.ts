import { baseName } from './baseName.ts';
import { exportsOf } from './exportsOf.ts';
import type { Rule } from './RuleTypes.ts';

const DOMAIN_FILE = /(Types|Config|Content)$/;

export const fileNamedAfterExport: Rule = {
  create(context) {
    return {
      Program(program) {
        const file = baseName(context.filename);
        const entries = exportsOf(program);
        const [only] = entries;
        if (entries.length !== 1 || !only || DOMAIN_FILE.test(file) || only.name === file) return;
        context.report({ node: only.node, message: `A file with a single export is named after it: rename ${file} to ${only.name}.` });
      },
    };
  },
};
