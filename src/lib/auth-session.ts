import { cookies } from "next/headers";

import { verifyToken } from "@/lib/auth";

const AUTH_COOKIE = "leadyfy_token";

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getAuthToken() {
  const cookieStore = await cookies();

  return cookieStore.get(AUTH_COOKIE)?.value;
}

export async function getCurrentUser() {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE);
}