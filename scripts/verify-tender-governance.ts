/**
 * V3.4-E8 Tender Governance Runtime 冒烟验证
 */
import {
  TENDER_GOVERNANCE_RUNTIME_CONTRACT,
  runExternalEvidenceRuntime,
  runTenderAuditRuntime,
  runTenderDecisionRuntime,
  runTenderGovernanceRuntime,
  summarizeTenderGovernance,
} from "../lib/evidence";
import { runEvidenceCoverageRuntime } from "../lib/evidence/coverage";
import { runTenderValidationRuntime } from "../lib/evidence/validation";
import { buildFixtureLinking } from "./helpers/evidence-fixture";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testGovernanceRuntime() {
  assert(
    TENDER_GOVERNANCE_RUNTIME_CONTRACT.pipeline.join("→") ===
      "collect_inputs→assess_risk→run_controls→resolve_posture→governance_result",
    "governance contract",
  );

  const { requirements, linking, registry, attachments, ocrDocuments } =
    await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "gov-doc-1" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments,
  });
  const tenderAudit = runTenderAuditRuntime({
    runId: "gov-run-1",
    documentId: "gov-doc-1",
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
    runId: "gov-run-1",
    documentId: "gov-doc-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    linking,
  });

  const governance = runTenderGovernanceRuntime({
    runId: "gov-run-1",
    documentId: "gov-doc-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
  });

  assert(governance.version === "3.4-e8", "version");
  assert(
    ["low", "medium", "high", "critical"].includes(governance.riskLevel),
    "risk level",
  );
  assert(
    ["proceed", "escalate", "hold", "halt"].includes(governance.posture),
    "posture",
  );
  assert(governance.controls.length === 5, "5 controls");
  assert(governance.trace.events.length >= 5, "trace");
  assert(governance.explain.length > 0, "explain");

  console.log("✓ Tender Governance Runtime (V3.4-E8)");
  console.log(" ", summarizeTenderGovernance(governance));
}

async function testProceedPath() {
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
    tenderDocument: { documentId: "gov-bid-001" },
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;
  assert(result.tenderGovernance?.version === "3.4-e8", "tenderGovernance");
  const tenderGovernance = result.tenderGovernance;
  if (!tenderGovernance) return;
  assert(tenderGovernance.riskLevel === "low", "low risk");
  assert(tenderGovernance.posture === "proceed", "proceed posture");

  console.log("✓ Full pipeline governance");
  console.log("  risk:", tenderGovernance.riskLevel);
  console.log("  posture:", tenderGovernance.posture);
}

async function testHaltPath() {
  const { requirements, linking, registry } = await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "gov-halt" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments: [],
    policy: { requireAttachments: true },
  });
  const tenderDecision = runTenderDecisionRuntime({
    runId: "gov-halt",
    documentId: "gov-halt",
    coverageRuntime,
    tenderValidation,
  });
  const governance = runTenderGovernanceRuntime({
    runId: "gov-halt",
    documentId: "gov-halt",
    coverageRuntime,
    tenderValidation,
    tenderDecision,
    policy: { haltOnCriticalRisk: true },
  });

  assert(governance.riskLevel === "critical", "critical risk");
  assert(governance.posture === "halt", "halt posture");
  assert(governance.escalation.required, "escalation required");

  console.log("✓ Halt governance path");
  console.log("  escalation:", governance.escalation.level);
}

async function main() {
  await testGovernanceRuntime();
  await testProceedPath();
  await testHaltPath();
  console.log("\nAll tender governance checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
