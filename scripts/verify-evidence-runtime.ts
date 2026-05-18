/**
 * V2.8 Evidence Runtime 冒烟验证（tsx scripts/verify-evidence-runtime.ts）
 */
import { runEvidenceRuntime } from "../lib/tender/evidence/runtime";
import { createEvidenceRegistry, addEvidenceDocument, linkRequirementEvidence } from "../lib/tender/evidence/registry";
import { runEvidenceDecisionOnly } from "../lib/tender/evidence/runtime/runEvidenceRuntime";
import { summarizeEvidenceMatrix } from "../lib/tender/evidence/matrix";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testRuntimeStages() {
  const result = runEvidenceRuntime({
    graph: {
      requirements: [
        {
          id: "REQ-001",
          title: "最大速度",
          requirement: "最大速度不低于 20km/h",
          normalizedRequirement: "最大速度不低于 20km/h",
          category: "technical",
          measurable: true,
          importance: "mandatory",
          evidenceRequired: true,
        },
      ],
      sections: [],
      scoringItems: [],
      risks: [],
      qualifications: [],
    },
  });

  assert(result.stages.length === 5, "5 stages");
  assert(result.stages.every((s) => s.durationMs >= 0), "stage durations");
  assert(result.trace.version === "2.8", "trace version");
  assert(["allow", "warn", "block"].includes(result.decision.action), "decision action");
  assert(result.evidence.registry.documents.length >= 0, "registry docs");
  console.log("✓ runEvidenceRuntime stages + trace + decision");
  console.log("  decision:", result.decision.action, result.decision.title);
  console.log("  trace events:", result.trace.summary.eventCount);
}

function testProvenancePreserved() {
  const result = runEvidenceRuntime({
    graph: {
      requirements: [
        {
          id: "REQ-Q",
          title: "资质",
          requirement: "投标人须具备 ISO9001 认证",
          normalizedRequirement: "ISO9001",
          category: "qualification",
          measurable: false,
          importance: "mandatory",
          evidenceRequired: true,
        },
      ],
      sections: [],
      scoringItems: [],
      risks: [],
      qualifications: [],
    },
  });

  const withProv = result.evidence.registry.documents.filter((d) => d.provenance?.trace);
  assert(withProv.length > 0, "provenance.trace preserved");
  console.log("✓ provenance trace preserved on documents");
}

function testDecisionOnly() {
  let registry = createEvidenceRegistry();
  registry = addEvidenceDocument(registry, {
    id: "EV-X",
    title: "测试证据",
    type: "datasheet",
  });
  registry = linkRequirementEvidence(registry, {
    requirementId: "REQ-X",
    evidenceId: "EV-X",
    confidence: 0.9,
  });

  const evidence = {
    registry,
    matrix: [],
    coverage: [
      {
        requirementId: "REQ-X",
        status: "fully_evidenced" as const,
        linkedEvidenceIds: ["EV-X"],
      },
    ],
    summary: {
      ...summarizeEvidenceMatrix([]),
      documentsCount: 1,
      linksCount: 1,
      payloadsCollected: 0,
    },
  };

  const { decision, trace } = runEvidenceDecisionOnly(evidence);
  assert(decision.action === "allow", "allow on full coverage");
  assert(trace.events.some((e) => e.kind === "decision_emitted"), "decision event");
  console.log("✓ runEvidenceDecisionOnly");
}

function main() {
  testRuntimeStages();
  testProvenancePreserved();
  testDecisionOnly();
  console.log("\nAll evidence runtime checks passed.");
}

main();
