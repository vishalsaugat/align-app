import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";
import bcrypt from "bcryptjs";
import { 
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError
} from "@prisma/client/runtime/library";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || typeof email !== "string") {
      console.warn('Auth API: Invalid email provided', { email: typeof email });
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      console.warn('Auth API: Invalid password provided');
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      console.warn('Auth API: Invalid email format', { email: normalizedEmail });
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    console.log('Auth API: Processing login attempt', { email: normalizedEmail });

    try {
      const user = await getUserByEmail(normalizedEmail);
      
      if (!user) {
        console.warn('Auth API: User not found', { email: normalizedEmail });
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Verify password hash
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValidPassword) {
        console.warn('Auth API: Invalid password', { email: normalizedEmail });
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      
      console.log('Auth API: Login successful', { 
        email: normalizedEmail, 
        userId: user.id 
      });

      // Return user info (in production, you'd generate a JWT token or session)
      return NextResponse.json({ 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email,
          name: user.name,
          role: user.role
        } 
      });

    } catch (userError) {
      if (userError instanceof Error && userError.message === 'User not found') {
        console.warn('Auth API: User not found', { email: normalizedEmail });
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      throw userError; // Re-throw to be handled by outer catch
    }

  } catch (error) {
    console.error('Auth API: Error processing login request', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name,
      code: error instanceof PrismaClientKnownRequestError ? error.code : undefined,
      meta: error instanceof PrismaClientKnownRequestError ? error.meta : undefined,
      timestamp: new Date().toISOString(),
    });

    // Handle specific Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          console.error('Auth API: Record not found');
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        default:
          console.error('Auth API: Database constraint error', { code: error.code });
          return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    if (error instanceof PrismaClientUnknownRequestError) {
      console.error('Auth API: Unknown database error');
      return NextResponse.json({ error: "Database connection error" }, { status: 500 });
    }

    if (error instanceof PrismaClientRustPanicError) {
      console.error('Auth API: Database engine panic');
      return NextResponse.json({ error: "Database engine error" }, { status: 500 });
    }

    if (error instanceof PrismaClientInitializationError) {
      console.error('Auth API: Database initialization error');
      return NextResponse.json({ error: "Database initialization error" }, { status: 500 });
    }

    if (error instanceof PrismaClientValidationError) {
      console.error('Auth API: Database validation error');
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}