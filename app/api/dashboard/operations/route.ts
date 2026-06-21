import { NextRequest } from "next/server";

import { handleDashboardGet } from "@/lib/dashboard/dashboard.api";

export async function GET(req: NextRequest) {
  return handleDashboardGet(req, "operations", "/api/dashboard/operations");
}
