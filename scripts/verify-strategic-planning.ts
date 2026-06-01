/**
 * Phase XII Strategic Planning Runtime — verification
 */
import {
  STRATEGIC_PLANNING_RUNTIME_VERSION,
  buildDefaultStrategicObjectives,
  buildPlanningHorizons,
  buildDefaultStrategicInitiatives,
  buildRoadmapSnapshot,
  buildAlignmentAssessment,
  computeAlignmentScore,
  buildStrategicSummary,
  runStrategicPlanning,
} from "../lib/strategy";

const DEPLOYMENT_ID = "phase-xii-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testObjectivesAndHorizons() {
  const objectives = buildDefaultStrategicObjectives();
  assert(objectives.length >= 4, "objectives count");
  for (const obj of objectives) {
    assert(obj.id.length > 0, "objective id");
    assert(obj.name.length > 0, "objective name");
    assert(["low", "medium", "high"].includes(obj.priority), "objective priority");
  }

  const horizons = buildPlanningHorizons();
  assert(horizons.length === 3, "horizons count");
  const kinds = horizons.map((h) => h.kind);
  assert(kinds.includes("short-term"), "short-term horizon");
  assert(kinds.includes("mid-term"), "mid-term horizon");
  assert(kinds.includes("long-term"), "long-term horizon");

  console.log("✓ objectives & planning horizons");
  console.log(" ", `objectives=${objectives.length} horizons=${horizons.length}`);
}

function testInitiatives() {
  const initiatives = buildDefaultStrategicInitiatives();
  assert(initiatives.length >= 4, "initiatives count");
  for (const init of initiatives) {
    assert(init.id.length > 0, "initiative id");
    assert(init.objectiveId.length > 0, "initiative objectiveId");
    assert(["planned", "active", "completed"].includes(init.status), "initiative status");
  }

  console.log("✓ strategic initiatives");
  console.log(" ", `initiatives=${initiatives.length}`);
}

function testRoadmapAndAlignment() {
  const objectives = buildDefaultStrategicObjectives();
  const initiatives = buildDefaultStrategicInitiatives();
  const roadmap = buildRoadmapSnapshot({ deploymentId: DEPLOYMENT_ID, objectives, initiatives });
  assert(roadmap.snapshotId.length > 0, "roadmap snapshot id");
  assert(roadmap.roadmapScore >= 0 && roadmap.roadmapScore <= 100, "roadmap score bounded");
  assert(roadmap.objectives.length === objectives.length, "roadmap objectives");
  assert(roadmap.initiatives.length === initiatives.length, "roadmap initiatives");

  const alignment = buildAlignmentAssessment({ deploymentId: DEPLOYMENT_ID, roadmap });
  assert(alignment.assessmentId.length > 0, "alignment id");
  assert(alignment.runtimeAlignment >= 0, "runtime alignment");
  assert(alignment.governanceAlignment >= 0, "governance alignment");
  assert(alignment.trustAlignment >= 0, "trust alignment");
  assert(alignment.executiveAlignment >= 0, "executive alignment");
  const alignmentScore = computeAlignmentScore(alignment);
  assert(alignmentScore >= 0 && alignmentScore <= 100, "alignment score bounded");

  console.log("✓ roadmap & alignment");
  console.log(" ", `roadmapScore=${roadmap.roadmapScore} alignmentScore=${alignmentScore}`);
}

function testStrategicSummaryAndRuntime() {
  const objectives = buildDefaultStrategicObjectives();
  const initiatives = buildDefaultStrategicInitiatives();
  const horizons = buildPlanningHorizons();
  const roadmap = buildRoadmapSnapshot({ deploymentId: DEPLOYMENT_ID, objectives, initiatives });
  const alignment = buildAlignmentAssessment({ deploymentId: DEPLOYMENT_ID, roadmap });
  const summary = buildStrategicSummary({ deploymentId: DEPLOYMENT_ID, horizons, roadmap, alignment });

  assert(summary.strategyScore >= 0, "strategy score");
  assert(summary.alignmentScore >= 0, "summary alignment score");
  assert(summary.planningScore >= 0, "planning score");

  const report = runStrategicPlanning({ deploymentId: DEPLOYMENT_ID });
  assert(report.version === STRATEGIC_PLANNING_RUNTIME_VERSION, "version");
  assert(report.reportId.length > 0, "report id");
  assert(report.strategyScore === summary.strategyScore, "report strategy score");
  assert(report.alignmentScore === summary.alignmentScore, "report alignment score");
  assert(report.planningScore === summary.planningScore, "report planning score");
  assert(report.runtimeSummary.length > 0, "runtime summary");

  console.log("✓ strategic summary & planning runtime");
  console.log(" ", report.runtimeSummary);
  console.log("");
  console.log("Strategic Planning Runtime Ready");
  console.log(` strategy score: ${report.strategyScore}`);
  console.log(` alignment score: ${report.alignmentScore}`);
  console.log(` planning score: ${report.planningScore}`);
  console.log("");
  console.log("STRATEGIC PLANNING VERIFY PASS");
}

function main() {
  testObjectivesAndHorizons();
  testInitiatives();
  testRoadmapAndAlignment();
  testStrategicSummaryAndRuntime();
}

main();
