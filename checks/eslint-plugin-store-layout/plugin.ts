import { definePlugin } from '@oxlint/plugins';
import { storeLayout } from './storeLayout.ts';

export default definePlugin({
  meta: { name: 'store-layout' },
  rules: { 'store-layout': storeLayout },
});
