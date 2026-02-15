/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-no-external-imports',
      comment: 'Domain must not import from application, infrastructure, or interfaces',
      severity: 'error',
      from: { path: '^src/domain/' },
      to: { path: '^src/(application|infrastructure|interfaces)/' },
    },
    {
      name: 'application-no-infra-or-interface',
      comment: 'Application may only import from domain',
      severity: 'error',
      from: { path: '^src/application/' },
      to: { path: '^src/(infrastructure|interfaces)/' },
    },
    {
      name: 'infrastructure-no-interface',
      comment: 'Infrastructure must not import from interfaces',
      severity: 'error',
      from: { path: '^src/infrastructure/' },
      to: { path: '^src/interfaces/' },
    },
    {
      name: 'no-express-outside-interface',
      comment: 'Express must only be used in the interface layer and server.ts',
      severity: 'error',
      from: { path: '^src/(domain|application|infrastructure)/' },
      to: { path: 'express' },
    },
    {
      name: 'no-mongoose-outside-infrastructure',
      comment: 'Mongoose must only be used in the infrastructure layer',
      severity: 'error',
      from: { path: '^src/(domain|application|interfaces)/' },
      to: { path: 'mongoose' },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
};
