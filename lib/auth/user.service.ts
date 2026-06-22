/**
 * V59 SaaS — User service
 */

import { prisma } from "@/lib/prisma";

export async function findUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
}

export async function upsertUserByEmail(email: string, name?: string) {
  const normalized = email.toLowerCase().trim();
  return prisma.user.upsert({
    where: { email: normalized },
    create: { email: normalized, name },
    update: name ? { name } : {},
  });
}

export async function setUserPassword(userId: string, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { password: passwordHash },
  });
}
