/**
 * V45 Project Delivery Intelligence — Foundation verification
 */
import {
  buildMilestoneRegistry,
  buildProjectRegistry,
  buildProjectRequirementLinks,
  buildProjectTenderLinks,
  PDI_MIN_MILESTONE_COUNT,
  PDI_MIN_PROJECT_COUNT,
  PDI_MIN_REQUIREMENT_LINK_COUNT,
  PDI_MIN_TENDER_LINK_COUNT,
  validateProjectFoundation,
} from "../lib/project-delivery-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const projects = buildProjectRegistry();
assert(projects.count >= PDI_MIN_PROJECT_COUNT, "project count");
assert(projects.records.every((record) => record.projectId && record.tenderId && record.name), "project fields");

console.log("✓ project registry");
console.log(`  projects=${projects.count}`);

const milestones = buildMilestoneRegistry();
assert(milestones.count >= PDI_MIN_MILESTONE_COUNT, "milestone count");
assert(milestones.records.every((record) => record.projectId && record.phase), "milestone fields");

console.log("✓ milestone registry");
console.log(`  milestones=${milestones.count}`);

const tenderLinks = buildProjectTenderLinks();
assert(tenderLinks.length >= PDI_MIN_TENDER_LINK_COUNT, "tender link count");
assert(tenderLinks.every((link) => link.projectId && link.tenderId), "tender link fields");

console.log("✓ tender links");
console.log(`  tenderLinks=${tenderLinks.length}`);

const requirementLinks = buildProjectRequirementLinks();
assert(requirementLinks.length >= PDI_MIN_REQUIREMENT_LINK_COUNT, "requirement link count");
assert(
  requirementLinks.every((link) => link.projectId && link.requirementId),
  "requirement link fields",
);

console.log("✓ requirement links");
console.log(`  requirementLinks=${requirementLinks.length}`);

const validation = validateProjectFoundation();
assert(validation.valid, "foundation validation");

console.log("✓ foundation validation");
console.log(`  valid=${validation.valid} summary=${validation.summary}`);
console.log("PROJECT DELIVERY FOUNDATION PASS");
