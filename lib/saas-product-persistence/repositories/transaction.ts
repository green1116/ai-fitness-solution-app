import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function runPersistenceTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(fn);
}
