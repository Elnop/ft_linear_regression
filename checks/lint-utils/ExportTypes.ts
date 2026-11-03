import type { ESTree } from '@oxlint/plugins';

export type ExportEntry = {
  name: string;
  node: ESTree.ExportNamedDeclaration;
};
