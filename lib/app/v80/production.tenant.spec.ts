/**
 * V80 APP P4 — Multi-tenant runtime model (isolation + auth + entitlement)
 */
import type { TenantIsolationSpec } from "./production.types";

export const MULTI_TENANT_RUNTIME: TenantIsolationSpec[] = [
  {
    id: "PRD-TNT-001",
    layer: "auth",
    mechanism: "Session token → User → OrganizationMember",
    enforcement: "getServerSession() on every API route",
    prismaScope: "session.userId",
    required: true,
  },
  {
    id: "PRD-TNT-002",
    layer: "auth",
    mechanism: "Organization context injection",
    enforcement: "runSaasApiGate(req, featureKey) resolves organizationId",
    prismaScope: "where: { organizationId }",
    required: true,
  },
  {
    id: "PRD-TNT-003",
    layer: "data",
    mechanism: "Row-level tenant scoping",
    enforcement: "all Project/Tender/Budget queries filter by organizationId",
    prismaScope: "Organization.id FK cascade",
    required: true,
  },
  {
    id: "PRD-TNT-004",
    layer: "data",
    mechanism: "RBAC role gate",
    enforcement: "OrganizationMember.role: owner|admin|member",
    prismaScope: "OrganizationMember.role",
    required: true,
  },
  {
    id: "PRD-TNT-005",
    layer: "compute",
    mechanism: "Feature entitlement gate",
    enforcement: "runSaasApiGate before service call; trackFeatureUsage after",
    prismaScope: "UsageRecord.organizationId",
    required: true,
  },
  {
    id: "PRD-TNT-006",
    layer: "storage",
    mechanism: "Blob prefix isolation",
    enforcement: "s3://{orgId}/{projectId}/{artifactType}/",
    prismaScope: "DocumentExport.projectId → Project.organizationId",
    required: true,
  },
];

export function isMultiTenantRuntimeComplete(): boolean {
  const layers = new Set(MULTI_TENANT_RUNTIME.map((t) => t.layer));
  return (
    MULTI_TENANT_RUNTIME.length === 6 &&
    layers.has("auth") &&
    layers.has("data") &&
    layers.has("compute") &&
    layers.has("storage")
  );
}
