// lib/auth-server.ts
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function getSessionEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session")?.value;
  if (!raw) return null;

  const tokenHash = sha256(raw);
  const sess = await prisma.session.findUnique({ where: { tokenHash } });
  if (!sess) return null;

  if (sess.expiresAt.getTime() < Date.now()) return null;
  return sess.email;
}
