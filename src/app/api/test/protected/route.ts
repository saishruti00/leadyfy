import { NextResponse } from "next/server";

import { requireRole } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireRole(["ADMIN"]);

  if (auth.response) {
    return auth.response;
  }

  return NextResponse.json({
    success: true,
    message: "Admin access granted",
    user: auth.user,
  });
}