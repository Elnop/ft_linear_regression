import { definePlugin } from '@oxlint/plugins';
import { fileNamedAfterExport } from './fileNamedAfterExport.ts';

export default definePlugin({
  meta: { name: 'file-named-after-export' },
  rules: { 'file-named-after-export': fileNamedAfterExport },
});
