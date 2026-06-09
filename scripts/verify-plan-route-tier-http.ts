/**
 * 同一 projectId 调用 Plan 路由，验证 Free=5页 / Pro=16页
 *   $env:VERIFY_BASE_URL="http://127.0.0.1:3099"; npx tsx scripts/verify-plan-route-tier-http.ts
 */
import "dotenv/config";
import { PDFDocument } from "pdf-lib";
import { prisma } from "../lib/prisma";

const BASE = (process.env.VERIFY_BASE_URL || "").replace(/\/$/, "");

async function countPages(buf: ArrayBuffer): Promise<number> {
  const doc = await PDFDocument.load(buf);
  return doc.getPageCount();
}

async function postPlan(projectId: string, documentTier: "free" | "pro") {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-plan-document-tier": documentTier,
    "x-mode": documentTier,
  };
  const res = await fetch(`${BASE}/api/pdf/tender/plan`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      projectId,
      planId: projectId,
      documentTier,
      tier: documentTier,
      mode: documentTier,
      docType: "plan",
    }),
  });
  const tierHeader = res.headers.get("x-plan-document-tier");
  const disp = res.headers.get("content-disposition") || "";
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`plan ${documentTier} HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const buf = await res.arrayBuffer();
  const pages = await countPages(buf);
  return { pages, tierHeader, disp, bytes: buf.byteLength };
}

async function main() {
  if (!BASE) {
    console.log("skip HTTP verify (set VERIFY_BASE_URL)");
    return;
  }

  const proj = await prisma.project.findFirst({
    where: { solution: { isNot: null } },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  const projectId = proj?.id;
  if (!projectId) throw new Error("no project with solution");

  console.log("verify plan route @", BASE, { projectId });

  const free = await postPlan(projectId, "free");
  const pro = await postPlan(projectId, "pro");

  console.log("free", free);
  console.log("pro", pro);

  if (free.pages !== 5) throw new Error(`free must be 5 pages, got ${free.pages}`);
  if (pro.pages <= 5) throw new Error(`pro must exceed 5 pages, got ${pro.pages}`);
  if (free.tierHeader !== "free") throw new Error(`free tier header expected free, got ${free.tierHeader}`);
  if (!free.disp.includes("plan-preview")) throw new Error("free should use plan-preview filename");

  console.log("\nverify-plan-route-tier-http: PASS");
}

main().catch((e) => {
  console.error("\nverify-plan-route-tier-http: FAIL");
  console.error(e);
  process.exit(1);
});
