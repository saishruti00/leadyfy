import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth-session";

type UserRole = "OWNER" | "ADMIN" | "EMPLOYEE" | "CLIENT";

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

export async function requireRole(allowedRoles: UserRole[]) {
  const auth = await requireAuth();

  if (auth.response) {
    return auth;
  }

if (
  typeof auth.user === "string" ||
  !("role" in auth.user) ||
  !allowedRoles.includes(auth.user.role as UserRole)
) {    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 },
      ),
    };
  }

  return auth;
}