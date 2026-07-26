/**
 * Product Partner — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listPartnerAccesses } from "../access/access.registry";
import { listPartnerAgreements } from "../agreement/agreement.registry";
import { listPartnerProfiles } from "../profile/profile.registry";
import { getPartner } from "../registry/partner.registry";

export type PartnerReleaseManifest = {
  id: string;
  partnerId: string;
  partnerKey: string;
  checksum: string;
  profileId: string;
  agreementId: string;
  accessId: string;
  createdAt: string;
};

const releases = new Map<string, PartnerReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: PartnerReleaseManifest,
): PartnerReleaseManifest {
  return { ...release };
}

export function createPartnerReleaseManifest(input: {
  id?: string;
  partnerId: string;
}): PartnerReleaseManifest {
  const partnerId = input.partnerId.trim();
  if (!partnerId) throw new Error("manifest.partnerId is required");

  const partner = getPartner(partnerId);
  if (!partner) throw new Error(`partner not found: ${partnerId}`);

  const profiles = listPartnerProfiles({ partnerId });
  if (profiles.length < 1) throw new Error("partner profile missing");
  const agreements = listPartnerAgreements({ partnerId });
  const activeAgreement = agreements.find((a) => a.status === "ACTIVE");
  if (!activeAgreement) throw new Error("active partner agreement missing");
  const accesses = listPartnerAccesses({ partnerId });
  const granted = accesses.find((a) => a.status === "GRANTED");
  if (!granted) throw new Error("granted partner access missing");

  const payload = {
    partnerKey: partner.partnerKey,
    kind: partner.kind,
    status: partner.status,
    profile: {
      profileKey: profiles[0].profileKey,
      legalName: profiles[0].legalName,
      contactRef: profiles[0].contactRef,
    },
    agreement: {
      agreementKey: activeAgreement.agreementKey,
      status: activeAgreement.status,
      termsRef: activeAgreement.termsRef,
    },
    access: {
      accessKey: granted.accessKey,
      connectorKeyRef: granted.connectorKeyRef,
      status: granted.status,
    },
  };

  const id = input.id?.trim() || createId("partnerrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: PartnerReleaseManifest = {
    id,
    partnerId,
    partnerKey: partner.partnerKey,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    profileId: profiles[0].id,
    agreementId: activeAgreement.id,
    accessId: granted.id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getPartnerReleaseManifest(
  id: string,
): PartnerReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listPartnerReleaseManifests(): PartnerReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearPartnerReleaseManifests(): void {
  releases.clear();
}
