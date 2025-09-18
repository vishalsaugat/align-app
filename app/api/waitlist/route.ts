import { NextResponse } from "next/server";
import { insertWaitlistEmail, isDuplicate } from "@/lib/db";
import { 
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError
} from "@prisma/client/runtime/library";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email || typeof email !== "string") {
      console.warn('Waitlist API: Invalid email provided', { email: typeof email });
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      console.warn('Waitlist API: Invalid email format', { email: normalizedEmail });
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    console.log('Waitlist API: Processing email', { email: normalizedEmail });

    const duplicate = await isDuplicate(normalizedEmail);
    const row = await insertWaitlistEmail(normalizedEmail);
    
    console.log('Waitlist API: Successfully processed email', { 
      email: normalizedEmail, 
      duplicate, 
      id: row.id 
    });

    return NextResponse.json({ 
      success: true, 
      duplicate, 
      row: { 
        id: row.id, 
        email: row.email, 
        created_at: row.created_at 
      } 
    });
  } catch (error) {
    console.error('Waitlist API: Error processing request', {
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
        case 'P2002':
          console.warn('Waitlist API: Unique constraint violation (duplicate email)');
          return NextResponse.json({ error: "Email already exists" }, { status: 409 });
        case 'P2025':
          console.error('Waitlist API: Record not found');
          return NextResponse.json({ error: "Record not found" }, { status: 404 });
        default:
          console.error('Waitlist API: Database constraint error', { code: error.code });
          return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    if (error instanceof PrismaClientUnknownRequestError) {
      console.error('Waitlist API: Unknown database error');
      return NextResponse.json({ error: "Database connection error" }, { status: 500 });
    }

    if (error instanceof PrismaClientRustPanicError) {
      console.error('Waitlist API: Database engine panic');
      return NextResponse.json({ error: "Database engine error" }, { status: 500 });
    }

    if (error instanceof PrismaClientInitializationError) {
      console.error('Waitlist API: Database initialization error');
      return NextResponse.json({ error: "Database initialization error" }, { status: 500 });
    }

    if (error instanceof PrismaClientValidationError) {
      console.error('Waitlist API: Database validation error');
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
