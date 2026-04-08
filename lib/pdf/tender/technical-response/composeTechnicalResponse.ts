import type { TechnicalEvidenceBlock, TenderRequirement } from "@/lib/pdf/tender/types";

const FALLBACK_RESPONSE =
  "本方案已对该项技术要求进行整体响应，具体内容体现在技术方案正文、设备配置及实施安排中。";
const FALLBACK_PROOF = "见技术方案正文及预算配置表相关内容。";

function pickCorePhrase(text: string): string {
  const s = String(text || "").replace(/[。；;]+$/g, "").trim();
  if (!s) return "相关技术要求";
  return s.length > 28 ? `${s.slice(0, 28)}...` : s;
}

export function composeTechnicalResponse(
  req: TenderRequirement,
  matched: TechnicalEvidenceBlock[]
): string {
  const core = pickCorePhrase(req.text);

  if (!matched.length) return FALLBACK_RESPONSE;

  switch (req.requirementType) {
    case "equipment":
      return `本方案已配置与“${core}”相对应的设备及数量，相关配置详见方案正文及预算配置表，可满足项目使用需求。`;
    case "implementation":
      return `本方案已就“${core}”提供实施安排与交付建议，包含实施步骤、交付配合及后续保障内容，可满足项目落地要求。`;
    case "service":
      return `本方案已对“${core}”所涉及的售后服务、运维支持及保障机制进行响应，可满足后续运行维护需要。`;
    case "space":
    case "capacity":
    case "safety":
    case "acceptance":
    case "other":
    default:
      return `本方案已针对“${core}”进行响应，已在整体空间规划、功能分区及设备配置中予以落实，可满足项目实施要求。`;
  }
}

export function resolveProofRefs(matched: TechnicalEvidenceBlock[]): string {
  if (!matched.length) return FALLBACK_PROOF;

  const labels = Array.from(new Set(matched.map((x) => x.title).filter(Boolean)));
  const pages = Array.from(new Set(matched.map((x) => x.pageLabel).filter(Boolean)));
  const labelPart = labels.length ? `见“${labels.join("”“")}”相关内容` : "见相关章节内容";
  const pagePart = pages.length ? `（${pages.join("；")}）` : "";
  return `${labelPart}${pagePart}。`;
}

