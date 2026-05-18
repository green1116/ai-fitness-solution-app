/**
 * V3.4 Evidence Intelligence Runtime — Tender Evidence Operating System
 *
 * External Evidence: Attachment → OCR → Classification → Linking → Registry → Coverage
 */
export * from "./types";
export { runExternalEvidenceIntelligence } from "./runExternalEvidenceIntelligence";
export { runOcrRuntime } from "./runtimes/ocrRuntime";
export { runAttachmentRuntime } from "./runtimes/attachmentRuntime";
export { runClassificationRuntime } from "./runtimes/classificationRuntime";
export { runLinkingRuntime } from "./runtimes/linkingRuntime";
export { runRegistryRuntime } from "./runtimes/registryRuntime";
export { runCoverageRuntime } from "./runtimes/coverageRuntime";
