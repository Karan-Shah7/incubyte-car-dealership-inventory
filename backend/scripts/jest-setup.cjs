const { loadTestEnvironment, verifyTestDatabase } = require('./test-environment.cjs');

module.exports = async () => {
  // setupFiles completes before test modules (and their cleanup hooks) are loaded.
  const config = loadTestEnvironment();
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient({ datasourceUrl: config.DATABASE_URL });
  try { await verifyTestDatabase(prisma); }
  finally { await prisma.$disconnect(); }
};
