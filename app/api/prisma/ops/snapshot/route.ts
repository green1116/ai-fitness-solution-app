import { NextRequest } from "next/server";
import { assertPrismaOpsAccess } from "../_gate";
import { handleOpsSnapshot } from "@/lib/prisma-stability/ops/prisma.ops.api";

export async function GET(req: NextRequest) {
  const access = await assertPrismaOpsAccess(req);
  if (!access.authorized) return access.response;
  return handleOpsSnapshot(req);
}

export async function POST(req: NextRequest) {
  return GET(req);
}
