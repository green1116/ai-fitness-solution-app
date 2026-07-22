/**
 * Evolution P7 — Intelligence Command Center
 */

import { EVO_COMMAND_MODES } from "./control.constants";
import { getEvolutionOrchestration } from "./control.orchestration";
import type {
  BuildCommandCenterInput,
  EvoCommandMode,
  EvoOrchestrationDomain,
  IntelligenceCommandCenter,
} from "./control.types";

const centers = new Map<string, IntelligenceCommandCenter>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCenter(
  center: IntelligenceCommandCenter,
): IntelligenceCommandCenter {
  return {
    ...center,
    focusDomains: [...center.focusDomains],
    alerts: [...center.alerts],
  };
}

export function buildIntelligenceCommandCenter(
  input: BuildCommandCenterInput,
): IntelligenceCommandCenter {
  const orchestration = getEvolutionOrchestration(
    input.orchestrationId.trim(),
  );
  if (!orchestration) {
    throw new Error(
      `evolution orchestration not found: ${input.orchestrationId}`,
    );
  }

  const present = orchestration.domains.filter((d) => d.present);
  const avgScore =
    present.length === 0
      ? 0
      : Math.round(
          present.reduce((sum, d) => sum + d.score, 0) / present.length,
        );

  const weak = present
    .filter((d) => d.score < 55)
    .sort((a, b) => a.score - b.score);

  let mode: EvoCommandMode = "STEADY";
  if (avgScore >= 75 && weak.length === 0) mode = "IMPROVE";
  else if (avgScore < 40 || weak.length >= 2) mode = "LOCKDOWN";
  else if (weak.length >= 1) mode = "MONITOR";

  if (!(EVO_COMMAND_MODES as readonly string[]).includes(mode)) {
    throw new Error(`invalid command mode: ${mode}`);
  }

  const focusDomains: EvoOrchestrationDomain[] =
    weak.length > 0
      ? weak.slice(0, 3).map((d) => d.domain)
      : present.slice(0, 3).map((d) => d.domain);

  const alerts: string[] = [];
  for (const domain of weak) {
    alerts.push(`${domain.domain.toLowerCase()}-pressure=${domain.score}`);
  }
  if (orchestration.status !== "ACTIVE") {
    alerts.push(`orchestration-${orchestration.status.toLowerCase()}`);
  }
  if (alerts.length === 0) alerts.push("command-center-nominal");

  const commandScore = Math.round(
    Math.max(15, Math.min(98, avgScore * 0.85 + present.length * 2)),
  );

  const id = input.id?.trim() || createId("evocmd");
  if (centers.has(id)) {
    throw new Error(`intelligence command center already exists: ${id}`);
  }

  const center: IntelligenceCommandCenter = {
    id,
    orchestrationId: orchestration.id,
    mode,
    focusDomains,
    alerts,
    commandScore,
    detail: `mode=${mode} score=${commandScore} focus=${focusDomains.length}`,
    builtAt: nowIso(),
  };
  centers.set(id, center);
  return cloneCenter(center);
}

export function getIntelligenceCommandCenter(
  id: string,
): IntelligenceCommandCenter | undefined {
  const center = centers.get(id.trim());
  return center ? cloneCenter(center) : undefined;
}

export function listIntelligenceCommandCenters(filter?: {
  orchestrationId?: string;
}): IntelligenceCommandCenter[] {
  let result = [...centers.values()];
  if (filter?.orchestrationId) {
    const oid = filter.orchestrationId.trim();
    result = result.filter((c) => c.orchestrationId === oid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCenter);
}

export function clearIntelligenceCommandCenters(): void {
  centers.clear();
}
