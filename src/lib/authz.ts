import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type CurrentUser = NonNullable<Session["user"]>;
type AuthResult =
  | { user: CurrentUser; response: null }
  | { user: null; response: NextResponse };

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireApiUser(): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user?.id) {
    return { user: null, response: NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 }) };
  }
  return { user, response: null };
}

export async function requireApiAdmin(): Promise<AuthResult> {
  const result = await requireApiUser();
  if (result.response) return result;
  if (result.user.role !== "ADMIN") {
    return { user: null, response: NextResponse.json({ error: "Akses khusus administrator." }, { status: 403 }) };
  }
  return result;
}
