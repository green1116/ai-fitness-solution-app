/**
 * V99 — Certification service (minimal write to certification cache only)
 */

import { randomUUID } from "node:crypto";

import {
  appendCertificationAction,
  getCertificationPackage,
  saveCertificationPackage,
  setCertifiedAt,
  setGateOverride,
} from "./certification-cache";
import {
  buildArtifactLinks,
  buildAuditReferences,
  buildCertificationGates,
  buildReadinessSummary,
  buildRiskSummary,
} from "./readiness.service";
import type { CertificationPackage, GateStatus } from "./readiness.types";

export function generateCertificationPackage(input: {
  organizationId: string;
  actorId: string;
  title?: string;
}): CertificationPackage {
  const now = new Date().toISOString();
  const readiness = buildReadinessSummary(input.organizationId);
  const gates = buildCertificationGates(input.organizationId);
  const risks = buildRiskSummary(input.organizationId);
  const artifacts = buildArtifactLinks(input.organizationId);
  const auditReferences = buildAuditReferences(input.organizationId);

  const pack: CertificationPackage = {
    id: `cert-${randomUUID()}`,
    organizationId: input.organizationId,
    title: input.title ?? `生产认证包 ${new Date().toLocaleDateString("zh-CN")}`,
    generatedAt: now,
    readiness,
    gates,
    risks,
    artifacts,
    auditReferences,
    overallReadiness: readiness.overallReadiness,
    readOnly: true,
  };

  saveCertificationPackage(pack);

  appendCertificationAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "generate_certification_package",
    packageId: pack.id,
    note: `生成认证包: ${pack.title}`,
  });

  return pack;
}

export function recordGateReview(input: {
  organizationId: string;
  actorId: string;
  gateId: string;
  status: GateStatus;
  note?: string;
}): CertificationPackage {
  const gates = buildCertificationGates(input.organizationId);
  const gate = gates.find((g) => g.id === input.gateId);
  if (!gate) throw new Error("GATE_NOT_FOUND");

  if (input.status === "waived") {
    setGateOverride(input.organizationId, input.gateId, "waived");
  }

  appendCertificationAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "record_gate_review",
    gateId: input.gateId,
    note: input.note ?? `门控审阅: ${gate.label} → ${input.status}`,
    meta: { status: input.status },
  });

  return generateCertificationPackage({
    organizationId: input.organizationId,
    actorId: input.actorId,
    title: `门控审阅更新 ${gate.label}`,
  });
}

export function waiveGate(input: {
  organizationId: string;
  actorId: string;
  gateId: string;
  note?: string;
}): CertificationPackage {
  setGateOverride(input.organizationId, input.gateId, "waived");

  appendCertificationAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "waive_gate",
    gateId: input.gateId,
    note: input.note ?? "门控已豁免",
  });

  return generateCertificationPackage({
    organizationId: input.organizationId,
    actorId: input.actorId,
    title: "豁免更新认证包",
  });
}

export function certifyProductionReady(input: {
  organizationId: string;
  actorId: string;
  note?: string;
}): CertificationPackage {
  const readiness = buildReadinessSummary(input.organizationId);
  if (readiness.overallReadiness === "not_ready") {
    throw new Error("NOT_READY_FOR_CERTIFICATION");
  }

  const now = new Date().toISOString();
  setCertifiedAt(input.organizationId, now);

  const pack = generateCertificationPackage({
    organizationId: input.organizationId,
    actorId: input.actorId,
    title: "生产就绪认证",
  });

  appendCertificationAction({
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: "certify_ready",
    packageId: pack.id,
    note: input.note ?? "平台生产认证完成",
    meta: { certifiedAt: now },
  });

  return getCertificationPackage(input.organizationId, pack.id) ?? pack;
}
