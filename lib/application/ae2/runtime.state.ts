/**
 * AE-2 — Declarative application runtime states.
 * State catalogue only — not a workflow engine / business state machine.
 */

export const AE2_RUNTIME_STATE_IDS = [
  "ASSEMBLED",
  "BOUND",
  "READY",
  "IDLE",
  "SUSPENDED",
  "STOPPED",
] as const;

export type Ae2RuntimeStateId = (typeof AE2_RUNTIME_STATE_IDS)[number];

export type Ae2RuntimeState = Readonly<{
  stateId: Ae2RuntimeStateId;
  order: number;
  notes: string;
}>;

/**
 * Closed runtime state catalogue — declarative labels for assembly binding.
 */
export const AE2_RUNTIME_STATES = [
  {
    stateId: "ASSEMBLED",
    order: 1,
    notes: "AE-1 manifest present",
  },
  {
    stateId: "BOUND",
    order: 2,
    notes: "Runtime context bound to assembly",
  },
  {
    stateId: "READY",
    order: 3,
    notes: "Runtime plan ready (no execution)",
  },
  {
    stateId: "IDLE",
    order: 4,
    notes: "Runtime idle — awaiting future layers",
  },
  {
    stateId: "SUSPENDED",
    order: 5,
    notes: "Runtime suspended — policy hold",
  },
  {
    stateId: "STOPPED",
    order: 6,
    notes: "Runtime stopped — terminal catalogue state",
  },
] as const satisfies readonly Ae2RuntimeState[];

export const AE2_INITIAL_RUNTIME_STATE = "ASSEMBLED" as const;

export const AE2_DEFAULT_BOUND_STATE = "BOUND" as const;

export function getAe2RuntimeState(
  stateId: Ae2RuntimeStateId,
): Ae2RuntimeState | undefined {
  return AE2_RUNTIME_STATES.find((s) => s.stateId === stateId);
}
