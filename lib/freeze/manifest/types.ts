import type { FreezeDomainKey } from "../inventory";

export type FreezeStatus = "active" | "frozen" | "archived";

export interface FreezeManifest {
  domain: FreezeDomainKey;
  phase: number;
  phaseName: string;
  status: FreezeStatus;
  version: string;
  tag: string;
}
