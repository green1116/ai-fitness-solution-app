/**
 * Commercialization P7 — Risk control
 */

import { RISK_LEVELS } from "../governance/governance.constants";
import { getRiskAssessment } from "./risk.assessment";
import type {
  ApplyRiskControlInput,
  RiskControl,
  RiskLevel,
} from "./risk.types";

const controls = new Map<string, RiskControl>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneControl(control: RiskControl): RiskControl {
  return { ...control };
}

export function applyRiskControl(
  input: ApplyRiskControlInput,
): RiskControl {
  const name = input.name.trim();
  const mitigation = input.mitigation.trim();
  const assessmentId = input.assessmentId.trim();
  if (!name) throw new Error("riskControl.name is required");
  if (!mitigation) throw new Error("riskControl.mitigation is required");
  if (!assessmentId) throw new Error("riskControl.assessmentId is required");
  if (!getRiskAssessment(assessmentId)) {
    throw new Error(`risk assessment not found: ${assessmentId}`);
  }
  if (!(RISK_LEVELS as readonly string[]).includes(input.residualLevel)) {
    throw new Error(`invalid residual risk level: ${input.residualLevel}`);
  }

  const id = input.id?.trim() || createId("ctl");
  if (controls.has(id)) {
    throw new Error(`risk control already exists: ${id}`);
  }

  const control: RiskControl = {
    id,
    assessmentId,
    name,
    mitigation,
    residualLevel: input.residualLevel,
    detail: `residual=${input.residualLevel}`,
    createdAt: nowIso(),
  };
  controls.set(id, control);
  return cloneControl(control);
}

export function getRiskControl(id: string): RiskControl | undefined {
  const control = controls.get(id.trim());
  return control ? cloneControl(control) : undefined;
}

export function listRiskControls(filter?: {
  assessmentId?: string;
  residualLevel?: RiskLevel;
}): RiskControl[] {
  let result = [...controls.values()];
  if (filter?.assessmentId) {
    const aid = filter.assessmentId.trim();
    result = result.filter((c) => c.assessmentId === aid);
  }
  if (filter?.residualLevel) {
    result = result.filter((c) => c.residualLevel === filter.residualLevel);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneControl);
}

export function clearRiskControls(): void {
  controls.clear();
}
