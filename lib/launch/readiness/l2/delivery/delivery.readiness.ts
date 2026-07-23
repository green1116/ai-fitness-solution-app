/**
 * Launch L2 — Pilot customer flow readiness
 */

import { LAUNCH_L1_DEMO_FOUNDATION_ID } from "../../l1/demo/demo.constants";
import { listFeedbackEntries } from "../feedback/feedback.collector";
import { listFeedbackScores } from "../feedback/feedback.score";
import { listIntakeForms } from "../intake/intake.form";
import { LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE } from "../pilot/pilot.constants";
import { listPilots } from "../pilot/pilot.registry";
import { listPilotProjects } from "../project/project.tracker";
import { listDeliveryAcceptances } from "./delivery.acceptance";
import { listDeliveryCheckpoints } from "./delivery.checkpoint";
import type { L2ReadinessCheck, L2ReadinessResult } from "./delivery.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): L2ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateL2PilotReadiness(): L2ReadinessResult {
  const checks: L2ReadinessCheck[] = [];

  checks.push(
    check(
      "L2-BASE",
      "foundation",
      "L1 demo foundation baseline aligned",
      LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE === LAUNCH_L1_DEMO_FOUNDATION_ID,
      `base=${LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE}`,
    ),
  );

  const pilots = listPilots();
  checks.push(
    check(
      "L2-PIL",
      "pilot",
      "Pilots registered",
      pilots.length >= 1,
      `pilots=${pilots.length}`,
    ),
  );

  const intakes = listIntakeForms();
  checks.push(
    check(
      "L2-INT",
      "intake",
      "Intake forms present",
      intakes.length >= 1,
      `intakes=${intakes.length}`,
    ),
  );

  const projects = listPilotProjects();
  checks.push(
    check(
      "L2-PRJ",
      "project",
      "Pilot projects present",
      projects.length >= 1,
      `projects=${projects.length}`,
    ),
  );

  const feedback = listFeedbackEntries();
  checks.push(
    check(
      "L2-FBK",
      "feedback",
      "Feedback entries present",
      feedback.length >= 1,
      `feedback=${feedback.length}`,
    ),
  );

  const scores = listFeedbackScores();
  checks.push(
    check(
      "L2-SCR",
      "feedback",
      "Feedback scores present",
      scores.length >= 1,
      `scores=${scores.length}`,
    ),
  );

  const checkpoints = listDeliveryCheckpoints();
  checks.push(
    check(
      "L2-CHK",
      "delivery",
      "Delivery checkpoints present",
      checkpoints.length >= 1,
      `checkpoints=${checkpoints.length}`,
    ),
  );

  const acceptances = listDeliveryAcceptances();
  checks.push(
    check(
      "L2-ACC",
      "delivery",
      "Delivery acceptances present",
      acceptances.length >= 1,
      `acceptances=${acceptances.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `l2-pilot-customer-flow readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertL2PilotReadinessReady(
  result: L2ReadinessResult,
): asserts result is L2ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`l2 pilot customer flow not ready: ${result.summary}`);
  }
}
