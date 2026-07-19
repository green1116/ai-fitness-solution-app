/**
 * E09-P4 — Federation Foundation types
 * Federated identity layer above E09 Global Identity
 */

import type {
  GlobalIdentity,
  GlobalIdentityStatus,
} from "../identity/global.identity";
import {
  E09_FEDERATION_BASE,
  E09_FEDERATION_FREEZE_VERSION,
  E09_FEDERATION_ID,
  E09_FEDERATION_VERSION,
  FEDERATION_SCOPES,
  FEDERATION_STATUSES,
} from "./federation.constants";

export type FederationScope = (typeof FEDERATION_SCOPES)[number];
export type FederationStatus = (typeof FEDERATION_STATUSES)[number];

/** Re-export identity types for federation consumers */
export type { GlobalIdentity, GlobalIdentityStatus };

export type FederatedIdentity = {
  id: string;
  /** Bound GlobalIdentity.id from e09/identity */
  identityId: GlobalIdentity["id"];
  /** Owning node — typically GlobalIdentity.nodeId */
  ownerNodeId: GlobalIdentity["nodeId"];
  scope: FederationScope;
  trustLevel: GlobalIdentity["trustLevel"];
  status: FederationStatus;
};

export type RegisterFederationInput = {
  id: string;
  identityId: GlobalIdentity["id"];
  ownerNodeId?: GlobalIdentity["nodeId"];
  scope: FederationScope;
  trustLevel?: GlobalIdentity["trustLevel"];
  status?: FederationStatus;
};

export type FederationRegistryManifest = {
  federationId: typeof E09_FEDERATION_ID;
  version: typeof E09_FEDERATION_VERSION;
  freezeVersion: typeof E09_FEDERATION_FREEZE_VERSION;
  base: typeof E09_FEDERATION_BASE;
  federationCount: number;
  federations: FederatedIdentity[];
};
