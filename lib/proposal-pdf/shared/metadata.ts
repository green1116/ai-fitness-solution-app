export const PROPOSAL_PDF_DOC_VERSION = "V11.2 Proposal Delivery" as const;
export const PROPOSAL_PDF_BRAND = "AI Fitness Solution" as const;
export const PROPOSAL_PDF_SYSTEM = "Proposal PDF Engine" as const;
export const PROPOSAL_PDF_PRODUCER = `${PROPOSAL_PDF_BRAND} — ${PROPOSAL_PDF_SYSTEM}` as const;

export interface ProposalDocumentContext {
  proposalId: string;
  projectId: string;
  projectName: string;
  customerName: string;
  version: string;
  brand: string;
  deliverySystemLabel: string;
  watermarkEnabled: boolean;
  watermarkText: string;
  reqsig?: string;
  generatedAt: string;
}

export interface ProposalBranding {
  brand: string;
  primaryColor: string;
  accentColor: string;
  logoLabel: string;
}

export function buildProposalDocumentContext(input?: {
  deploymentId?: string;
  projectName?: string;
  customerName?: string;
  watermarkEnabled?: boolean;
}): ProposalDocumentContext {
  const deploymentId = input?.deploymentId ?? "proposal-pdf-default";
  return {
    proposalId: `proposal-${deploymentId}`,
    projectId: `project-${deploymentId}`,
    projectName: input?.projectName ?? "智慧健身中心设备采购与运营项目",
    customerName: input?.customerName ?? "某市体育局",
    version: PROPOSAL_PDF_DOC_VERSION,
    brand: PROPOSAL_PDF_BRAND,
    deliverySystemLabel: PROPOSAL_PDF_SYSTEM,
    watermarkEnabled: input?.watermarkEnabled ?? false,
    watermarkText: "CONFIDENTIAL",
    generatedAt: new Date().toISOString(),
  };
}

export function buildProposalBranding(): ProposalBranding {
  return {
    brand: PROPOSAL_PDF_BRAND,
    primaryColor: "#1a365d",
    accentColor: "#2b6cb0",
    logoLabel: "AI Fitness Solution",
  };
}

export async function shortSigHex(payload: string): Promise<string> {
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 12);
}

export async function computeProposalReqsig(
  ctx: ProposalDocumentContext,
): Promise<string> {
  const payload = JSON.stringify({
    proposalId: ctx.proposalId,
    projectId: ctx.projectId,
    version: ctx.version,
    pack: "proposal-v11.2",
    generatedAt: ctx.generatedAt,
  });
  return shortSigHex(payload);
}

export function formatProposalReqsigLine(reqsig: string | undefined): string | undefined {
  const s = String(reqsig ?? "").trim();
  if (!s) return undefined;
  return /^REQSIG:/i.test(s) ? s : `REQSIG: ${s}`;
}
