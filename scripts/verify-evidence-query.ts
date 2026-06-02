/**
 * V2.7 Evidence Query 冒烟验证（tsx scripts/verify-evidence-query.ts）
 */
import { buildEvidenceFromPipeline } from "../lib/tender/evidence/bridge";
import { packageEvidenceQuery, queryEvidenceRegistry } from "../lib/tender/evidence/query";
import type { EvidenceRegistry } from "../lib/tender/evidence/types";
import { createEvidenceRegistry, linkRequirementEvidence, addEvidenceDocument } from "../lib/tender/evidence/registry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testMatrixRequirementIdLink() {
  let registry: EvidenceRegistry = createEvidenceRegistry();
  registry = addEvidenceDocument(registry, {
    id: "EV-1",
    title: "跑步机技术参数表",
    type: "datasheet",
    skuId: "treadmill-a",
  });
  registry = linkRequirementEvidence(registry, {
    requirementId: "REQ-001",
    evidenceId: "EV-1",
    confidence: 0.8,
  });

  const matrix = [
    {
      requirementId: "REQ-001",
      requirement: "最大速度 ≥ 20km/h",
      evidenceStatus: "fully_evidenced" as const,
      evidenceTitle: "跑步机技术参数表",
    },
  ];
  const coverage = [
    {
      requirementId: "REQ-001",
      status: "fully_evidenced" as const,
      linkedEvidenceIds: ["EV-1"],
    },
  ];

  const q = queryEvidenceRegistry(registry, matrix, coverage);
  assert(q.byRequirement.length === 1, "byRequirement count");
  assert(q.byRequirement[0].matrixRow?.requirementId === "REQ-001", "matrixRow by requirementId");

  const filtered = queryEvidenceRegistry(registry, matrix, coverage, {
    coverageStatus: "fully_evidenced",
  });
  assert(filtered.matrixRows.length === 1, "coverageStatus matrix filter");
  console.log("✓ matrix requirementId + coverageStatus filter");
}

function testPackageEvidenceQuery() {
  const evidence = buildEvidenceFromPipeline({
    graph: {
      requirements: [
        {
          id: "REQ-SPEED",
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
      compliance: [],
    },
  });

  const query = packageEvidenceQuery(evidence);
  assert(query.summary.documentCount >= 0, "document count");
  assert(Array.isArray(query.byRequirement), "byRequirement array");
  console.log("✓ packageEvidenceQuery from minimal graph");
  console.log("  summary:", query.summary);
}

function main() {
  testMatrixRequirementIdLink();
  testPackageEvidenceQuery();
  console.log("\nAll evidence query checks passed.");
}

main();
