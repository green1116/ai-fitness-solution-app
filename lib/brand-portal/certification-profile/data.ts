import type { CertificationProfile } from "../shared/types";

const CERT_TYPES = [
  { type: "ISO9001", issuer: "ISO Certification Body", yearsValid: 3 },
  { type: "CE", issuer: "EU Notified Body", yearsValid: 5 },
];

const BRAND_IDS = [
  "brand-life-fitness",
  "brand-technogym",
  "brand-matrix",
  "brand-relax",
  "brand-shuhua",
  "brand-precor",
  "brand-impulse",
  "brand-dhz",
  "brand-bodystrength",
  "brand-sportsart",
];

export const CERTIFICATION_PROFILES: CertificationProfile[] = BRAND_IDS.flatMap((brandId) =>
  CERT_TYPES.map((cert) => ({
    brandId,
    certificateType: cert.type,
    issuer: cert.issuer,
    validUntil: `202${8 + (brandId.length % 2)}-12-31`,
    documentRef: `cert-${brandId}-${cert.type.toLowerCase()}`,
    mode: "brand-portal" as const,
  })),
);

export function getAllCertificationProfiles(): CertificationProfile[] {
  return [...CERTIFICATION_PROFILES];
}

export function getCertificationProfilesByBrandId(brandId: string): CertificationProfile[] {
  return CERTIFICATION_PROFILES.filter((c) => c.brandId === brandId);
}
