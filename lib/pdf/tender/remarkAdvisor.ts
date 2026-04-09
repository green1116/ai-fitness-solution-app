import type { TenderAttachmentRefMap } from "@/lib/pdf/tender/attachmentIndex";
import {
  normalizeTenderDisplayStatus,
  type TenderDisplayStatus,
} from "@/lib/pdf/tender/statusStyle";

export type TenderRemarkAdviceInput = {
  status?: string;
  scene: "technical_response" | "business_response";
  currentRemark?: string;
};

function pickAttachmentText(
  attachmentRefs: TenderAttachmentRefMap | undefined,
  keys: string[]
) {
  if (!attachmentRefs) return "";
  const refs = keys
    .map((key) => attachmentRefs[key as keyof TenderAttachmentRefMap])
    .filter(Boolean);
  if (!refs.length) return "";
  return refs.map((item) => `${item!.code}：${item!.name}`).join("；");
}

function normalizeStatus(status?: string): TenderDisplayStatus {
  return normalizeTenderDisplayStatus(status || "");
}

export function buildTenderRemarkAdvice(
  input: TenderRemarkAdviceInput,
  attachmentRefs?: TenderAttachmentRefMap
) {
  const status = normalizeStatus(input.status);
  const currentRemark = String(input.currentRemark || "").trim();
  if (currentRemark) return currentRemark;

  if (input.scene === "technical_response") {
    switch (status) {
      case "待确认": {
        const refs = pickAttachmentText(attachmentRefs, [
          "product_datasheet",
          "test_report",
        ]);
        return refs
          ? `建议补充 ${refs}`
          : "建议补充产品技术参数及检测证明材料";
      }
      case "部分满足": {
        const refs = pickAttachmentText(attachmentRefs, ["product_datasheet"]);
        return refs
          ? `建议补充 ${refs}，并逐项核对参数差异`
          : "建议逐项核对技术参数差异";
      }
      case "偏离": {
        const refs = pickAttachmentText(attachmentRefs, ["product_datasheet"]);
        return refs
          ? `存在关键偏离，建议重点审查 ${refs} 及技术偏离说明`
          : "存在关键偏离，建议重点审查技术偏离说明";
      }
      case "无此项":
        return "本项在现有响应范围内未单独适用";
      default:
        return "";
    }
  }

  if (input.scene === "business_response") {
    switch (status) {
      case "待确认": {
        const refs = pickAttachmentText(attachmentRefs, [
          "service_commitment",
          "delivery_plan",
        ]);
        return refs ? `建议补充 ${refs}` : "建议补充服务承诺及交付安排说明";
      }
      case "部分满足": {
        const refs = pickAttachmentText(attachmentRefs, ["service_commitment"]);
        return refs
          ? `建议补充 ${refs}，并进一步明确服务边界`
          : "建议进一步明确服务边界与责任分工";
      }
      case "偏离": {
        const refs = pickAttachmentText(attachmentRefs, [
          "service_commitment",
          "delivery_plan",
        ]);
        return refs
          ? `存在商务偏离，建议重点审查 ${refs} 及偏离说明`
          : "存在商务偏离，建议重点审查商务偏离说明";
      }
      case "无此项":
        return "本项在现有商务响应范围内未单独适用";
      default:
        return "";
    }
  }

  return "";
}

