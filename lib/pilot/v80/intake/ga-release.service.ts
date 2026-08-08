/**
 * V80 Pilot P20 — GA release manifest builder (documentation / freeze only)
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";

import { INTAKE_ANALYTICS_VERSION } from "./analytics.schema";
import { PROJECT_BOOTSTRAP_VERSION } from "./bootstrap.schema";
import { CONTINUOUS_IMPROVEMENT_VERSION } from "./continuous-improvement.schema";
import { CROSS_PROJECT_VERSION } from "./cross-project.schema";
import { ENTERPRISE_DECISION_VERSION } from "./enterprise-decision.schema";
import {
  PILOT_GA_CODENAME,
  PILOT_GA_RELEASE_DATE,
  PILOT_GA_VERSION,
  type GaApiRouteEntry,
  type GaArchitectureLayer,
  type GaPilotEntry,
  type GaReleaseManifest,
  type GaUiSurfaceEntry,
  type GaVerificationSummary,
} from "./ga-release.schema";
import { INTAKE_HANDOFF_PACKAGE_VERSION } from "./handoff-package.schema";
import { KNOWLEDGE_RECOMMENDATION_VERSION } from "./knowledge-recommendation.schema";
import { ORG_BENCHMARK_VERSION } from "./org-benchmark.schema";
import { ORG_KNOWLEDGE_GOVERNANCE_VERSION } from "./org-knowledge-governance.schema";
import { ORG_KNOWLEDGE_VERSION } from "./org-knowledge.schema";
import { PRODUCTION_HARDENING_VERSION } from "./production-hardening.schema";
import { listRegressionSuiteCatalog } from "./production-hardening.service";
import { V80_PILOT_SIGNOFF_VERSION } from "./signoff.service";

export const GA_PILOTS: GaPilotEntry[] = [
  { id: "P1", name: "Tender Intake", verifyScript: "scripts/verify-pilot-p1-intake.ts", status: "ga" },
  { id: "P2", name: "Review & Edit", verifyScript: "scripts/verify-pilot-p2-review.ts", status: "ga" },
  { id: "P3", name: "Approve & Handoff", verifyScript: "scripts/verify-pilot-p3-handoff.ts", status: "ga" },
  { id: "P4", name: "Ops & Exception Recovery", verifyScript: "scripts/verify-pilot-p4-ops.ts", status: "ga" },
  { id: "P5", name: "Source Traceability & Confidence", verifyScript: "scripts/verify-pilot-p5-trace.ts", status: "ga" },
  { id: "P6", name: "Clarification Loop", verifyScript: "scripts/verify-pilot-p6-clarify.ts", status: "ga" },
  { id: "P7", name: "Multi-document Consolidation", verifyScript: "scripts/verify-pilot-p7-multidoc.ts", status: "ga" },
  { id: "P8", name: "Knowledge & Compliance Validation", verifyScript: "scripts/verify-pilot-p8-compliance.ts", status: "ga" },
  {
    id: "P9",
    name: "Intake Summary & Handoff Package",
    verifyScript: "scripts/verify-pilot-p9-package.ts",
    versionConstant: INTAKE_HANDOFF_PACKAGE_VERSION,
    status: "ga",
  },
  {
    id: "P10",
    name: "Project Bootstrap & Execution Seed",
    verifyScript: "scripts/verify-pilot-p10-bootstrap.ts",
    versionConstant: PROJECT_BOOTSTRAP_VERSION,
    status: "ga",
  },
  {
    id: "P11",
    name: "Intake Intelligence Analytics",
    verifyScript: "scripts/verify-pilot-p11-analytics.ts",
    versionConstant: INTAKE_ANALYTICS_VERSION,
    status: "ga",
  },
  {
    id: "P12",
    name: "Organization Knowledge Learning",
    verifyScript: "scripts/verify-pilot-p12-knowledge.ts",
    versionConstant: ORG_KNOWLEDGE_VERSION,
    status: "ga",
  },
  {
    id: "P13",
    name: "Organization Knowledge Governance",
    verifyScript: "scripts/verify-pilot-p13-governance.ts",
    versionConstant: ORG_KNOWLEDGE_GOVERNANCE_VERSION,
    status: "ga",
  },
  {
    id: "P14",
    name: "Knowledge Recommendation Engine",
    verifyScript: "scripts/verify-pilot-p14-recommend.ts",
    versionConstant: KNOWLEDGE_RECOMMENDATION_VERSION,
    status: "ga",
  },
  {
    id: "P15",
    name: "Continuous Improvement Engine",
    verifyScript: "scripts/verify-pilot-p15-improve.ts",
    versionConstant: CONTINUOUS_IMPROVEMENT_VERSION,
    status: "ga",
  },
  {
    id: "P16",
    name: "Organization Benchmark Platform",
    verifyScript: "scripts/verify-pilot-p16-benchmark.ts",
    versionConstant: ORG_BENCHMARK_VERSION,
    status: "ga",
  },
  {
    id: "P17",
    name: "Cross-Project Intelligence",
    verifyScript: "scripts/verify-pilot-p17-similarity.ts",
    versionConstant: CROSS_PROJECT_VERSION,
    status: "ga",
  },
  {
    id: "P18",
    name: "Enterprise Decision Support",
    verifyScript: "scripts/verify-pilot-p18-decision.ts",
    versionConstant: ENTERPRISE_DECISION_VERSION,
    status: "ga",
  },
  {
    id: "P19",
    name: "Integration & Production Hardening",
    verifyScript: "scripts/verify-pilot-p19-harden.ts",
    versionConstant: PRODUCTION_HARDENING_VERSION,
    status: "ga",
  },
];

export const GA_VERSION_CONSTANTS: Record<string, string> = {
  PILOT_GA_VERSION,
  INTAKE_HANDOFF_PACKAGE_VERSION,
  PROJECT_BOOTSTRAP_VERSION,
  INTAKE_ANALYTICS_VERSION,
  ORG_KNOWLEDGE_VERSION,
  ORG_KNOWLEDGE_GOVERNANCE_VERSION,
  KNOWLEDGE_RECOMMENDATION_VERSION,
  CONTINUOUS_IMPROVEMENT_VERSION,
  ORG_BENCHMARK_VERSION,
  CROSS_PROJECT_VERSION,
  ENTERPRISE_DECISION_VERSION,
  PRODUCTION_HARDENING_VERSION,
  V80_PILOT_SIGNOFF_VERSION,
};

export const GA_API_INDEX: GaApiRouteEntry[] = [
  { method: "POST", path: "/api/pilot/v80/intake/upload", purpose: "Upload tender document" },
  { method: "POST", path: "/api/pilot/v80/intake/extract", purpose: "Extract requirements" },
  { method: "GET|PATCH", path: "/api/pilot/v80/intake/[sessionId]", purpose: "Session read/patch" },
  { method: "POST", path: "/api/pilot/v80/intake/validate", purpose: "Validate requirements" },
  { method: "POST", path: "/api/pilot/v80/intake/approve", purpose: "Approve → production handoff" },
  { method: "POST", path: "/api/pilot/v80/intake/qa", purpose: "QA gate" },
  { method: "GET", path: "/api/pilot/v80/intake/ops", purpose: "Ops exception board" },
  { method: "POST", path: "/api/pilot/v80/intake/[sessionId]/ops/resume", purpose: "Resume stuck ops" },
  { method: "POST", path: "/api/pilot/v80/intake/[sessionId]/generation/retry", purpose: "Retry generation" },
  { method: "POST", path: "/api/pilot/v80/intake/[sessionId]/recover", purpose: "Recover session" },
  { method: "GET|POST", path: "/api/pilot/v80/intake/[sessionId]/clarify", purpose: "Clarification loop" },
  { method: "GET|POST", path: "/api/pilot/v80/intake/[sessionId]/documents", purpose: "Multi-doc registry" },
  { method: "GET|POST", path: "/api/pilot/v80/intake/[sessionId]/compliance", purpose: "Compliance validation" },
  { method: "GET|POST", path: "/api/pilot/v80/intake/[sessionId]/handoff-package", purpose: "Handoff package" },
  { method: "GET|POST", path: "/api/pilot/v80/intake/[sessionId]/bootstrap", purpose: "Bootstrap seed" },
  { method: "GET|POST", path: "/api/pilot/v80/intake/[sessionId]/recommendations", purpose: "Knowledge recommendations" },
  { method: "GET", path: "/api/pilot/v80/intake/[sessionId]/similarity", purpose: "Similar projects" },
  { method: "GET|POST", path: "/api/pilot/v80/intake/[sessionId]/freeze", purpose: "Freeze / delivery lock" },
  { method: "GET|POST", path: "/api/pilot/v80/intake/[sessionId]/signoff", purpose: "Sign-off / release" },
  { method: "GET", path: "/api/pilot/v80/intake/[sessionId]/history", purpose: "Audit history" },
  { method: "GET", path: "/api/pilot/v80/intake/analytics", purpose: "Intake analytics" },
  { method: "GET|POST", path: "/api/pilot/v80/intake/knowledge", purpose: "Org knowledge library" },
  { method: "GET|POST", path: "/api/pilot/v80/intake/knowledge/governance", purpose: "Knowledge governance" },
  { method: "GET|POST", path: "/api/pilot/v80/intake/improvement", purpose: "Continuous improvement" },
  { method: "GET", path: "/api/pilot/v80/intake/benchmark", purpose: "Org benchmark" },
  { method: "GET", path: "/api/pilot/v80/intake/similarity", purpose: "Cross-project explorer" },
  { method: "GET", path: "/api/pilot/v80/intake/decision", purpose: "Enterprise decision report" },
  { method: "GET", path: "/api/pilot/v80/intake/readiness", purpose: "Production hardening report" },
  { method: "GET", path: "/api/pilot/v80/intake/ga", purpose: "GA release manifest export" },
];

export const GA_UI_SURFACES: GaUiSurfaceEntry[] = [
  { path: "/pilot/intake", label: "招标 Intake" },
  { path: "/pilot/ops", label: "运维异常" },
  { path: "/pilot/analytics", label: "智能分析" },
  { path: "/pilot/knowledge", label: "组织知识" },
  { path: "/pilot/improvement", label: "持续改进" },
  { path: "/pilot/benchmark", label: "组织对标" },
  { path: "/pilot/similarity", label: "跨项目" },
  { path: "/pilot/decision", label: "决策支持" },
  { path: "/pilot/readiness", label: "生产就绪" },
];

export const GA_ARCHITECTURE: GaArchitectureLayer[] = [
  {
    id: "intake-core",
    title: "Intake Core (P1–P3)",
    modules: [
      "lib/pilot/v80/intake/upload.service.ts",
      "lib/pilot/v80/intake/extract.service.ts",
      "lib/pilot/v80/intake/review.service.ts",
      "lib/pilot/v80/intake/approve.service.ts",
      "lib/pilot/v80/intake/intake.store.ts",
    ],
  },
  {
    id: "quality-ops",
    title: "Quality, Clarification, Ops (P4–P8)",
    modules: [
      "lib/pilot/v80/intake/ops.service.ts",
      "lib/pilot/v80/intake/confidence.service.ts",
      "lib/pilot/v80/intake/clarification.service.ts",
      "lib/pilot/v80/intake/multidoc.service.ts",
      "lib/pilot/v80/intake/compliance.service.ts",
    ],
  },
  {
    id: "handoff-bootstrap",
    title: "Handoff & Bootstrap (P9–P10)",
    modules: [
      "lib/pilot/v80/intake/handoff-package.service.ts",
      "lib/pilot/v80/intake/bootstrap.service.ts",
      "lib/pilot/v80/intake/signoff.service.ts",
      "lib/pilot/v80/intake/freeze-lock.service.ts",
    ],
  },
  {
    id: "intelligence",
    title: "Intelligence & Knowledge (P11–P15)",
    modules: [
      "lib/pilot/v80/intake/analytics.service.ts",
      "lib/pilot/v80/intake/org-knowledge.service.ts",
      "lib/pilot/v80/intake/org-knowledge-governance.service.ts",
      "lib/pilot/v80/intake/knowledge-recommendation.service.ts",
      "lib/pilot/v80/intake/continuous-improvement.service.ts",
    ],
  },
  {
    id: "portfolio-decision",
    title: "Portfolio & Decision (P16–P18)",
    modules: [
      "lib/pilot/v80/intake/org-benchmark.service.ts",
      "lib/pilot/v80/intake/cross-project.service.ts",
      "lib/pilot/v80/intake/enterprise-decision.service.ts",
    ],
  },
  {
    id: "hardening-ga",
    title: "Hardening & GA Freeze (P19–P20)",
    modules: [
      "lib/pilot/v80/intake/production-hardening.service.ts",
      "lib/pilot/v80/intake/ga-release.service.ts",
      "scripts/verify-pilot-regression.ts",
      "docs/pilot/ga/",
    ],
  },
];

export const GA_ARTIFACT_PATHS = {
  architectureDoc: "docs/pilot/ga/ARCHITECTURE.md",
  apiIndexDoc: "docs/pilot/ga/API-INDEX.md",
  releaseNotesDoc: "docs/pilot/ga/RELEASE-NOTES.md",
  changelogDoc: "docs/pilot/ga/CHANGELOG.md",
  verificationSummaryDoc: "docs/pilot/ga/VERIFICATION-SUMMARY.md",
  manifestJson: "docs/pilot/ga/ga-manifest.json",
} as const;

function root(...parts: string[]): string {
  return path.join(process.cwd(), ...parts);
}

function stableHash(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

/** Deterministic GA fingerprint (excludes generatedAt). */
export function computeGaFingerprint(): string {
  return stableHash({
    version: PILOT_GA_VERSION,
    codename: PILOT_GA_CODENAME,
    releaseDate: PILOT_GA_RELEASE_DATE,
    pilots: GA_PILOTS.map((p) => ({ id: p.id, script: p.verifyScript, v: p.versionConstant ?? null })),
    versions: GA_VERSION_CONSTANTS,
    apis: GA_API_INDEX,
    ui: GA_UI_SURFACES,
    architecture: GA_ARCHITECTURE.map((a) => a.id),
    artifacts: GA_ARTIFACT_PATHS,
  });
}

export function buildGaVerificationSummary(): GaVerificationSummary {
  const regression = listRegressionSuiteCatalog();
  const p19Present = existsSync(root("scripts/verify-pilot-p19-harden.ts"));
  const regressionRunner = existsSync(root("scripts/verify-pilot-regression.ts"));
  const pilotsPresent = GA_PILOTS.filter((p) => existsSync(root(p.verifyScript))).length;
  const docsPresent = Object.values(GA_ARTIFACT_PATHS).filter((p) =>
    p.endsWith(".json") ? true : existsSync(root(p)),
  ).length;

  const notes: string[] = [];
  if (!regressionRunner) notes.push("缺少 scripts/verify-pilot-regression.ts");
  if (!p19Present) notes.push("缺少 P19 hardening verify 脚本");
  if (pilotsPresent < GA_PILOTS.length) {
    notes.push(`仅发现 ${pilotsPresent}/${GA_PILOTS.length} 个 Pilot verify 脚本`);
  }

  const certification =
    pilotsPresent === GA_PILOTS.length &&
    regression.every((e) => e.present) &&
    p19Present &&
    regressionRunner
      ? "certified"
      : "blocked";

  if (certification === "certified") {
    notes.push("P1–P19 校验脚本与回归套件齐备；可用于 GA 冻结认证");
  }

  return {
    pilotsCertified: pilotsPresent,
    verifyScriptsExpected: GA_PILOTS.length,
    verifyScriptsPresent: pilotsPresent,
    apiRoutesExpected: GA_API_INDEX.length,
    uiSurfacesExpected: GA_UI_SURFACES.length,
    hardeningVersion: PRODUCTION_HARDENING_VERSION,
    regressionSuite: "scripts/verify-pilot-regression.ts",
    certification,
    notes,
  };
}

/** Build frozen GA release manifest (metadata only). */
export function buildGaReleaseManifest(): GaReleaseManifest {
  const fingerprint = computeGaFingerprint();
  const verification = buildGaVerificationSummary();
  const generatedAt = new Date().toISOString();
  const contentHash = stableHash({
    fingerprint,
    verification,
    // exclude generatedAt from contentHash stability across clock — include certification only
    certification: verification.certification,
  });

  return {
    version: PILOT_GA_VERSION,
    codename: PILOT_GA_CODENAME,
    releaseDate: PILOT_GA_RELEASE_DATE,
    generatedAt,
    contentHash,
    fingerprint,
    scope: {
      reuseThrough: "P19",
      engine: "V80",
      noNewBusinessCapability: true,
      projectQuoteTenderModelsUnchanged: true,
    },
    pilots: GA_PILOTS,
    versionConstants: GA_VERSION_CONSTANTS,
    apiIndex: GA_API_INDEX,
    uiSurfaces: GA_UI_SURFACES,
    architecture: GA_ARCHITECTURE,
    artifacts: { ...GA_ARTIFACT_PATHS },
    verification,
  };
}

export function exportGaReleaseManifestJson(manifest: GaReleaseManifest): {
  fileName: string;
  body: string;
} {
  return {
    fileName: `pilot-ga-manifest-${manifest.version}.json`,
    body: JSON.stringify(manifest, null, 2),
  };
}

export function listGaArtifactPresence(): Array<{ path: string; present: boolean }> {
  return Object.values(GA_ARTIFACT_PATHS).map((p) => ({
    path: p,
    present: existsSync(root(p)),
  }));
}

export {
  type GaApiRouteEntry,
  type GaArchitectureLayer,
  type GaPilotEntry,
  type GaReleaseManifest,
  type GaUiSurfaceEntry,
  type GaVerificationSummary,
};
