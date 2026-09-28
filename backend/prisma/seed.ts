import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const owner = await prisma.user.upsert({
    where: { email: 'owner@buildflow.com' },
    update: {},
    create: {
      email: 'owner@buildflow.com',
      password: passwordHash,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      role: 'OWNER'
    }
  });

  const pm = await prisma.user.upsert({
    where: { email: 'pm@buildflow.com' },
    update: {},
    create: {
      email: 'pm@buildflow.com',
      password: passwordHash,
      firstName: 'Amit',
      lastName: 'Sharma',
      role: 'PROJECT_MANAGER'
    }
  });

  const engineer = await prisma.user.upsert({
    where: { email: 'engineer@buildflow.com' },
    update: {},
    create: {
      email: 'engineer@buildflow.com',
      password: passwordHash,
      firstName: 'Vikram',
      lastName: 'Singh',
      role: 'SITE_ENGINEER'
    }
  });

  // Create Client
  const client = await prisma.client.create({
    data: {
      name: 'Delhi Municipal Corporation',
      company: 'Govt. of Delhi',
      email: 'contact@mcd.gov.in',
      phone: '011-23456789',
      address: 'Civic Centre, New Delhi'
    }
  });

  // Create Project
  const project = await prisma.project.create({
    data: {
      name: 'South Extension Flyover Upgrade',
      location: 'South Ex, New Delhi',
      clientId: client.id,
      creatorId: pm.id,
      startDate: new Date('2024-01-15'),
      expectedEndDate: new Date('2025-06-30'),
      contractValue: 45000000, // 4.5 Cr
      status: 'ACTIVE',
      boqItems: {
        create: [
          { itemCode: 'C-01', description: 'M30 Grade Concrete', category: 'Civil', unit: 'Cubic Meter', estimatedQty: 1500, rate: 5500 },
          { itemCode: 'S-01', description: 'TMT Steel 500D', category: 'Structural', unit: 'Ton', estimatedQty: 120, rate: 65000 }
        ]
      }
    }
  });

  // Create Vendor
  const vendor = await prisma.vendor.create({
    data: {
      name: 'UltraTech Cement Ltd',
      company: 'UltraTech',
      email: 'sales@ultratech.com',
      phone: '1800-123-456',
      categories: ['Cement', 'Concrete']
    }
  });

  // Create Materials
  const cement = await prisma.material.create({
    data: {
      name: 'OPC 43 Grade Cement',
      category: 'Cement',
      unit: 'Bags',
      currentStock: 500,
      minStock: 200,
      avgPurchaseRate: 380
    }
  });

  const steel = await prisma.material.create({
    data: {
      name: 'TMT Rebar 12mm',
      category: 'Steel',
      unit: 'Ton',
      currentStock: 15,
      minStock: 10,
      avgPurchaseRate: 62000
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
