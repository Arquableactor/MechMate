import type { Config } from 'jest';

const transform: Config['transform'] = {
  '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
};
const moduleNameMapper: Config['moduleNameMapper'] = {
  '^@repo/types$': '<rootDir>/../../packages/types/src/index.ts',
};
const moduleFileExtensions = ['ts', 'js', 'json'];

const config: Config = {
  testTimeout: 60000,
  // Los tests de integración comparten UN Postgres: con 1 worker por núcleo y
  // un pool de Prisma por worker, los picos agotaban conexiones (timeouts al
  // conectar). 4 workers × pool de 5 (setup-env) = 20 conexiones como máximo.
  maxWorkers: 4,
  projects: [
    {
      displayName: 'unit',
      rootDir: '.',
      testEnvironment: 'node',
      moduleFileExtensions,
      testMatch: ['<rootDir>/src/**/*.spec.ts'],
      testPathIgnorePatterns: ['/node_modules/', '\\.int\\.spec\\.ts$'],
      transform,
      moduleNameMapper,
      setupFiles: ['<rootDir>/src/common/bigint-serializer.ts'],
    },
    {
      displayName: 'integration',
      rootDir: '.',
      testEnvironment: 'node',
      moduleFileExtensions,
      testMatch: ['<rootDir>/src/**/*.int.spec.ts'],
      transform,
      moduleNameMapper,
      globalSetup: '<rootDir>/test/integration/global-setup.js',
      globalTeardown: '<rootDir>/test/integration/global-teardown.js',
      setupFiles: ['<rootDir>/test/integration/setup-env.ts'],
    },
  ],
};

export default config;
