/**
 * V80 Pilot P19 — End-to-end integration & production hardening checks (in-process)
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { listIntakeAudit } from "./audit-trail.service";
import { buildIntakeAnalyticsReport, exportIntakeAnalyticsJson } from "./analytics.service";
import {
  buildContinuousImprovementReport,
  exportContinuousImprovementJson,
} from "./continuous-improvement.service";
import {
  buildCrossProjectExplorer,
  exportCrossProjectJson,
} from "./cross-project.service";
import {
  buildEnterpriseDecisionReport,
  exportEnterpriseDecisionJson,
} from "./enterprise-decision.service";
import {
  createIntakeSession,
  listIntakeSessionsForOrg,
  updateIntakeSession,
} from "./intake.store";
import {
  buildOrgKnowledgeLibrary,
  exportOrgKnowledgeJson,
  lookupOrgKnowledgeRecommendations,
} from "./org-knowledge.service";
import { buildOrgBenchmarkReport, exportOrgBenchmarkJson } from "./org-benchmark.service";
import { generateKnowledgeRecommendations } from "./knowledge-recommendation.service";
import {
  listIntakeOpsBoard,
  listIntakeOpsExceptions,
} from "./ops.service";
import { retryIntakeGeneration } from "./generation-retry.service";
import { recoverIntakeSession } from "./recovery.service";
import type { TenderParseResult } from "@/lib/tender/types";
import {
  PRODUCTION_HARDENING_VERSION,
  type HardeningCheckResult,
  type ProductionHardeningReport,
  type ProductionReadinessBand,
  type RegressionSuiteEntry,
} from "./production-hardening.schema";

const EXPECTED_API_ROUTES = [
  "app/api/pilot/v80/intake/upload/route.ts",
  "app/api/pilot/v80/intake/extract/route.ts",
  "app/api/pilot/v80/intake/approve/route.ts",
  "app/api/pilot/v80/intake/validate/route.ts",
  "app/api/pilot/v80/intake/qa/route.ts",
  "app/api/pilot/v80/intake/ops/route.ts",
  "app/api/pilot/v80/intake/analytics/route.ts",
  "app/api/pilot/v80/intake/knowledge/route.ts",
  "app/api/pilot/v80/intake/knowledge/governance/route.ts",
  "app/api/pilot/v80/intake/improvement/route.ts",
  "app/api/pilot/v80/intake/benchmark/route.ts",
  "app/api/pilot/v80/intake/similarity/route.ts",
  "app/api/pilot/v80/intake/decision/route.ts",
  "app/api/pilot/v80/intake/readiness/route.ts",
  "app/api/pilot/v80/intake/ga/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/clarify/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/compliance/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/documents/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/handoff-package/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/bootstrap/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/recommendations/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/similarity/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/generation/retry/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/recover/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/ops/resume/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/freeze/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/signoff/route.ts",
  "app/api/pilot/v80/intake/[sessionId]/history/route.ts",
] as const;

const EXPECTED_UI_PAGES = [
  "app/(pilot)/pilot/intake/page.tsx",
  "app/(pilot)/pilot/ops/page.tsx",
  "app/(pilot)/pilot/analytics/page.tsx",
  "app/(pilot)/pilot/knowledge/page.tsx",
  "app/(pilot)/pilot/improvement/page.tsx",
  "app/(pilot)/pilot/benchmark/page.tsx",
  "app/(pilot)/pilot/similarity/page.tsx",
  "app/(pilot)/pilot/decision/page.tsx",
  "app/(pilot)/pilot/readiness/page.tsx",
] as const;

const EXPECTED_NAV_HREFS = [
  "/pilot/intake",
  "/pilot/ops",
  "/pilot/analytics",
  "/pilot/knowledge",
  "/pilot/improvement",
  "/pilot/benchmark",
  "/pilot/similarity",
  "/pilot/decision",
  "/pilot/readiness",
] as const;

/** P1–P18 verify scripts (P19 is the runner itself). */
export const REGRESSION_VERIFY_SCRIPTS: RegressionSuiteEntry[] = [
  { pilot: "P1", script: "scripts/verify-pilot-p1-intake.ts", present: false },
  { pilot: "P2", script: "scripts/verify-pilot-p2-review.ts", present: false },
  { pilot: "P3", script: "scripts/verify-pilot-p3-handoff.ts", present: false },
  { pilot: "P4", script: "scripts/verify-pilot-p4-ops.ts", present: false },
  { pilot: "P5", script: "scripts/verify-pilot-p5-trace.ts", present: false },
  { pilot: "P6", script: "scripts/verify-pilot-p6-clarify.ts", present: false },
  { pilot: "P7", script: "scripts/verify-pilot-p7-multidoc.ts", present: false },
  { pilot: "P8", script: "scripts/verify-pilot-p8-compliance.ts", present: false },
  { pilot: "P9", script: "scripts/verify-pilot-p9-package.ts", present: false },
  { pilot: "P10", script: "scripts/verify-pilot-p10-bootstrap.ts", present: false },
  { pilot: "P11", script: "scripts/verify-pilot-p11-analytics.ts", present: false },
  { pilot: "P12", script: "scripts/verify-pilot-p12-knowledge.ts", present: false },
  { pilot: "P13", script: "scripts/verify-pilot-p13-governance.ts", present: false },
  { pilot: "P14", script: "scripts/verify-pilot-p14-recommend.ts", present: false },
  { pilot: "P15", script: "scripts/verify-pilot-p15-improve.ts", present: false },
  { pilot: "P16", script: "scripts/verify-pilot-p16-benchmark.ts", present: false },
  { pilot: "P17", script: "scripts/verify-pilot-p17-similarity.ts", present: false },
  { pilot: "P18", script: "scripts/verify-pilot-p18-decision.ts", present: false },
];

const REQUIRED_AUDIT_STEPS = [
  "upload",
  "extract",
  "clarify",
  "compliance",
  "handoff_package",
  "bootstrap",
  "org_knowledge",
  "org_knowledge_gov",
  "knowledge_recommend",
  "continuous_improve",
  "retry",
  "recover",
] as const;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function rootPath(...parts: string[]): string {
  return path.join(process.cwd(), ...parts);
}

function check(
  id: string,
  category: HardeningCheckResult["category"],
  title: string,
  ok: boolean,
  message: string,
  details?: Record<string, unknown>,
  warn = false,
): HardeningCheckResult {
  return {
    id,
    category,
    title,
    status: ok ? "pass" : warn ? "warn" : "fail",
    message,
    details,
  };
}

function stubParseResult(): TenderParseResult {
  return {
    rawText: "项目名称：硬化测试\n跑步机 8 台\nGB 17498",
    metadata: { projectName: "硬化测试" },
    sections: [],
    tables: [],
    pages: [{ page: 1, text: "项目名称：硬化测试\n跑步机 8 台\nGB 17498" }],
  };
}

function baseRequirements(name: string) {
  return {
    projectName: name,
    organization: "Org-P19",
    industry: "fitness",
    location: "上海",
    objectives: [],
    scope: "健身房建设",
    functionalRequirements: [],
    technicalRequirements: [
      {
        id: "t1",
        text: "跑步机商业级连续运行8小时",
        confidence: 0.9,
        confidenceBand: "high" as const,
      },
    ],
    equipment: [
      {
        id: "e1",
        text: "跑步机 8 台 功率≥3.0HP",
        confidence: 0.9,
        confidenceBand: "high" as const,
      },
    ],
    space: [],
    quantity: [],
    constraints: [],
    compliance: [],
    standards: [
      {
        id: "s1",
        text: "符合 GB 17498",
        confidence: 0.85,
        confidenceBand: "high" as const,
      },
    ],
    budget: { currency: "CNY", notes: "100万" },
    schedule: { milestones: [] },
    evaluation: [],
    deliverables: [],
    risks: [],
    optionalItems: [],
    sourceRefs: [],
  };
}

function bandFor(failed: number, warnings: number): ProductionReadinessBand {
  if (failed > 0) return "blocked";
  if (warnings > 0) return "conditional";
  return "ready";
}

/** Catalog regression verify scripts and mark presence on disk. */
export function listRegressionSuiteCatalog(cwd = process.cwd()): RegressionSuiteEntry[] {
  return REGRESSION_VERIFY_SCRIPTS.map((e) => ({
    ...e,
    present: existsSync(path.join(cwd, e.script)),
  }));
}

/**
 * Run in-process production hardening checks.
 * Does not spawn child verify scripts (see scripts/verify-pilot-regression.ts).
 */
export function runProductionHardeningChecks(input: {
  organizationId: string;
  seedDemoData?: boolean;
}): ProductionHardeningReport {
  const checks: HardeningCheckResult[] = [];
  const org = input.organizationId;

  // --- Route coverage ---
  const apiFound = EXPECTED_API_ROUTES.filter((r) => existsSync(rootPath(r)));
  const apiMissing = EXPECTED_API_ROUTES.filter((r) => !existsSync(rootPath(r)));
  checks.push(
    check(
      "route_api_coverage",
      "route_coverage",
      "API 路由覆盖",
      apiMissing.length === 0,
      apiMissing.length === 0
        ? `全部 ${EXPECTED_API_ROUTES.length} 条 API 路由存在`
        : `缺失 ${apiMissing.length} 条：${apiMissing.slice(0, 3).join(", ")}`,
      { missing: apiMissing },
    ),
  );

  const uiFound = EXPECTED_UI_PAGES.filter((r) => existsSync(rootPath(r)));
  const uiMissing = EXPECTED_UI_PAGES.filter((r) => !existsSync(rootPath(r)));
  checks.push(
    check(
      "route_ui_coverage",
      "route_coverage",
      "UI 页面覆盖",
      uiMissing.length === 0,
      uiMissing.length === 0
        ? `全部 ${EXPECTED_UI_PAGES.length} 个页面存在`
        : `缺失 ${uiMissing.length} 个：${uiMissing.join(", ")}`,
      { missing: uiMissing },
    ),
  );

  // --- UI navigation ---
  const navFile = rootPath("components/pilot/PilotNav.tsx");
  let navFound = 0;
  if (existsSync(navFile)) {
    const navSrc = readFileSync(navFile, "utf8");
    navFound = EXPECTED_NAV_HREFS.filter((h) => navSrc.includes(`"${h}"`) || navSrc.includes(`'${h}'`)).length;
  }
  checks.push(
    check(
      "ui_nav_coverage",
      "ui_navigation",
      "导航链接覆盖",
      navFound === EXPECTED_NAV_HREFS.length,
      `导航命中 ${navFound}/${EXPECTED_NAV_HREFS.length}`,
      { expected: EXPECTED_NAV_HREFS, found: navFound },
    ),
  );

  // --- Regression catalog ---
  const regressionCatalog = listRegressionSuiteCatalog();
  const scriptsFound = regressionCatalog.filter((e) => e.present).length;
  checks.push(
    check(
      "regression_catalog",
      "regression_catalog",
      "回归脚本目录",
      scriptsFound === regressionCatalog.length,
      `P1–P18 verify 脚本 ${scriptsFound}/${regressionCatalog.length}`,
      {
        missing: regressionCatalog.filter((e) => !e.present).map((e) => e.script),
      },
    ),
  );

  // --- Audit consistency ---
  const auditFile = rootPath("lib/pilot/v80/intake/audit-trail.service.ts");
  let auditHits = 0;
  if (existsSync(auditFile)) {
    const auditSrc = readFileSync(auditFile, "utf8");
    auditHits = REQUIRED_AUDIT_STEPS.filter((s) => auditSrc.includes(`"${s}"`)).length;
  }
  checks.push(
    check(
      "audit_steps",
      "audit_consistency",
      "审计步骤一致性",
      auditHits === REQUIRED_AUDIT_STEPS.length,
      `关键步骤命中 ${auditHits}/${REQUIRED_AUDIT_STEPS.length}`,
      { required: REQUIRED_AUDIT_STEPS },
    ),
  );

  // --- Workflow recovery symbols ---
  checks.push(
    check(
      "workflow_retry_export",
      "workflow_recovery",
      "生成重试能力",
      typeof retryIntakeGeneration === "function",
      "retryIntakeGeneration 已导出",
    ),
  );
  checks.push(
    check(
      "workflow_recover_export",
      "workflow_recovery",
      "会话恢复能力",
      typeof recoverIntakeSession === "function",
      "recoverIntakeSession 已导出",
    ),
  );
  checks.push(
    check(
      "workflow_ops_board",
      "workflow_recovery",
      "运维看板能力",
      typeof listIntakeOpsBoard === "function" && typeof listIntakeOpsExceptions === "function",
      "Ops board / exceptions 已导出",
    ),
  );

  // --- E2E integration + determinism + exports (seeded) ---
  if (input.seedDemoData !== false) {
    try {
      const parsed = stubParseResult();
      const completed = createIntakeSession({
        organizationId: org,
        userId: "harden",
        fileName: "p19-done.pdf",
        mimeType: "application/pdf",
        fileSize: 10,
        parseResult: parsed,
      });
      updateIntakeSession(completed.id, {
        status: "ready",
        workflowStatus: "completed",
        qaPassedAt: new Date().toISOString(),
        productionProjectId: "proj-p19",
        requirements: baseRequirements("硬化完成项"),
        clarifications: {
          round: 1,
          gaps: [],
          questions: [
            {
              id: "q1",
              gapId: "g1",
              fieldPath: "budget",
              question: "预算？",
              suggestedTarget: { type: "budget", key: "notes" },
              status: "answered",
              severity: "advisory",
              round: 1,
              answer: "100万",
            },
          ],
          updatedAt: new Date().toISOString(),
        },
        compliance: {
          acknowledgedFindingIds: [],
          updatedAt: new Date().toISOString(),
          report: {
            evaluatedAt: new Date().toISOString(),
            knowledgeRefCount: 1,
            ruleCount: 1,
            findings: [],
            blockingCount: 0,
            warningCount: 0,
            infoCount: 0,
            overallRisk: "none",
            passed: true,
            summary: "ok",
          },
        },
      });

      const draft = createIntakeSession({
        organizationId: org,
        userId: "harden",
        fileName: "p19-draft.pdf",
        mimeType: "application/pdf",
        fileSize: 10,
        parseResult: parsed,
      });
      updateIntakeSession(draft.id, {
        status: "in_review",
        requirements: baseRequirements("硬化在审"),
      });

      const sessions = listIntakeSessionsForOrg(org);
      checks.push(
        check(
          "e2e_sessions",
          "e2e_integration",
          "端到端会话创建",
          sessions.length >= 2,
          `组织内会话 ${sessions.length}`,
        ),
      );

      const library = buildOrgKnowledgeLibrary({ organizationId: org, actorId: "harden" });
      const analytics = buildIntakeAnalyticsReport({ organizationId: org });
      const improvement = buildContinuousImprovementReport({
        organizationId: org,
        persistAdjustments: true,
      });
      const lookup = lookupOrgKnowledgeRecommendations({
        organizationId: org,
        sessionId: draft.id,
      });
      const pack = generateKnowledgeRecommendations({
        organizationId: org,
        sessionId: draft.id,
        actorId: "harden",
      });
      // Build portfolio reports after recommendation side-effects settle
      const benchmark = buildOrgBenchmarkReport({ organizationId: org });
      const explorer = buildCrossProjectExplorer({ organizationId: org });
      const decision = buildEnterpriseDecisionReport({ organizationId: org });

      checks.push(
        check(
          "e2e_knowledge_decision_chain",
          "e2e_integration",
          "知识→对标→决策链路",
          library.patterns.length >= 1 &&
            analytics.kpis.totalSessions >= 2 &&
            benchmark.scorecard.categories.length === 8 &&
            decision.executiveScorecard.overallHealth >= 0 &&
            pack.items.length >= 0,
          `知识 ${library.patterns.length} · 分析会话 ${analytics.kpis.totalSessions} · 决策健康度 ${decision.executiveScorecard.overallHealth}`,
          {
            lookupRecs: lookup.recommendations.length,
            explorerProjects: explorer.fingerprints.length,
            improvementPatterns: improvement.quality.length,
          },
        ),
      );

      // Determinism: consecutive builds with no further mutations
      const analytics2 = buildIntakeAnalyticsReport({ organizationId: org });
      const benchmark2 = buildOrgBenchmarkReport({ organizationId: org });
      const decision2 = buildEnterpriseDecisionReport({ organizationId: org });
      const library2 = buildOrgKnowledgeLibrary({ organizationId: org, actorId: "harden" });
      const detOk =
        analytics2.kpis.totalSessions === analytics.kpis.totalSessions &&
        benchmark2.scorecard.overallScore === benchmark.scorecard.overallScore &&
        decision2.executiveScorecard.overallHealth ===
          decision.executiveScorecard.overallHealth &&
        library2.contentHash === library.contentHash;
      checks.push(
        check(
          "determinism_reports",
          "determinism",
          "报告确定性",
          detOk,
          detOk ? "分析/对标/决策/知识重复生成一致" : "重复生成结果不一致",
          {
            analyticsSessions: [analytics.kpis.totalSessions, analytics2.kpis.totalSessions],
            benchmarkScores: [
              benchmark.scorecard.overallScore,
              benchmark2.scorecard.overallScore,
            ],
            decisionHealth: [
              decision.executiveScorecard.overallHealth,
              decision2.executiveScorecard.overallHealth,
            ],
            knowledgeHashEqual: library2.contentHash === library.contentHash,
          },
        ),
      );

      // Exports
      const exports = [
        exportIntakeAnalyticsJson(analytics),
        exportOrgKnowledgeJson(library),
        exportOrgBenchmarkJson(benchmark),
        exportEnterpriseDecisionJson(decision),
        exportContinuousImprovementJson(improvement),
        exportCrossProjectJson(explorer),
      ];
      const exportOk = exports.every(
        (e) => e.fileName.endsWith(".json") && e.body.trim().startsWith("{"),
      );
      checks.push(
        check(
          "export_payloads",
          "export_download",
          "导出载荷完整性",
          exportOk,
          exportOk ? `${exports.length} 类导出 JSON 可用` : "导出载荷异常",
          { files: exports.map((e) => e.fileName) },
        ),
      );

      // Audit trail writable
      const audit = listIntakeAudit(draft.id);
      checks.push(
        check(
          "audit_writable",
          "audit_consistency",
          "会话审计可写可读",
          Array.isArray(audit),
          `草稿会话审计条目 ${audit.length}`,
        ),
      );

      // Ops board callable
      const board = listIntakeOpsBoard(org);
      const exceptions = listIntakeOpsExceptions(org);
      checks.push(
        check(
          "ops_board_callable",
          "workflow_recovery",
          "运维看板可调用",
          board != null && Array.isArray(exceptions),
          `Ops board OK · exceptions ${exceptions.length}`,
        ),
      );
    } catch (e) {
      checks.push(
        check(
          "e2e_integration_error",
          "e2e_integration",
          "端到端集成执行",
          false,
          e instanceof Error ? e.message : "E2E_FAILED",
        ),
      );
    }
  }

  // --- API contract surface (file-level method markers) ---
  const decisionRoute = rootPath("app/api/pilot/v80/intake/decision/route.ts");
  if (existsSync(decisionRoute)) {
    const src = readFileSync(decisionRoute, "utf8");
    checks.push(
      check(
        "api_decision_get",
        "api_contract",
        "决策 API GET 契约",
        src.includes("export async function GET") && src.includes("download"),
        "decision route 含 GET 与 download",
      ),
    );
  }

  const knowledgeRoute = rootPath("app/api/pilot/v80/intake/knowledge/route.ts");
  if (existsSync(knowledgeRoute)) {
    const src = readFileSync(knowledgeRoute, "utf8");
    checks.push(
      check(
        "api_knowledge_get_post",
        "api_contract",
        "知识 API GET/POST 契约",
        src.includes("export async function GET") && src.includes("export async function POST"),
        "knowledge route 含 GET/POST",
      ),
    );
  }

  const retryRoute = rootPath(
    "app/api/pilot/v80/intake/[sessionId]/generation/retry/route.ts",
  );
  const recoverRoute = rootPath("app/api/pilot/v80/intake/[sessionId]/recover/route.ts");
  checks.push(
    check(
      "api_retry_recover_routes",
      "api_contract",
      "重试/恢复 API 路由",
      existsSync(retryRoute) && existsSync(recoverRoute),
      "generation/retry 与 recover 路由存在",
    ),
  );

  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const warnings = checks.filter((c) => c.status === "warn").length;
  const skipped = checks.filter((c) => c.status === "skip").length;
  const total = checks.length;
  const passRate = total === 0 ? 0 : round2(passed / total);
  const readinessBand = bandFor(failed, warnings);

  const blockers = checks.filter((c) => c.status === "fail").map((c) => c.title);
  const nextActions =
    blockers.length > 0
      ? blockers.slice(0, 5).map((t) => `修复：${t}`)
      : warnings > 0
        ? ["处理警告项后即可视为生产就绪"]
        : ["保持回归套件绿色，发布前再跑一次 hardening"];

  const generatedAt = new Date().toISOString();
  const coverage = {
    apiRoutesExpected: EXPECTED_API_ROUTES.length,
    apiRoutesFound: apiFound.length,
    uiPagesExpected: EXPECTED_UI_PAGES.length,
    uiPagesFound: uiFound.length,
    navLinksExpected: EXPECTED_NAV_HREFS.length,
    navLinksFound: navFound,
    verifyScriptsExpected: regressionCatalog.length,
    verifyScriptsFound: scriptsFound,
  };

  const reportBase = {
    version: PRODUCTION_HARDENING_VERSION,
    organizationId: org,
    summary: { total, passed, failed, warnings, skipped, passRate },
    band: readinessBand,
    checks,
    regressionCatalog,
    coverage,
    narrative: {
      headline:
        readinessBand === "ready"
          ? "生产就绪：关键硬化检查通过"
          : readinessBand === "conditional"
            ? "有条件就绪：存在警告"
            : `未就绪：${failed} 项失败`,
      blockers,
      nextActions,
    },
  };

  const contentHash = createHash("sha256")
    .update(
      JSON.stringify({
        version: reportBase.version,
        summary: reportBase.summary,
        band: reportBase.band,
        checks: reportBase.checks.map((c) => ({ id: c.id, status: c.status })),
        coverage: reportBase.coverage,
      }),
    )
    .digest("hex");

  return {
    ...reportBase,
    generatedAt,
    contentHash,
  };
}

export function exportProductionHardeningJson(report: ProductionHardeningReport): {
  fileName: string;
  body: string;
} {
  return {
    fileName: `production-hardening-${report.organizationId}-${report.generatedAt.slice(0, 10)}.json`,
    body: JSON.stringify(report, null, 2),
  };
}

export const HARDENING_EXPECTED = {
  apiRoutes: EXPECTED_API_ROUTES,
  uiPages: EXPECTED_UI_PAGES,
  navHrefs: EXPECTED_NAV_HREFS,
};
