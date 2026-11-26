import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/supabase/auth";

export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.email,
      fullName: session.fullName,
      role: session.role,
    },
  });
}
