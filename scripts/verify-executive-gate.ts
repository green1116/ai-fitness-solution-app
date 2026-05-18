/**
 * V3.4-E10 Executive Approval Gate Runtime 冒烟验证
 */
import {
  buildExecutiveApprovalGate,
  EXECUTIVE_APPROVAL_GATE_RUNTIME_CONTRACT,
  runExecutiveApprovalGateRuntime,
  runExecutiveOversightRuntime,
  runExternalEvidenceRuntime,
  runTenderGovernanceRuntime,
  summarizeExecutiveGate,
  toBuildExecutiveApprovalGateInput,
} from "../lib/evidence";
import { runEvidenceCoverageRuntime } from "../lib/evidence/coverage";
import { runTenderAuditRuntime } from "../lib/evidence/audit";
import { runTenderDecisionRuntime } from "../lib/evidence/decision";
import { runTenderValidationRuntime } from "../lib/evidence/validation";
import { buildFixtureLinking } from "./helpers/evidence-fixture";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testBuildExecutiveApprovalGate() {
  assert(
    EXECUTIVE_APPROVAL_GATE_RUNTIME_CONTRACT.pipeline.join("→") ===
      "collect_reasons→evaluate_oversight→resolve_gate→tender_release_decision→debug",
    "gate contract",
  );

  const { requirements, linking, registry, attachments, ocrDocuments } =
    await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "gate-doc-1" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments,
  });
  const tenderAudit = runTenderAuditRuntime({
    runId: "gate-run-1",
    documentId: "gate-doc-1",
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
    runId: "gate-run-1",
    documentId: "gate-doc-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    linking,
  });
  const tenderGovernance = runTenderGovernanceRuntime({
    runId: "gate-run-1",
    documentId: "gate-doc-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
  });

  const executiveOversight = runExecutiveOversightRuntime({
    runId: "gate-run-1",
    documentId: "gate-doc-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });

  const gateInput = toBuildExecutiveApprovalGateInput({
    runId: "gate-run-1",
    documentId: "gate-doc-1",
    executiveOversight,
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });

  const pkg = buildExecutiveApprovalGate(gateInput);
  assert(pkg.version === "3.4-e10", "version");
  assert(
    ["approved", "conditional", "blocked"].includes(pkg.status),
    "status",
  );
  assert(
    ["release", "conditional-release", "block-release"].includes(pkg.recommendation),
    "recommendation",
  );
  assert(pkg.debug.summary.includes("[ExecutiveGateRuntime]"), "debug");

  const gate = runExecutiveApprovalGateRuntime({
    runId: "gate-run-1",
    documentId: "gate-doc-1",
    executiveOversight,
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });

  assert(gate.status === pkg.status, "wrapper status");
  assert(gate.trace.events.length >= 4, "trace");

  console.log("✓ buildExecutiveApprovalGate (V3.4-E10)");
  console.log(" ", summarizeExecutiveGate(gate));
}

async function testReleasePath() {
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
    tenderDocument: { documentId: "gate-bid-001", tenderTitle: "放行门控测试" },
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;

  const gate = result.executiveApprovalGate;
  assert(gate?.version === "3.4-e10", "executiveApprovalGate");
  assert(
    gate.recommendation === "release" || gate.recommendation === "conditional-release",
    "release path",
  );
  assert(gate.tenderReleaseDecision !== "release-denied", "not denied on happy path");

  console.log("✓ Full pipeline tender release");
  console.log("  status:", gate.status);
  console.log("  releasable:", gate.releasable);
  console.log("  tenderReleaseDecision:", gate.tenderReleaseDecision);
}

async function testBlockPath() {
  const { requirements, linking, registry } = await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "gate-block" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments: [],
    policy: { requireAttachments: true },
  });
  const tenderDecision = runTenderDecisionRuntime({
    runId: "gate-block",
    documentId: "gate-block",
    coverageRuntime,
    tenderValidation,
  });
  const tenderGovernance = runTenderGovernanceRuntime({
    runId: "gate-block",
    documentId: "gate-block",
    coverageRuntime,
    tenderValidation,
    tenderDecision,
    policy: { haltOnCriticalRisk: true },
  });
  const executiveOversight = runExecutiveOversightRuntime({
    runId: "gate-block",
    documentId: "gate-block",
    coverageRuntime,
    tenderValidation,
    tenderDecision,
    tenderGovernance,
    linking,
  });

  const gate = runExecutiveApprovalGateRuntime({
    runId: "gate-block",
    documentId: "gate-block",
    executiveOversight,
    coverageRuntime,
    tenderValidation,
    tenderDecision,
    tenderGovernance,
    linking,
  });

  assert(gate.recommendation === "block-release", "block release");
  assert(!gate.releasable, "not releasable");
  assert(gate.tenderReleaseDecision === "release-denied", "denied");
  assert(gate.status === "blocked", "blocked");

  console.log("✓ Executive gate block path");
  console.log("  reasons:", gate.reasons.join(", "));
}

async function main() {
  await testBuildExecutiveApprovalGate();
  await testReleasePath();
  await testBlockPath();
  console.log("\nAll executive approval gate checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
