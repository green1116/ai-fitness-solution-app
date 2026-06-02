/**
 * V2.5 Evidence Foundation Layer
 *
 * 独立于 PDF / UI / OCR / 向量检索。
 * 后续 OCR、semantic extraction、embedding、compliance  intelligence 均接入此层。
 */

export * from "./types";
export {
  createEvidenceRegistry,
  addEvidenceDocument,
  addEvidenceDocuments,
  linkRequirementEvidence,
  getEvidenceById,
  getEvidenceByRequirement,
  getLinksForRequirement,
  listEvidenceDocuments,
} from "./registry";
export {
  scoreEvidenceMatch,
  proposeRequirementEvidenceLinks,
  filterCandidateEvidence,
  type RequirementMatchContext,
} from "./matching";
export {
  evaluateRequirementCoverage,
  evaluateRegistryCoverage,
} from "./coverage";
export {
  buildTenderEvidenceMatrix,
  summarizeEvidenceMatrix,
} from "./matrix";
export * from "./adapters";
export * from "./bridge";
export * from "./query";
export * from "./runtime";
export * from "./trace";
