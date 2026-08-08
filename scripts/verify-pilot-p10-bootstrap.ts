/**
 * Pilot P10 — Project Bootstrap & Execution Seed verification
 */
import {
  PROJECT_BOOTSTRAP_VERSION,
  buildProjectBootstrapPackage,
  clearIntakeStoreForTests,
  createIntakeSession,
  listIntakeAudit,
  runTenderParserPipeline,
  seedProjectBootstrap,
  updateIntakeSession,
} from "../lib/pilot/v80";

const SAMPLE = `
项目名称：星河科技园企业健身中心
招标人：星河科技园管理有限公司
建设地点：上海
`.trim();

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  console.log("=== Pilot P10 / Project Bootstrap & Execution Seed ===\n");
  clearIntakeStoreForTests();

  const parsed = await runTenderParserPipeline({
    rawText: SAMPLE,
    fileName: "p10.txt",
  });

  const session = createIntakeSession({
    organizationId: "org-p10",
    userId: "user-p10",
    fileName: "p10.pdf",
    mimeType: "application/pdf",
    fileSize: SAMPLE.length,
    parseResult: parsed,
  });

  const requirements = {
    projectName: "星河科技园企业健身中心",
    organization: "星河科技园管理有限公司",
    industry: "fitness",
    location: "上海",
    objectives: ["建设健身房"],
    scope: "设备与空间",
    functionalRequirements: [],
    technicalRequirements: [
      {
        id: "t1",
        text: "跑步机不少于 8 台",
        priority: "must" as const,
        reviewStatus: "confirmed" as const,
      },
    ],
    equipment: [
      {
        id: "e1",
        text: "力量器械一套",
        priority: "must" as const,
        reviewStatus: "confirmed" as const,
      },
    ],
    space: [],
    quantity: [],
    constraints: [],
    compliance: [],
    standards: [
      {
        id: "st1",
        text: "GB/T 22517",
        priority: "must" as const,
        reviewStatus: "confirmed" as const,
      },
    ],
    budget: { currency: "CNY", min: 100000, max: 500000, notes: "" },
    schedule: { deadline: "2026-12-31", milestones: ["开工"] },
    evaluation: [],
    deliverables: [],
    risks: ["工期风险"],
    optionalItems: [],
    sourceRefs: [],
  };

  updateIntakeSession(session.id, {
    status: "generating",
    requirements,
    extractedRequirements: requirements,
    requirementsRevision: 2,
    qaPassedAt: new Date().toISOString(),
    productionProjectId: "proj-p10",
    productionQuoteId: "quote-p10",
    productionTenderId: "tender-p10",
    v80WorkflowJobId: "job-p10",
    handoff: {
      packageId: "handoff_test",
      builtAt: new Date().toISOString(),
      contentHash: "a".repeat(64),
      lastAudience: "internal",
      package: {
        version: "v80-pilot-p9-handoff-1",
        packageId: "handoff_test",
        audience: "internal",
        builtAt: new Date().toISOString(),
        organizationId: "org-p10",
        sessionId: session.id,
        tenderIntakeId: session.tenderIntakeId,
        fileName: "p10.pdf",
        revision: 2,
        approval: {
          sessionStatus: "generating",
          qaPassed: true,
          compliancePassed: true,
          clarificationsBlockingOpen: 0,
          frozen: false,
          signedOff: false,
          readyForV80: true,
        },
        requirementSummary: {
          projectName: requirements.projectName,
          organization: requirements.organization,
          location: requirements.location,
          industry: "fitness",
          scope: requirements.scope,
          mustCount: 2,
          confirmedMustCount: 2,
          lowConfidenceCount: 0,
          withEvidenceCount: 0,
          itemCount: 3,
        },
        requirements,
        documents: [],
        traceability: {
          sessionId: session.id,
          tenderIntakeId: session.tenderIntakeId,
          packageId: "handoff_test",
          contentHash: "a".repeat(64),
          documents: [],
          auditSteps: [],
          linkage: {
            productionProjectId: "proj-p10",
            productionQuoteId: "quote-p10",
            productionTenderId: "tender-p10",
          },
          evidenceSample: [],
        },
        customerBrief: {
          title: requirements.projectName,
          headline: "摘要",
          bullets: [],
          openQuestions: [],
        },
        internalNotes: { blockers: [], warnings: [], nextActions: [] },
      },
    },
  });

  let threw = false;
  try {
    buildProjectBootstrapPackage({
      session: updateIntakeSession(session.id, {
        productionProjectId: undefined as unknown as string,
      })!,
    });
  } catch (err) {
    // restore project id
    updateIntakeSession(session.id, { productionProjectId: "proj-p10" });
    threw = err instanceof Error && err.message === "PROJECT_NOT_CREATED";
  }
  // Ensure project id restored even if assert path weird
  updateIntakeSession(session.id, { productionProjectId: "proj-p10" });
  assert(threw, "requires project");

  const pkg = buildProjectBootstrapPackage({
    session: updateIntakeSession(session.id, {})!,
    actorEmail: "pm@test.local",
  });
  assert(pkg.version === PROJECT_BOOTSTRAP_VERSION, "version");
  assert(pkg.projectId === "proj-p10", "project id");
  assert(pkg.milestones.length >= 5, "milestones seeded");
  assert(pkg.tasks.length >= 3, "tasks seeded");
  assert(pkg.owners.some((o) => o.role === "project_manager"), "pm owner");
  assert(pkg.owners.some((o) => o.role === "technical_lead"), "tech owner");
  assert(pkg.handoffPackageId, "handoff link");
  assert(pkg.v80WorkflowJobId === "job-p10", "workflow link");
  assert(pkg.kickoff.bullets.length >= 2, "kickoff summary");
  assert(pkg.contentHash.length === 64, "hash");
  console.log("PASS Bootstrap schema + seed builder + owners/milestones/tasks");

  const first = await seedProjectBootstrap({
    sessionId: session.id,
    organizationId: "org-p10",
    actorId: "user-p10",
    actorEmail: "pm@test.local",
    persistProduction: false,
  });
  assert(!first.idempotent, "first seed");
  assert(first.bootstrap.bootstrapId === first.package.bootstrapId, "persisted");

  const second = await seedProjectBootstrap({
    sessionId: session.id,
    organizationId: "org-p10",
    actorId: "user-p10",
    actorEmail: "pm@test.local",
    persistProduction: false,
  });
  assert(second.idempotent, "idempotent reseed");
  assert(second.package.contentHash === first.package.contentHash, "same hash");
  console.log("PASS Idempotent seeding");

  const audits = listIntakeAudit(session.id).filter((e) => e.step === "bootstrap");
  assert(audits.length >= 1, "bootstrap audited");
  console.log("PASS Traceability + audit");

  console.log("\n=== ALL P10 CHECKS PASSED ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
