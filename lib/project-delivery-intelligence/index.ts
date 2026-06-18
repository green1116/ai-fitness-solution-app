/**
 * V45 Project Delivery Intelligence — Phase 1.
 * Read-only extension over V40 Requirement / V41 Tender Knowledge Graph.
 */
export * from "./shared/constants";
export * from "./shared/types";

export { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
export { buildTenderRegistryRecords } from "@/lib/tender-knowledge-graph";

export * from "./project-foundation/project-types";
export { buildProjectRegistry } from "./project-foundation/project-registry";
export { buildMilestoneRegistry } from "./project-foundation/milestone-registry";
export { buildProjectTenderLinks } from "./project-foundation/project-tender-link";
export { buildProjectRequirementLinks } from "./project-foundation/project-requirement-link";
export { validateProjectFoundation } from "./project-foundation/foundation-validation";
