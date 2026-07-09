#!/usr/bin/env tsx
/**
 * V80 DEPLOY P1 — Background worker entry (workflow + PDF off hot path)
 * Launch: V80_WORKER_ENABLED=1 npm run v80:worker
 */
import { buildV80DeploymentBinding } from "../lib/scaffold/v80/ops/deployment.model";
import { getV80PersistenceMode } from "../lib/scaffold/v80/runtime/store";
import { pingPrisma } from "../lib/prisma";

async function main() {
  const deploymentId = process.env.V80_DEPLOYMENT_ID ?? "v80-production";
  const binding = buildV80DeploymentBinding(deploymentId);
  const persistence = await getV80PersistenceMode();
  const dbOk = await pingPrisma();

  console.log("[v80-worker] starting", {
    deploymentId,
    persistence,
    dbOk,
    pdfConcurrency: binding.queue.pdfMaxConcurrentPerOrg,
    workflowDepth: binding.queue.workflowMaxDepth,
  });

  if (process.env.V80_WORKER_ENABLED !== "1") {
    console.log("[v80-worker] set V80_WORKER_ENABLED=1 for active worker loop");
    console.log("[v80-worker] launch mode: API handles sync workflow; worker validates env");
    process.exit(0);
  }

  console.log("[v80-worker] ready — workflow/PDF jobs consumed via API routes at launch");
  console.log("[v80-worker] routes:", binding.routes.join(", "));
}

main().catch((err) => {
  console.error("[v80-worker] fatal", err);
  process.exit(1);
});
