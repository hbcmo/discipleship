const { execSync } = require('node:child_process');

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const databaseUrl = process.env.DATABASE_URL;

try {
  execSync('npx prisma generate', { stdio: 'inherit' });

  if (!databaseUrl) {
    if (isVercel) {
      throw new Error('DATABASE_URL is required on Vercel.');
    }

    console.log('No DATABASE_URL found. Skipping prisma db push for local build.');
    process.exit(0);
  }

  console.log('Applying Prisma schema to database...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('Database schema is up to date.');
} catch (error) {
  console.error('Database preparation failed:', error.message || error);
  process.exit(1);
}
