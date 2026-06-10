import type { ComplianceDomain, ComplianceKnowledgeAsset } from "./types";
import { COMPLIANCE_DOMAINS } from "./types";

const DOMAIN_LABELS: Record<ComplianceDomain, string> = {
  qualification: "资质要求 Qualification",
  "technical-spec": "技术规格 Technical Spec",
  "safety-standard": "安全标准 Safety Standard",
  "warranty-service": "质保服务 Warranty & Service",
  environmental: "环保要求 Environmental",
};

const REQUIREMENTS: Record<ComplianceDomain, { requirement: string; mandatory: boolean }> = {
  qualification: { requirement: "具备健身器材生产或代理资质", mandatory: true },
  "technical-spec": { requirement: "设备参数满足招标文件技术偏离表", mandatory: true },
  "safety-standard": { requirement: "符合 GB 17498 等国家标准", mandatory: true },
  "warranty-service": { requirement: "提供不少于 3 年质保及本地化服务", mandatory: true },
  environmental: { requirement: "材料环保达标，施工废弃物合规处理", mandatory: false },
};

export function buildComplianceKnowledgeAssets(input?: {
  deploymentId?: string;
}): ComplianceKnowledgeAsset[] {
  const deploymentId = input?.deploymentId ?? "compliance-knowledge-default";
  return COMPLIANCE_DOMAINS.map((domain, index) => {
    const req = REQUIREMENTS[domain];
    return {
      assetId: `compliance-knowledge-${domain}-${deploymentId}`,
      domain,
      domainLabel: DOMAIN_LABELS[domain],
      requirement: {
        patternId: `req-pattern-${domain}-${deploymentId}`,
        domain,
        requirement: req.requirement,
        mandatory: req.mandatory,
      },
      compliance: {
        complianceId: `compliance-pattern-${domain}-${deploymentId}`,
        domain,
        response: `完全响应 ${DOMAIN_LABELS[domain]} 要求`,
        coverageScore: req.mandatory ? 95 - index : 80,
      },
      evidence: {
        evidenceId: `evidence-pattern-${domain}-${deploymentId}`,
        domain,
        evidenceType: req.mandatory ? "资质证书/检测报告" : "承诺书",
        description: `${DOMAIN_LABELS[domain]} 对应证明材料模板`,
      },
      mode: "readiness-stub" as const,
    };
  });
}

export { COMPLIANCE_DOMAINS, DOMAIN_LABELS };
