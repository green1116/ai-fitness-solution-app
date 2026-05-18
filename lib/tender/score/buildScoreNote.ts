export type ScoreNoteEvidenceItem = {
  ref: string;
  source?: "note" | "risk" | "response" | "attachment";
  matchedBy?: string;
};

export type BuildScoreNoteInput = {
  label: string;
  score: number;
  maxScore: number;
  rawNote?: string;
  evidence?: ScoreNoteEvidenceItem[];
  keywords?: string[];
};

function ratio(score: number, maxScore: number) {
  if (!maxScore) return 0;
  return score / maxScore;
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function inferStrengthText(score: number, maxScore: number) {
  const r = ratio(score, maxScore);

  if (r >= 0.9) {
    return {
      level: "strong",
      summary: "整体响应较为完整，支撑较充分",
      tail: "具备较强得分支撑。",
    };
  }

  if (r >= 0.75) {
    return {
      level: "good",
      summary: "整体方案较完整，具备较好支撑",
      tail: "总体满足评分关注点。",
    };
  }

  if (r >= 0.55) {
    return {
      level: "mid",
      summary: "已形成一定响应基础，但完整性仍有提升空间",
      tail: "建议进一步补强关键细节。",
    };
  }

  if (r >= 0.35) {
    return {
      level: "weak",
      summary: "现有材料支撑相对有限，完整度不足",
      tail: "对得分形成存在一定影响。",
    };
  }

  return {
    level: "poor",
    summary: "当前支撑较弱，关键内容体现不足",
    tail: "建议重点补充核心响应材料。",
  };
}

function inferGapTail(score: number, maxScore: number) {
  const gap = Math.max(0, maxScore - score);
  if (gap <= 1) return "细节层面仍可进一步优化。";
  if (gap <= 3) return "部分关键细节仍建议进一步补充完善。";
  if (gap <= 5) return "若不补强相关内容，可能对评审得分形成明显影响。";
  return "当前缺口较大，建议优先补充核心支撑材料。";
}

function inferTopicFragments(label: string, keywords?: string[]) {
  const text = [label, ...(keywords || [])].join(" ");
  const fragments: string[] = [];

  if (/[售后维保保修服务响应]/.test(text)) {
    fragments.push("售后响应机制", "服务承诺");
  }
  if (/[培训]/.test(text)) {
    fragments.push("培训安排");
  }
  if (/[实施交付工期安装验收进度]/.test(text)) {
    fragments.push("实施计划", "交付与验收安排");
  }
  if (/[团队人员项目经理工程师资质证书经验]/.test(text)) {
    fragments.push("项目团队配置", "人员资历说明");
  }
  if (/[技术参数性能功能兼容配置规格指标设备]/.test(text)) {
    fragments.push("技术参数响应", "功能性能说明");
  }
  if (/[质量质保认证合规标准安全环保]/.test(text)) {
    fragments.push("质量与合规说明");
  }
  if (/[商务付款支付账期交货供货合同条款]/.test(text)) {
    fragments.push("商务条款响应");
  }
  if (/[业绩案例类似项目客户案例]/.test(text)) {
    fragments.push("类似项目业绩");
  }
  if (/[风险应急预案保障控制措施]/.test(text)) {
    fragments.push("风险控制措施", "保障预案");
  }
  if (/[报价价格单价总价成本预算优惠]/.test(text)) {
    fragments.push("报价合理性说明");
  }

  return uniq(fragments).slice(0, 3);
}

function inferEvidenceText(evidence?: ScoreNoteEvidenceItem[]) {
  if (!evidence?.length) return "目前证据支撑相对有限";
  const sources = evidence.map((e) => e.source).filter(Boolean);
  const hasResponse = sources.includes("response");
  const hasAttachment = sources.includes("attachment");
  const hasRisk = sources.includes("risk");
  if (hasResponse && hasAttachment) return "已有响应内容与附件材料形成交叉支撑";
  if (hasResponse) return "已有响应内容形成直接支撑";
  if (hasAttachment) return "已有附件材料形成辅助支撑";
  if (hasRisk) return "已有风险与说明信息形成间接支撑";
  return "现有材料可提供一定支撑";
}

export function buildScoreNote(
  input: BuildScoreNoteInput,
  mode: "short" | "long" = "long"
) {
  const { label, score, maxScore, rawNote, evidence, keywords } = input;
  const strength = inferStrengthText(score, maxScore);
  const topicFragments = inferTopicFragments(label, keywords);
  const evidenceText = inferEvidenceText(evidence);
  const topicText =
    topicFragments.length > 0
      ? `包含${topicFragments.join("、")}等内容`
      : "已围绕相关评分点形成一定响应";
  const normalizedRawNote = String(rawNote || "").trim();
  const tail = `${strength.tail}${inferGapTail(score, maxScore)}`;

  if (mode === "short") {
    if (normalizedRawNote) return `${normalizedRawNote}，${tail}`;
    return `${label}${strength.summary}，${tail}`;
  }

  if (normalizedRawNote) return `${normalizedRawNote}。${evidenceText}，${tail}`;
  return `${label}${strength.summary}，${topicText}，${evidenceText}，${tail}`;
}
