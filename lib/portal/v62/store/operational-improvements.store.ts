/**
 * V62 P9 — Operational improvement log
 */

export type OperationalImprovement = {
  id: string;
  issueId?: string;
  title: string;
  description: string;
  scope: "pilot_blocker" | "pilot_high" | "ops";
  status: "logged" | "applied" | "verified";
  createdAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __v62OperationalImprovements: OperationalImprovement[] | undefined;
}

function store(): OperationalImprovement[] {
  globalThis.__v62OperationalImprovements ||= [];
  return globalThis.__v62OperationalImprovements;
}

let seq = 0;

export function logOperationalImprovement(input: {
  issueId?: string;
  title: string;
  description: string;
  scope: OperationalImprovement["scope"];
}): OperationalImprovement {
  const record: OperationalImprovement = {
    id: `opi_${++seq}_${Date.now()}`,
    issueId: input.issueId,
    title: input.title,
    description: input.description,
    scope: input.scope,
    status: "logged",
    createdAt: new Date().toISOString(),
  };
  store().push(record);
  return record;
}

export function listOperationalImprovements(): OperationalImprovement[] {
  return [...store()].reverse();
}

export function clearOperationalImprovementsForTests(): void {
  globalThis.__v62OperationalImprovements = [];
}
