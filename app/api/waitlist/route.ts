import { NextResponse } from "next/server";
import { insertWaitlistEmail, isDuplicate } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const duplicate = await isDuplicate(email.toLowerCase());
    const row = await insertWaitlistEmail(email.toLowerCase());
    return NextResponse.json({ success: true, duplicate, row: { id: row.id, email: row.email, created_at: row.created_at } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
