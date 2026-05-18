import { cookies } from "next/headers";
import { normalizeEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeSessionTokenHash } from "@/lib/session";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
};

/**
 * 从 HttpOnly session cookie 解析当前登录用户（服务端）。
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session")?.value;
  if (!raw) return null;

  const tokenHash = computeSessionTokenHash(raw);
  const sess = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!sess || sess.expiresAt.getTime() < Date.now()) return null;

  if (sess.user) {
    return {
      id: sess.user.id,
      email: sess.user.email,
      name: sess.user.name,
    };
  }

  const email = normalizeEmail(sess.email);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name };
}

export async function getCurrentUserId(): Promise<string | null> {
  const u = await getCurrentUser();
  return u?.id ?? null;
}
