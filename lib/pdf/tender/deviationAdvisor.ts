import type { TenderAttachmentRefMap } from "@/lib/pdf/tender/attachmentIndex";
import type {
  TenderDeviationScene,
  TenderDeviationStatus,
  TenderRiskLevel,
} from "@/lib/pdf/tender/deviationTypes";
import { normalizeTenderDisplayStatus } from "@/lib/pdf/tender/statusStyle";

function normalizeStatus(status?: string): TenderDeviationStatus {
  return normalizeTenderDisplayStatus(status || "");
}

function pickAttachmentRefs(
  attachmentRefs: TenderAttachmentRefMap | undefined,
  keys: string[]
) {
  if (!attachmentRefs) return [];
  return keys
    .map((key) => attachmentRefs[key as keyof TenderAttachmentRefMap])
    .filter(Boolean)
    .map((item) => ({
      code: item!.code,
      name: item!.name,
    }));
}

function formatAttachmentRefs(
  attachmentRefs: TenderAttachmentRefMap | undefined,
  keys: string[]
) {
  const refs = pickAttachmentRefs(attachmentRefs, keys);
  if (!refs.length) return "";
  return refs.map((r) => `${r.code}：${r.name}`).join("；");
}

export function resolveDeviationRiskLevel(
  scene: TenderDeviationScene,
  status?: string
): TenderRiskLevel {
  const s = normalizeStatus(status);
  if (s === "偏离") return "高";
  if (s === "部分满足" || s === "待确认" || s === "无此项") return "中";
  if (scene === "technical_deviation" || scene === "business_deviation") {
    if (s === "满足" || s === "响应") return "低";
  }
  return "中";
}

export function buildDeviationAttachmentAdvice(params: {
  scene: TenderDeviationScene;
  status?: string;
  currentAdvice?: string;
  attachmentRefs?: TenderAttachmentRefMap;
}) {
  const { scene, attachmentRefs } = params;
  const currentAdvice = String(params.currentAdvice || "").trim();
  if (currentAdvice) return currentAdvice;
  const s = normalizeStatus(params.status);

  if (scene === "technical_deviation") {
    switch (s) {
      case "待确认": {
        const txt = formatAttachmentRefs(attachmentRefs, [
          "product_datasheet",
          "test_report",
        ]);
        return txt || "建议补充产品技术参数表及检测证明材料";
      }
      case "部分满足": {
        const txt = formatAttachmentRefs(attachmentRefs, ["product_datasheet"]);
        return txt ? `${txt}；建议逐项核对技术参数差异` : "建议逐项核对技术参数差异";
      }
      case "偏离": {
        const txt = formatAttachmentRefs(attachmentRefs, [
          "product_datasheet",
          "test_report",
        ]);
        return txt ? `${txt}；建议重点审查技术偏离说明` : "建议重点审查技术偏离说明";
      }
      case "无此项":
        return "本项未单独适用，建议结合总体技术响应审阅";
      default:
        return "";
    }
  }

  if (scene === "business_deviation") {
    switch (s) {
      case "待确认": {
        const txt = formatAttachmentRefs(attachmentRefs, [
          "service_commitment",
          "delivery_plan",
        ]);
        return txt || "建议补充服务承诺及交付安排说明";
      }
      case "部分满足": {
        const txt = formatAttachmentRefs(attachmentRefs, ["service_commitment"]);
        return txt ? `${txt}；建议进一步明确服务边界` : "建议进一步明确服务边界";
      }
      case "偏离": {
        const txt = formatAttachmentRefs(attachmentRefs, [
          "service_commitment",
          "delivery_plan",
        ]);
        return txt ? `${txt}；建议重点审查商务偏离说明` : "建议重点审查商务偏离说明";
      }
      case "无此项":
        return "本项未单独适用，建议结合整体商务响应审阅";
      default:
        return "";
    }
  }

  return "";
}

