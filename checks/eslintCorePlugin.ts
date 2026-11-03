import { builtinRules } from 'eslint/use-at-your-own-risk';

const noRestrictedSyntax = builtinRules.get('no-restricted-syntax');
if (!noRestrictedSyntax) throw new Error('eslint no longer ships no-restricted-syntax in use-at-your-own-risk');

export default {
  meta: { name: 'eslint-core' },
  rules: { 'no-restricted-syntax': noRestrictedSyntax },
};
