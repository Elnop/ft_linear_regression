import { fileURLToPath } from 'node:url';
import { defineConfig } from 'oxlint';

const EXPORT_PLACEMENT = [
  {
    selector: 'ExportNamedDeclaration > :matches(TSTypeAliasDeclaration, TSInterfaceDeclaration)',
    message: 'Exported types belong in an XTypes.ts file (types/ folder).',
  },
  {
    selector: 'ExportNamedDeclaration > TSEnumDeclaration',
    message: 'Exported constants belong in an XConfig.ts file (configs/ folder).',
  },
  {
    selector:
      'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator:not([init.type=/^(ArrowFunctionExpression|FunctionExpression|NewExpression|ObjectExpression)$/], [init.callee.name=/^define[A-Z]/])',
    message: 'Exported constants belong in an XConfig.ts file (configs/ folder).',
  },
  {
    selector:
      'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ObjectExpression.init:not(:has(> Property[method=true], > Property > :matches(ArrowFunctionExpression, FunctionExpression).value))',
    message: 'Exported constants belong in an XConfig.ts file (configs/ folder).',
  },
];

export const exportPlacementConfig = defineConfig({
  jsPlugins: [{ name: 'export-placement', specifier: fileURLToPath(new URL('./plugin.ts', import.meta.url)) }],
  overrides: [
    { files: ['**/*.ts', '**/*.tsx'], rules: { 'export-placement/no-restricted-syntax': ['error', ...EXPORT_PLACEMENT] } },
    {
      files: ['**/*Store.ts'],
      rules: {
        'export-placement/no-restricted-syntax': [
          'error',
          { selector: 'ExportNamedDeclaration > :matches(TSTypeAliasDeclaration, TSInterfaceDeclaration)', message: 'Exported types belong in an XTypes.ts file (types/ folder).' },
        ],
      },
    },
    {
      files: ['**/*Types.ts'],
      rules: {
        'export-placement/no-restricted-syntax': [
          'error',
          { selector: 'ExportNamedDeclaration[declaration][declaration.type!=/^TS(TypeAlias|Interface)Declaration$/]', message: 'An XTypes.ts file only exports types: move this export out of it.' },
        ],
      },
    },
    {
      files: ['**/*Config.ts', '**/*Config.tsx', '**/*Content.ts', '**/*Content.tsx'],
      rules: {
        'export-placement/no-restricted-syntax': [
          'error',
          {
            selector: 'ExportNamedDeclaration > :matches(FunctionDeclaration, ClassDeclaration, TSTypeAliasDeclaration, TSInterfaceDeclaration)',
            message: 'An XConfig.ts or XContent.ts file only exports constants: move this export out of it.',
          },
          {
            selector: 'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > :matches(ArrowFunctionExpression, FunctionExpression).init',
            message: 'An XConfig.ts or XContent.ts file only exports constants: move this export out of it.',
          },
        ],
      },
    },
    { files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', 'e2e/**'], rules: { 'export-placement/no-restricted-syntax': 'off' } },
  ],
});
