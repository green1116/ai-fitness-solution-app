import { buildTenderBrandStubRecords } from "@/lib/brand-intelligence-network";
import type { RequirementStub, RequirementType } from "../shared/types";

const REQUIREMENT_TYPES: RequirementType[] = [
  "technical-compliance",
  "brand-authorization",
  "case-reference",
  "commercial-qualification",
  "equipment-spec",
];

export function buildRequirementStubId(
  tenderId: string,
  brandId: string,
  requirementType: RequirementType,
): string {
  return `req-stub-${tenderId}-${brandId}-${requirementType}`;
}

export function buildRequirementStubGraphNodeId(requirementId: string): string {
  return `graph-node-req-stub-${requirementId}`;
}

export function buildRequirementStubRecords(): RequirementStub[] {
  const tenderStubs = buildTenderBrandStubRecords().filter((stub) => stub.stubReady);

  return tenderStubs.map((stub, index) => {
    const requirementType = REQUIREMENT_TYPES[index % REQUIREMENT_TYPES.length]!;
    const requirementId = buildRequirementStubId(stub.tenderId, stub.brandId, requirementType);

    return {
      requirementId,
      tenderId: stub.tenderId,
      proposalId: stub.proposalId,
      brandId: stub.brandId,
      requirementType,
      mandatory: requirementType === "technical-compliance" || requirementType === "brand-authorization",
      evidenceLinkIds: [],
      stubReady: stub.matchScore >= 50,
      mode: "evidence-intelligence-network",
    };
  });
}

export function buildRequirementStub(
  requirementId: string,
  tenderId: string,
): RequirementStub | undefined {
  const existing = findRequirementStubById(requirementId);
  if (existing) return existing;

  const tenderStub = buildTenderBrandStubRecords().find(
    (stub) => stub.tenderId === tenderId && stub.stubReady,
  );
  if (!tenderStub) return undefined;

  const requirementType =
    REQUIREMENT_TYPES.find((type) => requirementId.includes(type)) ?? "technical-compliance";

  return {
    requirementId,
    tenderId,
    proposalId: tenderStub.proposalId,
    brandId: tenderStub.brandId,
    requirementType,
    mandatory: true,
    evidenceLinkIds: [],
    stubReady: tenderStub.matchScore >= 50,
    mode: "evidence-intelligence-network",
  };
}

export function findRequirementStubById(requirementId: string): RequirementStub | undefined {
  return buildRequirementStubRecords().find((stub) => stub.requirementId === requirementId);
}

export function findRequirementStubsByTenderId(tenderId: string): RequirementStub[] {
  return buildRequirementStubRecords().filter((stub) => stub.tenderId === tenderId);
}

export function findRequirementStubsByBrandId(brandId: string): RequirementStub[] {
  return buildRequirementStubRecords().filter((stub) => stub.brandId === brandId);
}

export function findReadyRequirementStubs(limit?: number): RequirementStub[] {
  const stubs = buildRequirementStubRecords().filter((stub) => stub.stubReady);
  return limit !== undefined ? stubs.slice(0, limit) : stubs;
}
