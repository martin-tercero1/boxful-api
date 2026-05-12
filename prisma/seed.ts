import { PrismaClient } from '../src/generated/prisma/client';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const prisma = new PrismaClient();

async function main() {
  const shippingCosts = [
    { dayOfWeek: 0, cost: 5.0 },  // Sunday
    { dayOfWeek: 1, cost: 3.0 },  // Monday
    { dayOfWeek: 2, cost: 3.5 },  // Tuesday
    { dayOfWeek: 3, cost: 3.5 },  // Wednesday
    { dayOfWeek: 4, cost: 3.5 },  // Thursday
    { dayOfWeek: 5, cost: 4.0 },  // Friday
    { dayOfWeek: 6, cost: 4.5 },  // Saturday
  ];

  for (const config of shippingCosts) {
    await prisma.shippingConfig.upsert({
      where: { dayOfWeek: config.dayOfWeek },
      update: { cost: config.cost },
      create: config,
    });
  }

  console.log('Shipping config seeded');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());