/**
 * Launch L2 — Pilot Customer Flow Release Gate
 * BASE: enterprise-launch-l1-demo-foundation-v1
 * Isolated namespace — does not mutate E01–E12 or commercialization layers
 */

import { buildPlatformV1Manifest } from "../../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../../commercialization/p8/freeze/freeze.lock";
import {
  LAUNCH_L1_DEMO_FOUNDATION_ID,
  LAUNCH_L1_DEMO_FREEZE_VERSION,
} from "../../l1/demo/demo.constants";
import {
  ACCEPTANCE_VERDICTS,
  DELIVERY_CHECKPOINT_KINDS,
  FEEDBACK_CHANNELS,
  INTAKE_STATUSES,
  L2_MANAGER_STATUSES,
  L2_READINESS_VERDICTS,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION,
  LAUNCH_L2_PILOT_FREEZE_VERSION,
  PILOT_STATUSES,
  PROJECT_LIFECYCLE_STAGES,
} from "../pilot/pilot.constants";
import {
  assertL2PilotReadinessReady,
  clearL2PilotCustomerFlowLayer,
  createL2PilotCustomerFlowManager,
  getL2RegistryManifest,
} from "../pilot.manager";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const LAUNCH_L2_SIGNOFF_VERSION = "launch-l2-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearL2PilotCustomerFlowLayer();
}

export function checkLaunchL2ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "L2-CONSTANTS",
      "pilot",
      "L2 pilot customer flow version constants",
      LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID ===
        "enterprise-launch-l2-pilot-customer-flow-v1" &&
        LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION === "launch-l2-1" &&
        LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE === LAUNCH_L1_DEMO_FOUNDATION_ID &&
        LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE ===
          "enterprise-launch-l1-demo-foundation-v1" &&
        LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION ===
          "launch-l2-pilot-customer-flow-freeze-1" &&
        LAUNCH_L2_PILOT_FREEZE_VERSION ===
          "launch-l2-pilot-customer-flow-freeze-1" &&
        PILOT_STATUSES.length === 5 &&
        INTAKE_STATUSES.length === 5 &&
        PROJECT_LIFECYCLE_STAGES.length === 5 &&
        FEEDBACK_CHANNELS.length === 4 &&
        DELIVERY_CHECKPOINT_KINDS.length === 4 &&
        ACCEPTANCE_VERDICTS.length === 4 &&
        L2_READINESS_VERDICTS.length === 3 &&
        L2_MANAGER_STATUSES.length === 4,
      `id=${LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID} base=${LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "L2-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "L2-L1-BASE",
      "demo-foundation",
      "L1 demo foundation freeze preserved as BASE",
      LAUNCH_L1_DEMO_FOUNDATION_ID ===
        "enterprise-launch-l1-demo-foundation-v1" &&
        LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE === LAUNCH_L1_DEMO_FOUNDATION_ID &&
        LAUNCH_L1_DEMO_FREEZE_VERSION ===
          "launch-l1-demo-foundation-freeze-1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `l1=${LAUNCH_L1_DEMO_FOUNDATION_ID}`,
    ),
  );

  checks.push(
    check(
      "L2-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createL2PilotCustomerFlowManager({
      managerId: "launch-l2-gate",
    });
    mgr.initialize();
    mgr.start();

    const pilot = mgr.registerPilot({
      id: "l2.gate.pilot",
      name: "Acme Pilot",
      accountRef: "acme-fitness",
      owner: "csm.jordan",
    });
    mgr.updatePilotStatus({
      pilotId: pilot.id,
      status: "INTAKE",
    });

    const intake = mgr.createIntake({
      id: "l2.gate.intake",
      pilotId: pilot.id,
      contactName: "Alex Rivera",
      contactEmail: "alex@acme.fitness",
      goals: ["onboard coaches", "validate workouts"],
    });
    mgr.advanceIntake({
      formId: intake.id,
      status: "SUBMITTED",
    });
    mgr.advanceIntake({
      formId: intake.id,
      status: "REVIEWED",
    });
    mgr.advanceIntake({
      formId: intake.id,
      status: "APPROVED",
    });
    mgr.updatePilotStatus({
      pilotId: pilot.id,
      status: "ACTIVE",
    });

    const project = mgr.createProject({
      id: "l2.gate.project",
      pilotId: pilot.id,
      name: "Acme Pilot Delivery",
    });
    mgr.trackProgress({
      projectId: project.id,
      progress: 40,
    });
    mgr.advanceLifecycle({
      projectId: project.id,
      stage: "BUILD",
    });

    mgr.collectFeedback({
      id: "l2.gate.fbk1",
      pilotId: pilot.id,
      channel: "SURVEY",
      comment: "Smooth kickoff",
      rating: 9,
    });
    mgr.collectFeedback({
      id: "l2.gate.fbk2",
      pilotId: pilot.id,
      channel: "NPS",
      comment: "Would recommend",
      rating: 10,
    });
    const score = mgr.scoreFeedback({
      id: "l2.gate.score",
      pilotId: pilot.id,
    });

    mgr.recordCheckpoint({
      id: "l2.gate.chk",
      projectId: project.id,
      kind: "KICKOFF",
      completed: true,
    });
    const acceptance = mgr.acceptDelivery({
      id: "l2.gate.acc",
      projectId: project.id,
      verdict: "ACCEPTED",
      score: 92,
      notes: "Pilot accepted for expansion",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getL2RegistryManifest();

    const ok =
      score.averageRating >= 9 &&
      acceptance.verdict === "ACCEPTED" &&
      readiness.verdict === "READY" &&
      registry.foundationId === LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID &&
      registry.base === LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE &&
      registry.pilotCount >= 1 &&
      registry.intakeCount >= 1 &&
      registry.projectCount >= 1 &&
      registry.feedbackCount >= 2 &&
      registry.scoreCount >= 1 &&
      registry.checkpointCount >= 1 &&
      registry.acceptanceCount >= 1;

    try {
      assertL2PilotReadinessReady(readiness);
      checks.push(
        check(
          "L2-STACK",
          "pilot",
          "Pilot / intake / project / feedback / delivery / readiness",
          ok,
          `avg=${score.averageRating} acceptance=${acceptance.verdict} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "L2-STACK",
          "pilot",
          "Pilot / intake / project / feedback / delivery / readiness",
          false,
          error instanceof Error
            ? error.message
            : "l2 pilot customer flow not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "L2-STACK",
        "pilot",
        "Pilot / intake / project / feedback / delivery / readiness",
        false,
        error instanceof Error
          ? error.message
          : "l2 pilot customer flow probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `launch-l2-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertLaunchL2ReleaseGatePass(
  gate: ReleaseGateResult = checkLaunchL2ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Launch L2 release gate failed: ${gate.summary}`);
  }
}
