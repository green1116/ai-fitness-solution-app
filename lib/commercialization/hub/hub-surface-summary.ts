/** Minimal hub types for stabilization (RC1 smoke / type-only entry). */

export const V37_HUB_FOUNDATION_VERSION = "3.7-hub-15" as const;

export type HubFreezeRef = {
  hubFrozen: boolean;
};

export type TerminalFreezeRef = {
  terminalLocked: boolean;
};

export type CommercialV37HubFoundationResult = {
  version: typeof V37_HUB_FOUNDATION_VERSION;
  deploymentId: string;
  hubReady: boolean;
  hubFreeze: HubFreezeRef;
  terminalFreeze: TerminalFreezeRef;
};
