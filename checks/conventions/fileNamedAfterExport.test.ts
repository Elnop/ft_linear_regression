import { fileNamedAfterExport } from './fileNamedAfterExport.ts';
import { ruleTester } from './ruleTester.ts';

ruleTester.run('file-named-after-export', fileNamedAfterExport, {
  valid: [
    { filename: 'src/lib/hexToRgb.ts', code: 'export function hexToRgb() {}' },
    { filename: 'src/components/Formula.tsx', code: 'export function Formula() {}' },
    { filename: 'src/lib/random.ts', code: 'export function seed() {} export function pick() {}' },
    { filename: 'src/configs/LogoConfig.ts', code: 'export const LOGO_42 = "";' },
    { filename: 'src/types/ColorTypes.ts', code: 'export type Rgb = number[];' },
    { filename: 'src/main.tsx', code: 'render();' },
  ],
  invalid: [{ filename: 'src/lib/color.ts', code: 'export function hexToRgb() {}', errors: [{ message: /rename color to hexToRgb/ }] }],
});
