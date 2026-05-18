/**
 * V3.4-E9 Executive Oversight Runtime 冒烟验证
 */
import {
  buildExecutiveOversightRuntime,
  EXECUTIVE_OVERSIGHT_RUNTIME_CONTRACT,
  formatExecutiveDebug,
  runExecutiveOversightRuntime,
  runExternalEvidenceRuntime,
  runTenderGovernanceRuntime,
  summarizeExecutiveOversight,
  toBuildExecutiveOversightInput,
} from "../lib/evidence";
import { runEvidenceCoverageRuntime } from "../lib/evidence/coverage";
import { runTenderAuditRuntime } from "../lib/evidence/audit";
import { runTenderDecisionRuntime } from "../lib/evidence/decision";
import { runTenderValidationRuntime } from "../lib/evidence/validation";
import { buildFixtureLinking } from "./helpers/evidence-fixture";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testBuildExecutiveOversightRuntime() {
  assert(
    EXECUTIVE_OVERSIGHT_RUNTIME_CONTRACT.pipeline.join("→") ===
      "executive_risk→executive_score→findings→recommendation_rules→debug",
    "executive contract",
  );

  const { requirements, linking, registry, attachments, ocrDocuments } =
    await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "exec-doc-1" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments,
  });
  const tenderAudit = runTenderAuditRuntime({
    runId: "exec-run-1",
    documentId: "exec-doc-1",
    startedAt: new Date().toISOString(),
    requirements,
    ocrDocuments,
    linking,
    coverageRuntime,
    tenderValidation,
    registry,
    attachments,
  });
  const tenderDecision = runTenderDecisionRuntime({
    runId: "exec-run-1",
    documentId: "exec-doc-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    linking,
  });
  const tenderGovernance = runTenderGovernanceRuntime({
    runId: "exec-run-1",
    documentId: "exec-doc-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
  });

  const input = toBuildExecutiveOversightInput({
    runId: "exec-run-1",
    documentId: "exec-doc-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });

  const pkg = buildExecutiveOversightRuntime(input);
  assert(pkg.version === "3.4-e9", "version");
  assert(pkg.executiveScore >= 0 && pkg.executiveScore <= 100, "score range");
  assert(
    ["approve", "conditional-approve", "review-required", "reject"].includes(
      pkg.recommendation,
    ),
    "recommendation",
  );
  assert(pkg.debug.summary.includes("[ExecutiveRuntime]"), "debug summary");
  assert(pkg.debug.findings.includes("Governance:"), "debug findings");

  const debug = formatExecutiveDebug({
    result: pkg,
    risk: pkg.risk,
    input,
    recommendationTexts: pkg.recommendations,
  });
  assert(debug.summary === pkg.debug.summary, "formatExecutiveDebug");

  const executive = runExecutiveOversightRuntime({
    runId: "exec-run-1",
    documentId: "exec-doc-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });

  assert(executive.recommendation === pkg.recommendation, "wrapper recommendation");
  assert(executive.brief.length >= 4, "brief sections");
  assert(executive.trace.events.length >= 4, "trace");

  console.log("✓ buildExecutiveOversightRuntime (V3.4-E9)");
  console.log(" ", summarizeExecutiveOversight(executive));
  console.log(" ", pkg.debug.summary.split("\n")[1]);
}

async function testApprovePath() {
  const result = await runExternalEvidenceRuntime({
    attachments: [
      {
        buffer: Buffer.from("ISO9001 质量管理体系认证证书", "utf8"),
        fileName: "cert.txt",
        mimeType: "text/plain",
      },
    ],
    requirementItems: [
      {
        id: "req-1",
        title: "ISO9001",
        text: "ISO9001 质量管理体系认证",
        keywords: ["ISO9001"],
        mandatory: true,
        category: "qualification",
      },
    ],
    tenderDocument: { documentId: "exec-bid-001", tenderTitle: "高管审阅测试" },
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;
  assert(result.executiveOversight?.version === "3.4-e9", "executiveOversight");
  assert(
    result.executiveOversight.recommendation === "approve" ||
      result.executiveOversight.recommendation === "conditional-approve",
    "approve path",
  );
  assert(result.executiveOversight.executiveScore >= 70, "score");

  console.log("✓ Full pipeline executive approve");
  console.log("  recommendation:", result.executiveOversight.recommendation);
  console.log("  score:", result.executiveOversight.executiveScore);
}

async function testRejectPath() {
  const { requirements, linking, registry } = await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "exec-deny" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments: [],
    policy: { requireAttachments: true },
  });
  const tenderDecision = runTenderDecisionRuntime({
    runId: "exec-deny",
    documentId: "exec-deny",
    coverageRuntime,
    tenderValidation,
  });
  const tenderGovernance = runTenderGovernanceRuntime({
    runId: "exec-deny",
    documentId: "exec-deny",
    coverageRuntime,
    tenderValidation,
    tenderDecision,
    policy: { haltOnCriticalRisk: true },
  });
  const executive = runExecutiveOversightRuntime({
    runId: "exec-deny",
    documentId: "exec-deny",
    coverageRuntime,
    tenderValidation,
    tenderDecision,
    tenderGovernance,
    policy: { denyOnGovernanceHalt: true },
  });

  assert(
    executive.recommendation === "reject" || executive.verdict === "deny",
    "reject path",
  );
  assert(
    executive.riskLevel === "critical" || executive.riskLevel === "high",
    "elevated risk",
  );

  console.log("✓ Executive reject path");
  console.log("  recommendation:", executive.recommendation);
}

async function main() {
  await testBuildExecutiveOversightRuntime();
  await testApprovePath();
  await testRejectPath();
  console.log("\nAll executive oversight checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
