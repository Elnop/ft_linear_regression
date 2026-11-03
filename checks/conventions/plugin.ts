import { fileNamedAfterExport } from './fileNamedAfterExport.ts';
import { storeLayout } from './storeLayout.ts';

export default {
  meta: { name: 'conventions' },
  rules: {
    'file-named-after-export': fileNamedAfterExport,
    'store-layout': storeLayout,
  },
};
