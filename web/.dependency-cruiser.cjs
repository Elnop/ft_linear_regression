/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Un cycle d’imports rend les modules indissociables : extraire la partie commune.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-unresolvable',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'lib-is-leaf',
      severity: 'error',
      comment: 'lib/ est du technique pur : il ne dépend ni de l’app, ni des features, ni des composants.',
      from: { path: '^src/lib/' },
      to: { path: '^src/(app|features|components)/' },
    },
    {
      name: 'shared-not-to-features',
      severity: 'error',
      comment: 'components/shared/ sert toute l’app : il ne connaît aucune feature.',
      from: { path: '^src/components/' },
      to: { path: '^src/(app|features)/' },
    },
    {
      name: 'features-not-to-app',
      severity: 'error',
      comment: 'Une feature ne remonte jamais vers app/ : c’est app/ qui compose les features.',
      from: { path: '^src/features/' },
      to: { path: '^src/app/' },
    },
    {
      name: 'no-cross-feature-components',
      severity: 'error',
      comment: 'Une feature n’importe pas les composants d’une autre : composer depuis app/ ou promouvoir dans components/shared/.',
      from: { path: '^src/features/([^/]+)/' },
      to: { path: '^src/features/[^/]+/(components|[^/]+/components)/', pathNot: '^src/features/$1/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    parser: 'swc',
    tsPreCompilationDeps: true,
    enhancedResolveOptions: { extensions: ['.ts', '.tsx', '.js'] },
  },
};
