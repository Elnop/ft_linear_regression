import type { ExportEntry, ProgramNode } from './RuleTypes.ts';

type ExportNode = Extract<ProgramNode['body'][number], { type: 'ExportNamedDeclaration' }>;

function declaredNames(declaration: NonNullable<ExportNode['declaration']>): string[] {
  if (declaration.type === 'VariableDeclaration') return declaration.declarations.flatMap((declarator) => (declarator.id.type === 'Identifier' ? [declarator.id.name] : []));
  return 'id' in declaration && declaration.id && 'name' in declaration.id ? [declaration.id.name] : [];
}

export function exportsOf(program: ProgramNode): ExportEntry[] {
  return program.body.flatMap((node): ExportEntry[] => {
    if (node.type !== 'ExportNamedDeclaration') return [];
    const names = node.declaration
      ? declaredNames(node.declaration)
      : node.specifiers.map((specifier) => (specifier.exported.type === 'Identifier' ? specifier.exported.name : specifier.exported.value));
    return names.map((name) => ({ name, node }));
  });
}
