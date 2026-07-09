/**
 * V69 P6 — Test standard catalog (declarative)
 */
import type { TestStandardEntry, TestStandardManifest } from "./governance.types";
import { V69_QUALITY_GOVERNANCE_VERSION } from "./governance.types";

export const TEST_STANDARD_CATALOG: TestStandardEntry[] = [
  {
    id: "QGOV-TST-001",
    qualityObjectRef: "QGOV-OBJ-001",
    testKind: "verify",
    coverageTarget: 100,
    required: true,
    description: "Application verify script coverage",
  },
  {
    id: "QGOV-TST-002",
    qualityObjectRef: "QGOV-OBJ-002",
    testKind: "contract",
    coverageTarget: 100,
    required: true,
    description: "API contract verify coverage",
  },
  {
    id: "QGOV-TST-003",
    qualityObjectRef: "QGOV-OBJ-003",
    testKind: "unit",
    coverageTarget: 80,
    required: true,
    description: "Domain engine unit test target",
  },
  {
    id: "QGOV-TST-004",
    qualityObjectRef: "QGOV-OBJ-004",
    testKind: "integration",
    coverageTarget: 90,
    required: true,
    description: "Data layer integration test target",
  },
  {
    id: "QGOV-TST-005",
    qualityObjectRef: "QGOV-OBJ-005",
    testKind: "contract",
    coverageTarget: 100,
    required: true,
    description: "Security RBAC contract tests",
  },
  {
    id: "QGOV-TST-006",
    qualityObjectRef: "QGOV-OBJ-006",
    testKind: "verify",
    coverageTarget: 100,
    required: true,
    description: "Platform governance verify coverage",
  },
  {
    id: "QGOV-TST-007",
    qualityObjectRef: "QGOV-OBJ-007",
    testKind: "verify",
    coverageTarget: 100,
    required: true,
    description: "Monitoring frozen zone verify read-only",
  },
  {
    id: "QGOV-TST-008",
    qualityObjectRef: "QGOV-OBJ-008",
    testKind: "integration",
    coverageTarget: 95,
    required: true,
    description: "Deployment pipeline integration tests",
  },
];

export function buildTestStandardManifest(): TestStandardManifest {
  const standards = TEST_STANDARD_CATALOG;
  const kinds = new Set(standards.map((s) => s.testKind));
  const catalogComplete = standards.length >= 6 && kinds.size >= 3;

  return {
    version: V69_QUALITY_GOVERNANCE_VERSION,
    entryCount: standards.length,
    kindCount: kinds.size,
    catalogComplete,
    standards,
    summary: [
      `test-standards count=${standards.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getTestStandardsByObjectRef(
  qualityObjectRef: string,
): TestStandardEntry[] {
  return TEST_STANDARD_CATALOG.filter((t) => t.qualityObjectRef === qualityObjectRef);
}
