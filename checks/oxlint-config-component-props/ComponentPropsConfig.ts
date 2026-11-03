import { fileURLToPath } from 'node:url';
import { defineConfig } from 'oxlint';

const COMPONENT_PROPS = [
  {
    selector:
      ':matches(FunctionDeclaration[id.name=/^[A-Z]/], VariableDeclarator[id.name=/^[A-Z]/] > :matches(ArrowFunctionExpression, FunctionExpression)) > :matches(ObjectPattern, Identifier).params[typeAnnotation=null]',
    message: 'A component types its props with a named type called after it: ComponentProps.',
  },
  {
    selector:
      ':matches(FunctionDeclaration[id.name=/^[A-Z]/], VariableDeclarator[id.name=/^[A-Z]/] > :matches(ArrowFunctionExpression, FunctionExpression)) > :matches(ObjectPattern, Identifier).params > TSTypeAnnotation > TSTypeLiteral',
    message: 'A component types its props with a named type called after it: ComponentProps.',
  },
  {
    selector:
      ':matches(FunctionDeclaration[id.name=/^[A-Z]/], VariableDeclarator[id.name=/^[A-Z]/] > :matches(ArrowFunctionExpression, FunctionExpression)) > :matches(ObjectPattern, Identifier).params > TSTypeAnnotation > TSTypeReference > Identifier.typeName[name!=/^[A-Z]\\w*Props$/]',
    message: 'A component types its props with a named type called after it: ComponentProps.',
  },
];

export const componentPropsConfig = defineConfig({
  jsPlugins: [{ name: 'component-props', specifier: fileURLToPath(new URL('./plugin.ts', import.meta.url)) }],
  overrides: [
    { files: ['**/*.tsx'], rules: { 'component-props/no-restricted-syntax': ['error', ...COMPONENT_PROPS] } },
    { files: ['**/*.test.tsx', 'e2e/**'], rules: { 'component-props/no-restricted-syntax': 'off' } },
  ],
});
