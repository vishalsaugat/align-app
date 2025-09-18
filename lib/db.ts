import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as unknown as {
  __prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

// Waitlist functions
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

// User authentication functions
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { 
        email,
        deletedAt: null // Only get non-deleted users
      },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      role: user.role,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  } catch (error) {
    console.error('Failed to get user by email:', error);
    throw error;
  }
}

export async function createUser(email: string, passwordHash: string, name?: string, role?: string) {
  try {
    const result = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role || 'member',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    
    return {
      id: result.id,
      email: result.email,
      name: result.name,
      role: result.role,
      created_at: result.createdAt,
    };
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}
