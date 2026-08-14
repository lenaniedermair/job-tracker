import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5432/jobtracker?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Demo User anlegen
  const user = await prisma.user.upsert({
    where: { email: 'demo@jobtracker.dev' },
    update: {},
    create: {
      id: 'user_demo_123',
      email: 'demo@jobtracker.dev',
      name: 'Max Mustermann',
    },
  });

  // Demo Bewerbungen anlegen
  await prisma.application.createMany({
    data: [
      {
        userId: user.id,
        company: 'Stripe',
        position: 'Senior Frontend Engineer',
        location: 'Remote / Berlin',
        salary: '€90,000 - €105,000',
        status: ApplicationStatus.INTERVIEW,
        notes: 'Erstgespräch lief super! Technisches Interview steht an.',
      },
      {
        userId: user.id,
        company: 'Vercel',
        position: 'Full Stack Architect',
        location: 'Remote',
        salary: '€110,000',
        status: ApplicationStatus.APPLIED,
        notes: 'Bewerbung über Empfehlung eingereicht.',
      },
      {
        userId: user.id,
        company: 'SAP',
        position: 'Cloud Developer',
        location: 'München',
        status: ApplicationStatus.WISHLIST,
      },
      {
        userId: user.id,
        company: 'GitHub',
        position: 'Staff Engineer',
        location: 'Remote',
        salary: '€130,000',
        status: ApplicationStatus.OFFER,
        notes: 'Vertragsangebot liegt vor. Verhandlung läuft.',
      },
    ],
  });

  console.log('🌱 Seed-Daten erfolgreich eingefügt!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });