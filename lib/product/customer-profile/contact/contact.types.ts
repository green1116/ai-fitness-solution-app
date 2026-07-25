/**
 * Product Customer Profile — Contact types
 */

import type { CONTACT_KINDS } from "../profile/profile.constants";

export type ContactKind = (typeof CONTACT_KINDS)[number];
export type ContactMetadata = Record<string, unknown>;

export type CustomerProfileContact = {
  id: string;
  identityId: string;
  kind: ContactKind;
  value: string;
  primary: boolean;
  detail: string;
  metadata: ContactMetadata;
  addedAt: string;
};

export type AddContactInput = {
  id?: string;
  identityId: string;
  kind: ContactKind;
  value: string;
  primary?: boolean;
  metadata?: ContactMetadata;
};
