// lib/auth-server.ts
import { getCurrentUser } from "@/lib/auth/currentUser";

export async function getSessionEmail(): Promise<string | null> {
  const u = await getCurrentUser();
  return u?.email ?? null;
}
