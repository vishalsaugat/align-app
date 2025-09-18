import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function insertWaitlistEmail(email: string) {
  try {
    const result = await prisma.waitlist.upsert({
      where: { email },
      update: { email },
      create: { email },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
    return {
      id: result.id,
      email: result.email,
      created_at: result.createdAt,
    };
  } catch (error) {
    console.error('Failed to insert waitlist email:', error);
    throw error;
  }
}

export async function isDuplicate(email: string) {
  try {
    const existing = await prisma.waitlist.findUnique({
      where: { email },
      select: { id: true },
    });
    return existing !== null;
  } catch (error) {
    console.error('Failed to check email duplicate:', error);
    throw error;
  }
}
