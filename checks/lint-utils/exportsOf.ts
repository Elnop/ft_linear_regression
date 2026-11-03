import type { ESTree } from '@oxlint/plugins';
import type { ExportEntry } from './ExportTypes.ts';

function declaredNames(declaration: ESTree.Declaration): string[] {
  if (declaration.type === 'VariableDeclaration') return declaration.declarations.flatMap((declarator) => (declarator.id.type === 'Identifier' ? [declarator.id.name] : []));
  return 'id' in declaration && declaration.id && 'name' in declaration.id ? [declaration.id.name] : [];
}

export function exportsOf(program: ESTree.Program): ExportEntry[] {
  return program.body.flatMap((node): ExportEntry[] => {
    if (node.type !== 'ExportNamedDeclaration') return [];
    const names = node.declaration
      ? declaredNames(node.declaration)
      : node.specifiers.map((specifier) => (specifier.exported.type === 'Identifier' ? specifier.exported.name : specifier.exported.value));
    return names.map((name) => ({ name, node }));
  });
}
