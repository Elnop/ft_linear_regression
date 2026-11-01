import { registerHooks } from 'node:module';

const ALIASES: [string, URL][] = [
  ['@/', new URL('../src/', import.meta.url)],
  ['@core/', new URL('../../core/', import.meta.url)],
];

registerHooks({
  resolve(specifier, context, nextResolve) {
    const alias = ALIASES.find(([prefix]) => specifier.startsWith(prefix));
    if (!alias) return nextResolve(specifier, context);
    const [prefix, target] = alias;
    return nextResolve(new URL(specifier.slice(prefix.length), target).href, context);
  },
});
