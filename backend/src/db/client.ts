import { PrismaClient } from '@prisma/client';

// Pin the approved test datasource before Prisma initializes, including when a
// test imports this module without importing the Express application first.
const testConfig = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID
  ? require('../../scripts/test-environment.cjs').loadTestEnvironment()
  : undefined;

export const prisma = new PrismaClient(testConfig ? { datasourceUrl: testConfig.DATABASE_URL } : undefined);

export default prisma;
