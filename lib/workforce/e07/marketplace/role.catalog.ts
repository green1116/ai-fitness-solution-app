/**
 * E07-P3 — Role Agent Marketplace Catalog
 * Declarative role listings bound to E07 AI employees
 */

import type { RoleListing } from "./role.types";

export const ROLE_CATALOG: RoleListing[] = [
  {
    id: "e07.role.bid-agent",
    name: "Bid Agent Role",
    category: "commercial",
    title: "AI Bid Agent",
    description: "Marketplace listing for the AI Bidding Specialist employee",
    employeeId: "e07.employee.bid-specialist",
    listingStatus: "deployable",
    tags: ["tender", "pricing", "compliance"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.role.risk-agent",
    name: "Risk Agent Role",
    category: "risk",
    title: "AI Risk Agent",
    description: "Marketplace listing for the AI Risk Officer employee",
    employeeId: "e07.employee.risk-officer",
    listingStatus: "deployable",
    tags: ["risk", "mitigation", "audit"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e07.role.delivery-agent",
    name: "Delivery Agent Role",
    category: "delivery",
    title: "AI Delivery Agent",
    description: "Marketplace listing for the AI Delivery Manager employee",
    employeeId: "e07.employee.delivery-manager",
    listingStatus: "deployable",
    tags: ["delivery", "escalation", "coordination"],
    optional: false,
    readOnly: true,
  },
];

export function listRolesByTag(tag: string): RoleListing[] {
  return ROLE_CATALOG.filter((role) => role.tags.includes(tag));
}

export function listDeployableRoles(
  roles: RoleListing[] = ROLE_CATALOG,
): RoleListing[] {
  return roles.filter((role) => role.listingStatus === "deployable");
}
