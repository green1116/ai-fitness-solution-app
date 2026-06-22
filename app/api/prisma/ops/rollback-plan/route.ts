import { NextRequest } from "next/server";
import { assertPrismaOpsAccess } from "../_gate";
import { handleOpsRollbackPlan } from "@/lib/prisma-stability/ops/prisma.ops.api";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const access = await assertPrismaOpsAccess(req, body);
  if (!access.authorized) return access.response;
  return handleOpsRollbackPlan();
}
