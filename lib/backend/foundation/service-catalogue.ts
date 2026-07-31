/**
 * PI-3.1 — Application service catalogue (PD-5.2).
 * Services orchestrate Domains — they are not product Domains.
 */
import type { ProductDomainId } from "./domain-ownership";

export const BACKEND_SERVICE_IDS = [
  "SVC-ACCESS",
  "SVC-PROJECT",
  "SVC-KNOWLEDGE-INTAKE",
  "SVC-DOCUMENT",
  "SVC-AGENT",
  "SVC-INTELLIGENCE",
  "SVC-EVOLUTION",
  "SVC-OPS",
] as const;

export type BackendServiceId = (typeof BACKEND_SERVICE_IDS)[number];

export type BackendServiceRow = Readonly<{
  id: BackendServiceId;
  name: string;
  primaryDomain: ProductDomainId;
  typicalScreens: readonly string[];
}>;

export const BACKEND_SERVICE_CATALOGUE = [
  {
    id: "SVC-ACCESS",
    name: "Access & Session Service",
    primaryDomain: "M13",
    typicalScreens: ["SCR-01"],
  },
  {
    id: "SVC-PROJECT",
    name: "Project & Workspace Surface Service",
    primaryDomain: "M13",
    typicalScreens: ["SCR-04", "SCR-07"],
  },
  {
    id: "SVC-KNOWLEDGE-INTAKE",
    name: "Tender / Requirement Knowledge Service",
    primaryDomain: "M11",
    typicalScreens: ["SCR-03", "SCR-04"],
  },
  {
    id: "SVC-DOCUMENT",
    name: "Document Catalog & Artifact Service",
    primaryDomain: "M11",
    typicalScreens: ["SCR-05", "SCR-06", "SCR-07", "SCR-08"],
  },
  {
    id: "SVC-AGENT",
    name: "Agent Orchestration Service",
    primaryDomain: "M12",
    typicalScreens: ["SCR-02", "SCR-04"],
  },
  {
    id: "SVC-INTELLIGENCE",
    name: "Intelligence Analysis Service",
    primaryDomain: "M14",
    typicalScreens: ["SCR-02", "SCR-04", "SCR-05", "SCR-06"],
  },
  {
    id: "SVC-EVOLUTION",
    name: "Share / Feedback / Governance Service",
    primaryDomain: "M15",
    typicalScreens: ["SCR-05", "SCR-08", "SCR-09"],
  },
  {
    id: "SVC-OPS",
    name: "Admin Operations Service",
    primaryDomain: "M13",
    typicalScreens: ["SCR-09"],
  },
] as const satisfies readonly BackendServiceRow[];
