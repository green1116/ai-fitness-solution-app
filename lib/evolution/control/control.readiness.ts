/**
 * Evolution P7 — Evolution Control Plane Readiness
 */

import { EVOLUTION_MARKETPLACE_ECOSYSTEM_ID } from "../marketplace/marketplace.constants";
import { EVOLUTION_CONTROL_PLANE_BASE } from "./control.constants";
import { listIntelligenceCommandCenters } from "./control.command";
import { listEvolutionDecisions } from "./control.decision";
import { listAutonomousImprovementLoops } from "./control.loop";
import { listEvolutionMetrics } from "./control.metrics";
import { getEvolutionOrchestration } from "./control.orchestration";
import type {
  EvoControlReadinessCheck,
  EvoControlReadinessResult,
} from "./control.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): EvoControlReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateEvoControlReadiness(
  orchestrationId: string,
): EvoControlReadinessResult {
  const orchestration = getEvolutionOrchestration(orchestrationId.trim());
  if (!orchestration) {
    return {
      orchestrationId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "ECP-ORCH",
          "orchestration",
          "Evolution orchestration exists",
          false,
          `orchestration not found: ${orchestrationId}`,
        ),
      ],
      summary: "evolution control readiness not ready: orchestration missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: EvoControlReadinessCheck[] = [];

  checks.push(
    check(
      "ECP-BASE",
      "evolution",
      "P6 marketplace ecosystem baseline aligned",
      EVOLUTION_CONTROL_PLANE_BASE === EVOLUTION_MARKETPLACE_ECOSYSTEM_ID,
      `base=${EVOLUTION_CONTROL_PLANE_BASE}`,
    ),
  );

  checks.push(
    check(
      "ECP-ACTIVE",
      "orchestration",
      "Evolution orchestration active",
      orchestration.status === "ACTIVE",
      `status=${orchestration.status}`,
    ),
  );

  const present = orchestration.domains.filter((d) => d.present);
  checks.push(
    check(
      "ECP-DOMAINS",
      "orchestration",
      "Cross-layer domains bound",
      present.length >= 6,
      `domains=${present.length}/6`,
    ),
  );

  for (const domain of orchestration.domains) {
    checks.push(
      check(
        `ECP-${domain.domain}`,
        domain.domain.toLowerCase(),
        `${domain.label} bound`,
        domain.present && domain.score >= 40,
        domain.present
          ? `ref=${domain.refId} score=${domain.score}`
          : "domain unbound",
      ),
    );
  }

  const commands = listIntelligenceCommandCenters({
    orchestrationId: orchestration.id,
  });
  checks.push(
    check(
      "ECP-COMMAND",
      "command",
      "Intelligence command center present",
      commands.length >= 1,
      `centers=${commands.length}`,
    ),
  );

  const loops = listAutonomousImprovementLoops({
    orchestrationId: orchestration.id,
  });
  checks.push(
    check(
      "ECP-LOOP",
      "loop",
      "Autonomous improvement loop present",
      loops.length >= 1,
      `loops=${loops.length}`,
    ),
  );

  const decisions = listEvolutionDecisions({
    orchestrationId: orchestration.id,
  });
  checks.push(
    check(
      "ECP-DECISION",
      "decision",
      "Cross-layer decision present",
      decisions.length >= 1,
      `decisions=${decisions.length}`,
    ),
  );

  const metrics = listEvolutionMetrics({
    orchestrationId: orchestration.id,
  });
  checks.push(
    check(
      "ECP-METRICS",
      "metrics",
      "Evolution metrics present",
      metrics.length >= 1,
      `metrics=${metrics.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    orchestrationId: orchestration.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: `evolution control readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertEvoControlReadinessReady(
  result: EvoControlReadinessResult,
): asserts result is EvoControlReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`evolution control plane not ready: ${result.summary}`);
  }
}
