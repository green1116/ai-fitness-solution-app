import { PDFDocument, degrees, type PDFFont, type PDFPage, rgb } from "pdf-lib";
import type {
  ProductPlaceholder,
  ProjectRecord,
  SolutionRecord,
} from "@/lib/domain/tender";
import type { UserTier } from "@/lib/commercial/userTier";
import { loadChineseFont } from "@/lib/pdf/shared/chineseFont";
import { drawCommercialCoverV3, formatCoverDateIso } from "@/lib/pdf/cover";
import { restampTenderDeliveryChrome } from "@/lib/pdf/shared/documentChrome";
import {
  applyTenderDocumentMetadata,
  buildTenderDocumentContext,
  computeTenderPackReqsig,
  formatReqsigLine,
  type TenderDocumentContext,
} from "@/lib/pdf/tenderDocumentContext";
import {
  drawTenderClosingBlock,
  TENDER_DECLARATION_SIGN_TITLE,
  TENDER_PLAN_VOLUME_SUBTITLE,
  TENDER_SIGN_LABEL_COMPANY,
  TENDER_SIGN_LABEL_DATE,
  TENDER_SIGN_LABEL_REPRESENTATIVE,
} from "@/lib/pdf/tenderCommercialCopy";
import {
  planBodyDrawX,
  planBodyFontSize,
  planBodyLineAdvance,
  planBodyStartPage1Based,
  planClassifyBodyLine,
  planFrontMatterPageCount,
  PLAN_BODY_BOTTOM,
  PLAN_BODY_SIZE,
  PLAN_BODY_TOP,
  PLAN_CALLOUT_INDENT,
  PLAN_CHAPTER_NUM_SIZE,
  PLAN_DELIVERY_NOTICE_PAGE_INDEX,
  PLAN_LINE_HEIGHT,
  PLAN_MARGIN_X,
  PLAN_PAGE_HEIGHT,
  PLAN_PAGE_WIDTH,
  PLAN_TITLE_BOTTOM_SPACING,
  PLAN_TITLE_GAP_AFTER_BIG_NUM,
  PLAN_TITLE_GAP_AFTER_EN,
  PLAN_TITLE_GAP_ZH_TO_EN,
  PLAN_TITLE_TOP_SPACING,
  PLAN_TITLE_TOP_SPACING_CONT,
  PLAN_TOC_LEADER_GAP,
  PLAN_TOC_ROW_STEP,
  type PlanBodyLineKind,
} from "@/lib/pdf/planTypography";
import { drawTenderDeliveryNoticePage } from "@/lib/pdf/tenderDeliveryNotice";
import {
  classifyNarrativeLayer,
  drawEditorialDivider,
  drawEditorialSpacedUppercase,
  drawNarrativeSeparator,
  freezeNarrativePause,
  EDITORIAL_CALLOUT_INK,
  EDITORIAL_CHAPTER_NUM_COLOR,
  EDITORIAL_EN_SIZE,
  EDITORIAL_INTRO_INK,
  EDITORIAL_NUMBER_MUTED,
  EDITORIAL_STRATEGIC_INK,
  EDITORIAL_TOC_CHAP_COLOR,
  EDITORIAL_TOC_LEADER_COLOR,
  isEditorialIntroLine,
  parseCalloutLabel,
  type NarrativeLayer,
} from "@/lib/pdf/editorialStyle";
import {
  FREEZE_BODY_SIZE,
  FREEZE_EXECUTIVE_SIZE,
  FREEZE_INK_BODY,
  FREEZE_STRATEGIC_SIZE,
  FREEZE_TOC_LEADER_DOT_SIZE,
} from "@/lib/pdf/commercialFreezeDesignSystem";

const PAGE_WIDTH = PLAN_PAGE_WIDTH;
const PAGE_HEIGHT = PLAN_PAGE_HEIGHT;
const MARGIN_X = PLAN_MARGIN_X;
const BODY_TOP = PLAN_BODY_TOP;
const BODY_BOTTOM = PLAN_BODY_BOTTOM;
const BODY_SIZE = 11;
const LINE_HEIGHT = PLAN_LINE_HEIGHT;

export type ProjectLike = {
  id: string;
  name: string;
  clientName: string | null;
  industry: string | null;
  siteType: string;
  areaM2: number | null;
  targetUsers: number | null;
  city: string | null;
  budgetLevel: string;
  deliveryMode: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SolutionLike = {
  id: string;
  projectId: string;
  summary: string;
  background: string;
  requirements: unknown;
  objectives: unknown;
  zoning: unknown;
  implementationPlan: unknown;
  operationsPlan: unknown;
  riskControl: unknown;
  acceptanceCriteria: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export type PlaceholderLike = {
  id: string;
  projectId: string;
  category: string;
  subCategory: string | null;
  specTags: unknown;
  quantity: number;
  priceBand: string;
  recommendationReason: string;
  replaceable: boolean;
  skuId: string | null;
  skuName: string | null;
  brand: string | null;
  model: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Section = {
  key: string;
  title: string;
  lines: string[];
};

type SectionPage = {
  sectionKey: string;
  sectionTitle: string;
  pageNoInSection: number;
  lines: string[];
};

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((x): x is string => typeof x === "string")
    : [];
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of src) {
    const value = line.trim();
    if (!value) {
      out.push("");
      continue;
    }
    let cur = "";
    for (const ch of value) {
      const next = cur + ch;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) cur = next;
      else {
        if (cur) out.push(cur);
        cur = ch;
      }
    }
    if (cur) out.push(cur);
  }
  return out;
}

function cleanField(value: string | undefined | null, fallback: string): string {
  const v = String(value ?? "").trim();
  if (!v) return fallback;
  if (v === "示例企业" || v.toLowerCase() === "enterprise") return fallback;
  if (v.includes("未提供")) return fallback;
  return v;
}

function normalizeIndustry(value: string | undefined | null): string {
  const v = String(value ?? "").trim().toLowerCase();
  if (!v || v === "enterprise" || v === "企业服务行业") return "互联网与科技服务";
  if (v.includes("factory") || v.includes("manufact")) return "制造业";
  if (v.includes("gov") || v.includes("public")) return "政企服务";
  return String(value).trim();
}

function normalizeClientName(value: string | undefined | null): string | undefined {
  const v = String(value ?? "").trim();
  if (!v) return undefined;
  const lower = v.toLowerCase();
  if (
    v === "示例企业" ||
    v.includes("未提供") ||
    lower === "enterprise" ||
    lower.includes("attaguy-plan") ||
    /(^|[-_])plan([-_]|$)/i.test(v) ||
    /^[a-z0-9-]{8,}$/i.test(v)
  ) {
    return undefined;
  }
  return v;
}

function buildTenderProjectName(clientName: string | undefined): string {
  const safeClientName = normalizeClientName(clientName);
  if (safeClientName) {
    return `${safeClientName}员工健身空间建设项目`;
  }
  return "某企业员工健身空间建设项目";
}

export function normalizeProject(project: ProjectLike | ProjectRecord): ProjectRecord {
  if (
    project &&
    typeof project === "object" &&
    "input" in project &&
    (project as ProjectRecord).input &&
    typeof (project as ProjectRecord).input === "object"
  ) {
    return project as ProjectRecord;
  }
  const p = project as ProjectLike;
  const normalizedClientName = normalizeClientName(p.clientName);
  return {
    id: p.id,
    input: {
      name: buildTenderProjectName(normalizedClientName),
      clientName: normalizedClientName,
      industry: normalizeIndustry(p.industry),
      siteType: p.siteType as ProjectRecord["input"]["siteType"],
      areaM2: p.areaM2 ?? undefined,
      targetUsers: p.targetUsers ?? undefined,
      city: cleanField(p.city, "上海市"),
      budgetLevel: p.budgetLevel as ProjectRecord["input"]["budgetLevel"],
      deliveryMode: p.deliveryMode as ProjectRecord["input"]["deliveryMode"],
      notes: p.notes ?? undefined,
    },
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export function normalizeSolution(solution: SolutionLike | SolutionRecord): SolutionRecord {
  if (
    solution &&
    typeof solution === "object" &&
    typeof (solution as SolutionRecord).createdAt === "string"
  ) {
    return solution as SolutionRecord;
  }
  const s = solution as SolutionLike;
  const cleanedSummary = (s.summary || "")
    .replace("方案骨架 + 可替换占位配置", "完整投标方案")
    .replace("方案骨架+可替换占位配置", "完整投标方案")
    .replace("示例", "项目")
    .replace("可替换占位配置", "标准化配置设计")
    .replace("无 SKU", "现有需求基础上");

  const rewrittenRequirements = toStringArray(s.requirements).map((line) =>
    line
      .replace("在缺少具体商品库的情况下，仍需输出可执行的标准化建议配置。", "本方案在现有需求基础上，结合行业经验形成完整配置建议，满足项目实施与预算评审要求。")
      .replace("方案应兼顾功能、成本、施工、运维与长期稳定性。", "方案兼顾技术适配、实施效率、建设成本与长期运维可靠性。"),
  );

  const rewrittenObjectives = toStringArray(s.objectives).map((line) =>
    line
      .replace("在无 SKU 情况下仍可输出完整预算与配置框架。", "本方案形成可执行的配置框架与预算依据，可支持评审与落地实施。")
      .replace("为后续商品系统接入预留可替换映射层。", "本方案采用标准化配置设计，具备良好的扩展性与适配能力，可根据实际采购需求进行灵活调整。"),
  );

  return {
    id: s.id,
    projectId: s.projectId,
    summary:
      cleanedSummary ||
      "本投标文件依据招标需求形成完整实施方案，覆盖配置、实施、交付与运维全流程。",
    background: s.background,
    requirements: rewrittenRequirements,
    objectives: rewrittenObjectives,
    zoning: Array.isArray(s.zoning)
      ? (s.zoning as SolutionRecord["zoning"])
      : [],
    implementationPlan: Array.isArray(s.implementationPlan)
      ? (s.implementationPlan as SolutionRecord["implementationPlan"])
      : [],
    operationsPlan: toStringArray(s.operationsPlan),
    riskControl: toStringArray(s.riskControl),
    acceptanceCriteria: toStringArray(s.acceptanceCriteria),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function normalizePlaceholders(rows: PlaceholderLike[] | ProductPlaceholder[]): ProductPlaceholder[] {
  if (!rows.length) return [];
  const first = rows[0] as ProductPlaceholder & PlaceholderLike;
  if (typeof first.createdAt === "string") {
    return rows as ProductPlaceholder[];
  }
  return (rows as PlaceholderLike[]).map((row) => ({
    id: row.id,
    projectId: row.projectId,
    category: row.category,
    subCategory: row.subCategory ?? undefined,
    specTags: toStringArray(row.specTags),
    quantity: row.quantity,
    priceBand: row.priceBand as ProductPlaceholder["priceBand"],
    recommendationReason: row.recommendationReason,
    replaceable: row.replaceable,
    skuId: row.skuId ?? undefined,
    skuName: row.skuName ?? undefined,
    brand: row.brand ?? undefined,
    model: row.model ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

/** 投标正文常用语境（与封面/页眉「AI Fitness Solution / TF-」体系一致） */
type TenderContext = {
  projectName: string;
  company: string;
  city: string;
  industry: string;
  areaLabel: string;
  usersLabel: string;
  tenderNo: string;
  brand: string;
  siteType: string;
  budgetLevel: string;
  deliveryMode: string;
};

function buildTenderContext(
  project: ProjectRecord,
  docCtx?: TenderDocumentContext,
): TenderContext {
  const projectName = buildTenderProjectName(project.input.clientName);
  return {
    projectName,
    company: cleanField(project.input.clientName, "某企业"),
    city: cleanField(project.input.city, "上海市"),
    industry: normalizeIndustry(project.input.industry),
    areaLabel:
      project.input.areaM2 != null
        ? `${project.input.areaM2} 平方米`
        : "以现场复核及招标文件为准",
    usersLabel:
      project.input.targetUsers != null
        ? `约 ${project.input.targetUsers} 人`
        : "以招标文件及现场踏勘为准",
    tenderNo: docCtx?.tenderId ?? `TF-${project.id.slice(0, 8).toUpperCase()}`,
    brand: docCtx?.brand ?? "AI Fitness Solution",
    siteType: String(project.input.siteType ?? "office"),
    budgetLevel: String(project.input.budgetLevel ?? "mid"),
    deliveryMode: String(project.input.deliveryMode ?? "tender"),
  };
}

function stripLeadingNumberMark(s: string): string {
  return s
    .trim()
    .replace(/^\(?[一二三四五六七八九十百千]+\)?[、．.]?\s*/, "")
    .replace(/^\d+[\.\)、]\s*/, "");
}

/**
 * 企业内容扩写：当 solution 侧条目过少时，拼接标准化投标句式，提升章节密度。
 * 注意：`SolutionRecord` 无 `principles`/`response` 字段，调用方传入对应数组即可。
 */
function expandEnterpriseLines(
  base: string[],
  type: "requirements" | "principles" | "risk" | "response",
): string[] {
  const b = base?.filter((x) => String(x ?? "").trim()) ?? [];
  if (b.length >= 5) return b;

  const templates: Record<
    "requirements" | "principles" | "risk" | "response",
    string[]
  > = {
    requirements: [
      "结合项目所在城市与行业特征，对高峰使用与设备冗余提出针对性措施",
      "建立“需求—方案—配置—验收”闭环映射，支撑评标快速核验",
      "明确关键接口（配电、网络、消防）复核机制，降低实施风险",
    ],
    principles: [
      "坚持“标准化 + 可替换”，降低长期改造成本",
      "坚持“可评审、可交付、可运维”原则",
      "统筹全生命周期成本，避免隐性成本外溢",
    ],
    response: [
      "形成技术响应矩阵，确保关键指标满足招标要求",
      "商务条款与交付节点形成闭环，确保可追溯",
      "建立质量与安全双重控制机制",
      "技术响应：依据招标技术条款逐项响应，关键参数给出下限与证明材料索引",
      "商务响应：交付、安装、培训、验收及售后与合同节点一致，承诺可验证",
      "文档与变更：统一版本号与变更审批，会议纪要、变更单与图纸版本同步归档",
      "保密与合规：对数据、影像、人员信息处理给出合规要求与责任边界（如适用）",
    ],
    risk: [
      "建立风险台账与跟踪机制，确保风险闭环管理",
      "设置关键里程碑复核节点",
      "结合项目特性制定应急预案",
      "质量与安全双重控制：过程检查与结果验收并行，关键节点留存影像与签字记录",
      "技术风险：设备兼容与联调——联调用例、联合测试与回退策略",
      "交付风险：现场条件与施工窗口——里程碑+缓冲+周度滚动复盘",
      "采购风险：供货周期与品牌替代——同等级备选清单与到货预警",
      "运维风险：移交与响应——移交包、培训考核与 SLA 量化指标",
    ],
  };

  const merged = [...b, ...(templates[type] || [])];
  const pad = templates[type] || [];
  let i = 0;
  while (merged.length < 5 && pad.length > 0) {
    merged.push(pad[i % pad.length]);
    i++;
  }
  return merged;
}

/** 以 seed 为主，不足 min 条时用 pad 去重补齐，统一编号 */
function ensureMinNumberedLines(seed: string[], pad: string[], min: number): string[] {
  const cleaned = seed.map((s) => stripLeadingNumberMark(s)).filter(Boolean);
  const out: string[] = [...cleaned];
  let i = 0;
  while (out.length < min && i < pad.length * 4) {
    const p = stripLeadingNumberMark(pad[i % pad.length]);
    if (p && !out.some((x) => x === p)) out.push(p);
    i++;
  }
  return out.map((t, idx) => `${idx + 1}. ${t}`);
}

function numberedFromStrings(items: string[]): string[] {
  return items.map((t, idx) => `${idx + 1}. ${stripLeadingNumberMark(t)}`);
}

/** 单条配置项：企业版「技术响应 / 商务响应 / 说明」三段式 */
function expandConfigLine(
  p: ProductPlaceholder,
  i: number,
  ctx: TenderContext,
): string[] {
  const tags = p.specTags.length ? p.specTags.join(" / ") : "按招标文件技术条款与行业通用规范";
  const sub = p.subCategory ? `（${p.subCategory}）` : "";
  const band =
    p.priceBand === "high" ? "高档" : p.priceBand === "low" ? "经济档" : "中档";
  const title = `${p.category}${sub}`;
  const replaceNote = p.replaceable
    ? "允许同等级替代，须提供参数对照表并经招标人书面确认"
    : "原则上固定配置，变更须履行变更审批";
  return [
    `${i + 1}. ${title}（建议数量 ${p.quantity} 台/套；档次：${band}）`,
    `   技术响应：满足招标技术条款与安全规范；技术要点 ${tags}；${replaceNote}`,
    `   商务响应：供货、安装、培训、质保可追溯；与 ${ctx.brand} 交付体系及合同节点对齐`,
    `   说明：${p.recommendationReason || "满足分区功能与使用强度要求"}；中标后可按集采结果替换确定型号；不含土建改造与特殊吊装（另有约定除外）`,
  ];
}

/** 无占位行时的标准分区配置（企业版三段式） */
function syntheticConfigItemLines(
  index: number,
  name: string,
  qty: number,
  ctx: TenderContext,
): string[] {
  return [
    `${index}. ${name}（建议数量：${qty}，可按现场复核调整；档次与预算等级「${ctx.budgetLevel}」匹配）`,
    "   技术响应：满足招标技术条款与安全规范；提供参数下限、安装条件与验收口径",
    "   商务响应：供货、安装、培训、质保可追溯；交付节点与合同文本一致",
    "   说明：标准化建议配置，用于投标评审；中标后可按集采结果替换型号",
  ];
}

function buildConfigBodyLines(
  placeholders: ProductPlaceholder[],
  ctx: TenderContext,
): string[] {
  if (placeholders.length > 0) {
    return placeholders.flatMap((p, i) => expandConfigLine(p, i, ctx));
  }
  const userNum = parseInt(ctx.usersLabel.match(/\d+/)?.[0] ?? "200", 10) || 200;
  const packs = [
    {
      name: "有氧训练区（跑步机/椭圆机/单车等）",
      qty: Math.max(4, Math.round(userNum / 45)),
    },
    {
      name: "力量训练区（综合训练架/哑铃/杠铃系统等）",
      qty: Math.max(6, Math.round(userNum / 35)),
    },
    { name: "功能性训练区（药球/壶铃/地胶/小工具）", qty: 1 },
    { name: "智能管理与数据看板（如招标含智能化）", qty: 1 },
    { name: "更衣储物与配套设施", qty: 1 },
  ];
  return packs.flatMap((pack, i) =>
    syntheticConfigItemLines(i + 1, pack.name, pack.qty, ctx),
  );
}

/** 实施计划：每阶段含工作任务、阶段交付物、控制要点 */
function buildImplementationBodyLines(solution: SolutionRecord): string[] {
  const phases = solution.implementationPlan?.length
    ? solution.implementationPlan
    : [
        {
          title: "项目启动与现场联合踏勘",
          durationDays: 4,
          tasks: [
            "现场踏勘与施工条件复核",
            "交付边界与沟通机制确认",
            "风险前置评估与整改建议",
          ],
          deliverables: ["现场条件确认记录", "项目启动清单"],
        },
        {
          title: "方案深化与配置确认",
          durationDays: 6,
          tasks: ["空间深化", "配置清单确认", "接口与验收口径交圈"],
          deliverables: ["深化方案", "建议配置清单", "技术参数对照表"],
        },
        {
          title: "供货安装与调试验收",
          durationDays: 10,
          tasks: ["设备进场", "安装调试", "联调测试"],
          deliverables: ["安装记录", "调试报告", "阶段验收单"],
        },
        {
          title: "培训移交与质保服务",
          durationDays: 4,
          tasks: ["分层培训", "试运行", "运维移交"],
          deliverables: ["培训记录", "交付验收单", "运维移交包"],
        },
      ];

  return phases.flatMap((p, i) => {
    const dur =
      p.durationDays != null
        ? `（计划周期：${p.durationDays} 日历天，可结合招标工期调整）`
        : "";
    const head = `${i + 1}. ${p.title}${dur}`;
    const taskLines = (p.tasks ?? []).map((t, j) => `   （${j + 1}）${t}`);
    const delivList =
      p.deliverables?.length > 0
        ? p.deliverables.join("；")
        : "阶段成果文件；过程检查记录";
    const deliv = `   阶段交付物：${delivList}`;
    const note =
      "   控制要点：关键假设、外协边界与风险项同步登记至风险台账；本阶段输出经项目经理与质量负责人联合评审后方可进入下一阶段";
    return [head, ...taskLines, deliv, note, ""];
  });
}

function buildScoreBodyLines(solution: SolutionRecord): string[] {
  const scorePad = [
    "企业能力与类似业绩：项目管理、质量控制与售后服务体系（按招标要求组织材料索引）",
    "技术方案先进性：系统化设计、可扩展架构与节能降耗措施（如适用）",
    "服务方案完整性：培训、响应、巡检、备件与升级机制闭环",
    "配置合理性：分区配置与人数/面积匹配，参数下限满足评审与安全要求",
    "进度与里程碑：关键节点、工期假设与缓冲设置合理",
    "安全与合规：用电、荷载、消防接口、应急疏散等要求有明确响应",
    "培训与移交：培训对象、频次、材料与考核方式明确；移交清单可核对",
    "商务一致性：技术方案与报价/服务条款口径一致，避免承诺冲突",
  ];
  const seed = solution.acceptanceCriteria ?? [];
  const merged = [...seed];
  for (const p of scorePad) {
    if (merged.length >= 8) break;
    if (!merged.some((x) => stripLeadingNumberMark(x) === stripLeadingNumberMark(p))) {
      merged.push(p);
    }
  }
  while (merged.length < 6 && scorePad.length > 0) {
    merged.push(scorePad[merged.length % scorePad.length]);
  }
  return merged;
}

function buildAttachmentBodyLines(ctx: TenderContext): string[] {
  return [
    `封面与文件有效性说明（含 ${ctx.tenderNo}、版本与签章页索引）`,
    "投标声明与承诺（法人授权、真实性声明、廉洁承诺等，按招标格式）",
    "空间分区与动线说明（含平面示意、高峰流线与安全疏散要点）",
    "建议配置清单与技术参数对照表（含品牌档次、替代原则与下限指标）",
    "技术参数对照表（逐项映射招标条款，含关键性能指标与证明材料索引）",
    "实施组织计划与进度安排（含里程碑、资源配置、并行策略与缓冲）",
    "质量安全与文明施工措施（含检查表、记录模板与责任分工）",
    "培训、试运行与交付验收方案（含验收标准、抽样方法与证据留存）",
    "验收标准与交付清单（含抽样方法、签字确认与资料归档要求）",
    "售后服务与质保承诺（含响应时效、到场时限、备件与升级机制）",
    "售后服务承诺书（SLA、质保范围、升级路径与联系方式）",
  ];
}

function buildAppendixBodyLines(): string[] {
  return [
    "术语与定义：对“验收”“移交”“试运行”“质保”“SLA”等关键词给出本文件口径",
    "实施边界与责任分工：明确招标人、投标人、总包/物业、第三方检测等角色界面",
    "运维响应机制与 SLA：故障分级、响应时效、远程支持、现场到场与升级路径",
    "质量保证与持续优化：质量目标、关键 KPI、复盘机制与改进闭环",
    "数据与隐私（如适用）：采集范围、存储策略、权限控制与审计要求",
    "环保与节能（如适用）：能耗控制、噪声控制与设备能效策略",
    "保密与资料管理：涉密资料、电子版分发、留存期限与销毁规则",
    "知识产权与成果归属：方案成果、软件授权与商标使用范围约定提示",
  ];
}

function buildSections(input: {
  project: ProjectRecord;
  solution: SolutionRecord;
  placeholders: ProductPlaceholder[];
  tier: UserTier;
  tenderDocument?: TenderDocumentContext;
}): Section[] {
  const { project, solution, placeholders, tier, tenderDocument } = input;
  const ctx = buildTenderContext(project, tenderDocument);

  const overviewIntro =
    `本章节对「${ctx.projectName}」的立项背景、建设目标与方案边界进行说明。文件编号 ${ctx.tenderNo}，品牌体系 ${ctx.brand}，` +
    `场地类型 ${ctx.siteType}，交付模式 ${ctx.deliveryMode}。以下表述以招标文件、答疑纪要及现场踏勘为准，并作为后续技术澄清与合同谈判的依据。`;

  const overviewBullets = [
    `投标主体：${ctx.company}；项目城市：${ctx.city}；行业属性：${ctx.industry}`,
    `建设规模：建筑面积（或服务面积）${ctx.areaLabel}；服务人口规模：${ctx.usersLabel}`,
    `方案综述：${solution.summary}`,
    `建设背景与目标：${solution.background || "围绕员工健康促进、空间利用率提升与可持续运营目标，构建安全、专业、易管理的员工健身空间。"}`,
    `编制范围：覆盖空间规划、设备建议、实施组织、培训验收、运维移交与质保服务；不含招标人另行委托的第三方专项（以合同约定为准）`,
    `质量与安全原则：满足国家及地方相关规范，突出结构安全、用电安全、运动安全与应急管理`,
    `文件体系：与 ${ctx.brand} 品牌技术体系对齐，正文、附件与页眉版本号保持一致，便于归档与追溯`,
    `评审提示：本章关键信息在后续“需求理解”“评分项对照”等章节形成交叉引用，评标时可对照核验`,
  ];

  const requirementsLines = [
    "【需求理解】本章从业务目标、使用场景与约束条件进行系统分析。",
    "",
    ...numberedFromStrings(
      expandEnterpriseLines(solution.requirements ?? [], "requirements"),
    ),
  ];

  const principlesLines = [
    "【方案设计原则】本章提出总体设计原则与技术路线。",
    "",
    ...numberedFromStrings(
      expandEnterpriseLines(solution.objectives ?? [], "principles"),
    ),
  ];

  const zoning = solution.zoning.map((z, i) => {
    const ratio =
      typeof z.areaRatio === "number" ? `；面积占比约 ${Math.round(z.areaRatio * 100)}%` : "";
    const cap = typeof z.capacity === "number" ? `；设计容量约 ${z.capacity} 人` : "";
    return `${i + 1}. ${z.name}：${z.purpose}${ratio}${cap}`;
  });
  const zoningPad = [
    `主通道宽度与转弯半径满足设备搬运与消防疏散要求；高峰动线避免交叉冲突`,
    `分区隔声与振动控制：力量区与有氧区合理分隔，关键墙面采取减振降噪措施（按现场条件深化）`,
    `通风与异味控制：结合新风排风与清洁频次，保障更衣区与训练区体感品质`,
    `强弱电与点位预留：按智能化与看板扩展预留管线与接口，避免二次开槽`,
  ];
  const zoningLines = addIntroIfShort(
    ensureMinNumberedLines(
      zoning.length ? zoning : ["按招标场地条件完成分区布局与动线优化并形成评审版图纸包"],
      zoningPad,
      6,
    ),
    "【空间规划】在满足招标文件分区要求的前提下，结合使用强度、管理半径与运维效率进行动线组织与面积配比优化。",
    999,
  );

  const configLines = [
    "【建议配置清单】以下为分区配置建议，用于投标技术评审；每项含技术响应、商务响应与说明，中标后以合同清单与集采结果固化。",
    "",
    ...buildConfigBodyLines(placeholders, ctx),
  ];

  const implementationLines = [
    "【实施计划】本章以里程碑组织交付，强调并行策略、质量控制点与证据留存，与商务/技术条款一致。",
    "",
    ...buildImplementationBodyLines(solution),
  ];

  const responseLines = [
    "【商务/技术响应摘要】本节从评标视角归纳响应策略，形成技术—商务—质量闭环。",
    "",
    ...numberedFromStrings(
      expandEnterpriseLines(solution.operationsPlan ?? [], "response"),
    ),
  ];

  const scoreLines = [
    "【评分项对照】本章将关键评分维度拆解为可核验条目，并与正文各章形成交叉引用。",
    "",
    ...numberedFromStrings(buildScoreBodyLines(solution)),
  ];

  const riskLines = [
    "【风险与对策】建立风险识别—评估—应对闭环，含风险台账、里程碑复核、应急预案与质量安全机制。",
    "",
    ...numberedFromStrings(
      expandEnterpriseLines(solution.riskControl ?? [], "risk"),
    ),
  ];

  const attachmentLines = [
    "【附件索引】附件与正文引用一一对应，评标阶段可按索引快速核验；涉及“见附件”处以最新版本为准。",
    "",
    ...numberedFromStrings(buildAttachmentBodyLines(ctx)),
  ];

  const appendixLines = [
    "【附录说明】以下附录解释术语、边界与运维机制；正文与附录不一致时，以招标文件及合同约定为准。",
    "",
    ...numberedFromStrings(buildAppendixBodyLines()),
  ];

  const fullSections: Section[] = [
    {
      key: "overview",
      title: "1. 项目概述",
      lines: [overviewIntro, "", ...numberedFromStrings(overviewBullets)],
    },
    {
      key: "requirements",
      title: "2. 需求理解",
      lines: requirementsLines,
    },
    {
      key: "principles",
      title: "3. 方案设计原则",
      lines: principlesLines,
    },
    {
      key: "zoning",
      title: "4. 空间规划",
      lines: zoningLines,
    },
    {
      key: "config",
      title: "5. 建议配置清单",
      lines: configLines,
    },
    {
      key: "implementation",
      title: "6. 实施计划",
      lines: implementationLines,
    },
    {
      key: "response",
      title: "7. 商务/技术响应摘要",
      lines: responseLines,
    },
    {
      key: "score",
      title: "8. 评分项对照",
      lines: scoreLines,
    },
    {
      key: "risk",
      title: "9. 风险与对策",
      lines: riskLines,
    },
    {
      key: "attachments",
      title: "10. 附件索引",
      lines: attachmentLines,
    },
    {
      key: "appendix",
      title: "11. 计划书相关附录",
      lines: appendixLines,
    },
  ];

  if (tier === "free") {
    const freeKeys = new Set(["overview", "requirements", "principles", "zoning", "config"]);
    return fullSections.filter((section) => freeKeys.has(section.key));
  }
  return fullSections;
}

function addIntroIfShort(lines: string[], intro: string, minTotalLines: number): string[] {
  if (lines.length >= minTotalLines) return lines;
  return [intro, "", ...lines];
}

function paginateSection(section: Section, font: PDFFont): SectionPage[] {
  const maxWidth = PAGE_WIDTH - MARGIN_X * 2;
  const maxLinesPerPage = Math.max(
    8,
    Math.floor((BODY_TOP - BODY_BOTTOM) / (LINE_HEIGHT * 1.14)),
  );
  const wrapped = section.lines.flatMap((line) =>
    wrap(line, font, BODY_SIZE, maxWidth),
  );
  if (!wrapped.length) wrapped.push("—");

  const pages: SectionPage[] = [];
  for (let i = 0; i < wrapped.length; i += maxLinesPerPage) {
    pages.push({
      sectionKey: section.key,
      sectionTitle: section.title,
      pageNoInSection: pages.length + 1,
      lines: wrapped.slice(i, i + maxLinesPerPage),
    });
  }
  return pages;
}

/** 声明页：安全换行（剔除空行） */
function safeTextLines(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  return wrap(text, font, fontSize, maxWidth).filter((line) => line.length > 0);
}

/** 声明页主标题 + 下分隔线 */
function drawLabelLine(
  page: PDFPage,
  font: PDFFont,
  label: string,
  x: number,
  y: number,
  opts: {
    fontSize?: number;
    color?: ReturnType<typeof rgb>;
    ruleColor?: ReturnType<typeof rgb>;
    ruleOffset?: number;
    maxWidth?: number;
  },
): number {
  const fontSize = opts.fontSize ?? 22;
  const color = opts.color ?? rgb(0.12, 0.2, 0.4);
  const ruleOffset = opts.ruleOffset ?? 18;
  const maxWidth = opts.maxWidth ?? PAGE_WIDTH - x * 2;

  page.drawText(label, { x, y, size: fontSize, font, color });
  const ruleY = y - ruleOffset;
  page.drawLine({
    start: { x, y: ruleY },
    end: { x: x + maxWidth, y: ruleY },
    thickness: 1.1,
    color: opts.ruleColor ?? rgb(0.78, 0.82, 0.9),
  });
  return ruleY - 14;
}

/** 声明页：公文段落（自动换行 + 段间距） */
function drawFormalParagraph(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  layout: {
    maxWidth: number;
    fontSize: number;
    lineHeight: number;
    gapAfter: number;
    firstLineIndent?: number;
    color: ReturnType<typeof rgb>;
    minY: number;
  },
): number {
  const indent = layout.firstLineIndent ?? 0;
  const lines = safeTextLines(text, font, layout.fontSize, layout.maxWidth - indent);
  const needed = lines.length * layout.lineHeight;
  if (y - needed < layout.minY) {
    return layout.minY;
  }
  let cy = y;
  for (let i = 0; i < lines.length; i++) {
    page.drawText(lines[i], {
      x: i === 0 ? x + indent : x,
      y: cy,
      size: layout.fontSize,
      font,
      color: layout.color,
    });
    cy -= layout.lineHeight;
  }
  return cy - layout.gapAfter;
}

async function drawCover(
  doc: PDFDocument,
  font: PDFFont,
  input: {
    project: ProjectRecord;
    solution: SolutionRecord;
    tenderDocument?: TenderDocumentContext;
  },
): Promise<void> {
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  await drawCommercialCoverV3(doc, page, font, {
    companyName: cleanField(input.project.input.clientName, "某企业"),
    projectName: buildTenderProjectName(input.project.input.clientName),
    tenderNo:
      input.tenderDocument?.tenderId ??
      `TF-${input.project.id.slice(0, 8).toUpperCase()}`,
    dateText: formatCoverDateIso(),
    volumeSubtitle: TENDER_PLAN_VOLUME_SUBTITLE,
  });
}

function drawDeclaration(doc: PDFDocument, font: PDFFont): void {
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const contentWidth = PAGE_WIDTH - MARGIN_X * 2;
  const titleColor = rgb(0.12, 0.2, 0.4);
  const bodyColor = rgb(0.14, 0.14, 0.16);
  const mutedColor = rgb(0.35, 0.35, 0.38);

  const boxX = MARGIN_X;
  const boxY = 56;
  const boxWidth = contentWidth;
  const boxHeight = 108;
  const BODY_SIG_GAP = 52;
  const bodyMinY = boxY + boxHeight + BODY_SIG_GAP;

  let y = drawLabelLine(page, font, "投标声明与承诺", MARGIN_X, PAGE_HEIGHT - 108, {
    fontSize: 22,
    color: titleColor,
    maxWidth: contentWidth,
  });

  page.drawText("（正式投标文件 · 技术标组成部分）", {
    x: MARGIN_X,
    y: y - 6,
    size: 10,
    font,
    color: mutedColor,
  });
  y -= 40;

  y = drawFormalParagraph(page, font, "致：招标人 / 评标委员会：", MARGIN_X, y, {
    maxWidth: contentWidth,
    fontSize: 12,
    lineHeight: 25,
    gapAfter: 26,
    color: bodyColor,
    minY: bodyMinY,
  });

  const bodyParagraphs = [
    "本单位自愿参与本项目投标，并确认已充分阅读、理解并接受招标文件及其澄清、修改的全部内容。",
    "本单位确认：本投标方案文件由 AI Fitness Solution 技术体系支撑编制，内容真实、准确、完整，不存在虚假记载、误导性陈述或重大遗漏。",
    "本单位承诺：如我单位中标，将严格按照招标文件、合同约定及本投标文件的技术与商务承诺组织交付，接受招标人及监理单位的监督与检查。",
    "本单位承诺：对涉及知识产权、商业秘密与第三方合法权益的内容，已依法取得授权或已完成合规审查；如存在争议，由本单位承担相应责任。",
    "本单位承诺：在投标有效期内不撤销投标文件；中标后按招标文件规定签订合同并提交履约担保（如要求）。",
    "本单位承诺：严格遵守廉洁投标与公平竞争原则，不向招标人及相关人员提供不正当利益。",
    "本单位确认：已建立与本项目相匹配的项目管理、质量、安全与售后服务体系，具备按期交付与持续服务能力。",
    "本单位确认：对现场条件、工期假设与风险因素已进行合理评估，并将在合同谈判阶段进一步细化并形成可执行计划。",
  ];

  const paraLayout = {
    maxWidth: contentWidth,
    fontSize: 11,
    lineHeight: 23,
    gapAfter: 22,
    firstLineIndent: 24,
    color: bodyColor,
    minY: bodyMinY,
  };

  for (const para of bodyParagraphs) {
    if (y <= bodyMinY) break;
    y = drawFormalParagraph(page, font, para, MARGIN_X, y, paraLayout);
  }

  if (y > bodyMinY + 120) {
    y = drawTenderClosingBlock(page, font, {
      marginL: MARGIN_X,
      startY: Math.min(y - 32, PAGE_HEIGHT - 280),
    });
    y -= 40;
  }

  const signBorder = rgb(0.72, 0.72, 0.72);
  const signLineColor = rgb(0.45, 0.45, 0.45);
  const lineStartX = boxX + 148;
  const lineWidth = 240;
  const row1Y = boxY + 78;
  const row2Y = boxY + 50;
  const row3Y = boxY + 22;

  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    borderWidth: 0.8,
    borderColor: signBorder,
  });

  page.drawText(TENDER_DECLARATION_SIGN_TITLE, {
    x: boxX + 14,
    y: boxY + 88,
    size: 11,
    font,
    color: titleColor,
  });

  const drawSignRow = (label: string, rowY: number) => {
    page.drawText(label, {
      x: boxX + 14,
      y: rowY,
      size: 10.5,
      font,
      color: bodyColor,
    });
    page.drawLine({
      start: { x: lineStartX, y: rowY + 3 },
      end: { x: lineStartX + lineWidth, y: rowY + 3 },
      thickness: 0.9,
      color: signLineColor,
    });
  };

  drawSignRow(TENDER_SIGN_LABEL_COMPANY, row1Y);
  drawSignRow(TENDER_SIGN_LABEL_REPRESENTATIVE, row2Y);
  drawSignRow(TENDER_SIGN_LABEL_DATE, row3Y);
}

/** 目录正文：去掉章节标题里自带的「1.」「2.」前缀，由 TOC 自行两位编号 */
function tocStripLeadingEnumerate(title: string): string {
  const t = String(title || "").trim();
  return t.replace(/^\s*\d{1,3}\s*[\.．、]\s*/, "").trim() || t;
}

/** 章节页眉：解析「N. 标题」为序号 + 纯标题（与目录两位编号一致） */
function sectionParseChapterOrdinal(title: string): { n: number; rest: string } {
  const raw = String(title || "").trim();
  const m = raw.match(/^(\d{1,3})\s*[\.．、]\s*(.*)$/);
  if (!m) return { n: 0, rest: raw };
  const n = parseInt(m[1], 10);
  const rest = m[2].trim();
  return { n, rest: rest || raw };
}

function sectionFormatChapterDigits(n: number): string {
  if (n <= 0) return "";
  if (n < 100) return String(n).padStart(2, "0");
  return String(n);
}

/** 一级章节英文副标题（固定映射 / 全大写渲染） */
const SECTION_EN_SUBTITLE: Record<string, string> = {
  overview: "PROJECT OVERVIEW",
  requirements: "REQUIREMENT ANALYSIS",
  principles: "DESIGN PRINCIPLES",
  zoning: "SPACE PLANNING",
  config: "RECOMMENDED CONFIGURATION",
  implementation: "IMPLEMENTATION PLAN",
  response: "COMMERCIAL & TECHNICAL RESPONSE",
  score: "SCORING MATRIX",
  risk: "RISKS & MITIGATION",
  attachments: "ATTACHMENT INDEX",
  appendix: "APPENDICES",
};

function tocEllipsisToWidth(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string {
  const s = String(text || "").trim();
  if (!s) return "";
  if (font.widthOfTextAtSize(s, size) <= maxWidth) return s;
  const ell = "…";
  let t = s;
  while (t.length > 0 && font.widthOfTextAtSize(t + ell, size) > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + ell;
}

function drawTocLeader(
  page: PDFPage,
  font: PDFFont,
  fromX: number,
  toX: number,
  yBaseline: number,
  dotSize: number,
  dotColor: ReturnType<typeof rgb>,
): void {
  if (toX - fromX < 12) return;
  const dot = ".";
  const singleW = Math.max(font.widthOfTextAtSize(dot, dotSize), 1.6);
  const gap = singleW + PLAN_TOC_LEADER_GAP;
  const dotY = yBaseline + 1.5;
  let x = fromX;
  while (x + singleW <= toX - 1) {
    page.drawText(dot, {
      x,
      y: dotY,
      size: dotSize,
      font,
      color: dotColor,
    });
    x += gap;
  }
}

function drawPublishingTocHeader(
  page: PDFPage,
  font: PDFFont,
  W: number,
  margin: number,
  mainTitle: string,
  volSubtitle: string,
  ruleColor: ReturnType<typeof rgb>,
): number {
  const brand = rgb(0.14, 0.22, 0.38);
  const muted = rgb(0.46, 0.48, 0.51);
  const mainSize = 22;

  page.drawText(mainTitle, {
    x: (W - font.widthOfTextAtSize(mainTitle, mainSize)) / 2,
    y: BODY_TOP,
    size: mainSize,
    font,
    color: brand,
  });

  let yTop = BODY_TOP - 40;
  const volSize = 10;
  page.drawText(volSubtitle, {
    x: (W - font.widthOfTextAtSize(volSubtitle, volSize)) / 2,
    y: yTop,
    size: volSize,
    font,
    color: muted,
  });

  yTop -= 24;
  const cnTitle = "目录";
  const cnSize = 8.5;
  page.drawText(cnTitle, {
    x: (W - font.widthOfTextAtSize(cnTitle, cnSize)) / 2,
    y: yTop,
    size: cnSize,
    font,
    color: muted,
  });

  yTop -= 38;
  drawEditorialDivider(page, yTop, margin, W, 1, ruleColor, 0.2);
  return yTop - 62;
}

/**
 * 商业级目录（固定页码右边界 + leader dots）。
 * 二级条目预留：可为 { title, page }[]，缩进 + 小号灰字；本轮仅占位注释。
 */
function drawToc(
  doc: PDFDocument,
  font: PDFFont,
  sections: Section[],
  firstPageMap: Record<string, number>,
): void {
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const ink = rgb(0.08, 0.1, 0.14);
  const leaderColor = EDITORIAL_TOC_LEADER_COLOR;
  const ruleColor = rgb(0.86, 0.88, 0.92);
  const pageInk = rgb(0.18, 0.2, 0.24);

  const W = PAGE_WIDTH;
  const margin = MARGIN_X;

  const rowFont = 11;
  const pageNoRightX = W - margin;

  const tocNumColW =
    font.widthOfTextAtSize(String(Math.max(sections.length, 11)).padStart(2, "0"), rowFont) + 14;

  const titleNumX = margin;
  const titleBodyX = margin + tocNumColW;

  const rowStep = PLAN_TOC_ROW_STEP;
  const leaderDotSize = FREEZE_TOC_LEADER_DOT_SIZE;
  let y = drawPublishingTocHeader(
    page,
    font,
    W,
    margin,
    "DOCUMENT STRUCTURE",
    "Technical Proposal Volume",
    ruleColor,
  );

  sections.forEach((section, idx) => {
    const chap = String(idx + 1).padStart(2, "0");
    const bodySrc = tocStripLeadingEnumerate(section.title);
    const pageNo = firstPageMap[section.key] ?? "-";
    const pageStr =
      typeof pageNo === "number" ? String(pageNo).padStart(2, " ") : String(pageNo);

    const pageW = font.widthOfTextAtSize(pageStr.trim(), rowFont);
    const pageTextX = pageNoRightX - pageW;

    const leaderTo = pageTextX - 14;
    const maxBodyPx = Math.max(40, leaderTo - titleBodyX - 12);
    const bodyShown = tocEllipsisToWidth(bodySrc, font, rowFont, maxBodyPx);

    page.drawText(chap, {
      x: titleNumX,
      y,
      size: rowFont,
      font,
      color: EDITORIAL_TOC_CHAP_COLOR,
    });

    page.drawText(bodyShown, {
      x: titleBodyX,
      y,
      size: rowFont,
      font,
      color: ink,
    });

    const bodyW = font.widthOfTextAtSize(bodyShown, rowFont);
    const leaderFrom = titleBodyX + bodyW + 12;
    drawTocLeader(page, font, leaderFrom, leaderTo, y, leaderDotSize, leaderColor);

    page.drawText(pageStr.trim(), {
      x: pageTextX,
      y,
      size: rowFont,
      font,
      color: pageInk,
    });

    y -= rowStep;
    if (y < BODY_BOTTOM) return;
  });
}

/** Tender Pack 总目录行（与 drawToc 版式、dots、页码右对齐一致） */
export type PackTocRow = {
  chap: string;
  titleZh: string;
  page1Based: number | string;
};

export function drawPackTocPage(doc: PDFDocument, font: PDFFont, rows: PackTocRow[]): void {
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const ink = rgb(0.08, 0.1, 0.14);
  const leaderColor = EDITORIAL_TOC_LEADER_COLOR;
  const ruleColor = rgb(0.86, 0.88, 0.92);
  const pageInk = rgb(0.18, 0.2, 0.24);

  const W = PAGE_WIDTH;
  const margin = MARGIN_X;
  const rowFont = 11;
  const pageNoRightX = W - margin;
  const tocNumColW =
    font.widthOfTextAtSize(String(Math.max(rows.length, 11)).padStart(2, "0"), rowFont) + 14;
  const titleNumX = margin;
  const titleBodyX = margin + tocNumColW;

  const rowStep = PLAN_TOC_ROW_STEP;
  const leaderDotSize = FREEZE_TOC_LEADER_DOT_SIZE;
  let y = drawPublishingTocHeader(
    page,
    font,
    W,
    margin,
    "DOCUMENT STRUCTURE",
    "Tender Delivery Pack",
    ruleColor,
  );

  for (const row of rows) {
    const chap = row.chap.padStart(2, "0");
    const bodySrc = tocStripLeadingEnumerate(row.titleZh);
    const pageStr =
      typeof row.page1Based === "number"
        ? String(row.page1Based).padStart(2, " ")
        : String(row.page1Based);
    const pageW = font.widthOfTextAtSize(pageStr.trim(), rowFont);
    const pageTextX = pageNoRightX - pageW;
    const leaderTo = pageTextX - 14;
    const maxBodyPx = Math.max(40, leaderTo - titleBodyX - 12);
    const bodyShown = tocEllipsisToWidth(bodySrc, font, rowFont, maxBodyPx);

    page.drawText(chap, {
      x: titleNumX,
      y,
      size: rowFont,
      font,
      color: EDITORIAL_TOC_CHAP_COLOR,
    });
    page.drawText(bodyShown, {
      x: titleBodyX,
      y,
      size: rowFont,
      font,
      color: ink,
    });
    const bodyW = font.widthOfTextAtSize(bodyShown, rowFont);
    const leaderFrom = titleBodyX + bodyW + 12;
    drawTocLeader(page, font, leaderFrom, leaderTo, y, leaderDotSize, leaderColor);
    page.drawText(pageStr.trim(), {
      x: pageTextX,
      y,
      size: rowFont,
      font,
      color: pageInk,
    });
    y -= rowStep;
    if (y < BODY_BOTTOM) break;
  }
}

function drawSectionPage(
  doc: PDFDocument,
  font: PDFFont,
  sectionPage: SectionPage,
): void {
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const zhInk = rgb(0.07, 0.09, 0.13);
  const enGray = rgb(0.48, 0.5, 0.53);
  const bodyInk = FREEZE_INK_BODY;

  const isOpener = sectionPage.pageNoInSection === 1;
  const titleTopSpacing = isOpener ? PLAN_TITLE_TOP_SPACING : PLAN_TITLE_TOP_SPACING_CONT;
  const gapAfterBigNum = PLAN_TITLE_GAP_AFTER_BIG_NUM;
  const gapZhToEn = PLAN_TITLE_GAP_ZH_TO_EN;
  const gapAfterEn = PLAN_TITLE_GAP_AFTER_EN;
  const titleBottomSpacing = PLAN_TITLE_BOTTOM_SPACING;

  const zhSize = 21;
  const bigNumSize = PLAN_CHAPTER_NUM_SIZE;
  const enSize = EDITORIAL_EN_SIZE;

  let y = BODY_TOP - titleTopSpacing;

  const { n, rest } = sectionParseChapterOrdinal(sectionPage.sectionTitle);
  const chapDigits = sectionFormatChapterDigits(n);
  const contMark = sectionPage.pageNoInSection > 1 ? "（续）" : "";
  const zhPlain = rest || String(sectionPage.sectionTitle || "").trim();
  const zhHeadline = `${zhPlain}${contMark}`;

  const enLine =
    SECTION_EN_SUBTITLE[sectionPage.sectionKey] ?? "DOCUMENT SECTION";

  if (chapDigits && isOpener) {
    page.drawText(chapDigits, {
      x: MARGIN_X,
      y,
      size: bigNumSize,
      font,
      color: EDITORIAL_CHAPTER_NUM_COLOR,
    });
    y -= bigNumSize * 0.64 + gapAfterBigNum;
  } else if (!isOpener) {
    y -= 6;
  }

  page.drawText(zhHeadline, {
    x: MARGIN_X,
    y,
    size: zhSize,
    font,
    color: zhInk,
  });
  y -= zhSize * 0.88 + gapZhToEn;

  drawEditorialSpacedUppercase(page, font, enLine, MARGIN_X, y, enSize, enGray);
  y -= enSize + gapAfterEn;

  drawEditorialDivider(page, y, MARGIN_X, PAGE_WIDTH);
  y -= titleBottomSpacing;

  let prevKind: PlanBodyLineKind | undefined;
  let prevLayer: NarrativeLayer | undefined;
  let sawBody = false;
  let introRendered = false;
  let executiveRendered = false;

  for (const line of sectionPage.lines) {
    const kind = planClassifyBodyLine(line);
    const trimmed = line.trim();
    const advance = planBodyLineAdvance(line, prevKind);
    const layer = classifyNarrativeLayer(line, kind);

    if (
      layer === "operational" &&
      kind === "numbered" &&
      (prevLayer === "executive" || prevLayer === "strategic")
    ) {
      y -= 6;
      drawNarrativeSeparator(page, MARGIN_X, PAGE_WIDTH, y + 4, 0.3);
      y -= 8;
    }

    const isIntro =
      isOpener &&
      !introRendered &&
      kind === "body" &&
      (isEditorialIntroLine(line) || layer === "executive");
    const calloutParts = kind === "callout" ? parseCalloutLabel(line) : null;

    let x = planBodyDrawX(line, MARGIN_X);
    let size = planBodyFontSize(line);
    let color = bodyInk;
    let drawText = trimmed || line;
    let extraPause = freezeNarrativePause(layer, prevLayer);

    if (isIntro || (layer === "executive" && !executiveRendered && kind === "body")) {
      color = EDITORIAL_INTRO_INK;
      size = FREEZE_EXECUTIVE_SIZE;
      introRendered = true;
      executiveRendered = true;
    } else if (layer === "strategic" && kind === "body") {
      color = EDITORIAL_STRATEGIC_INK;
      size = FREEZE_STRATEGIC_SIZE;
    } else if (calloutParts) {
      color = EDITORIAL_CALLOUT_INK;
      size = 10;
      page.drawText(calloutParts.label, {
        x: MARGIN_X,
        y,
        size,
        font,
        color,
      });
      if (calloutParts.rest) {
        y -= PLAN_LINE_HEIGHT * 0.92;
        drawText = calloutParts.rest;
        size = FREEZE_BODY_SIZE;
        color = bodyInk;
        x = MARGIN_X + PLAN_CALLOUT_INDENT;
      } else {
        if (kind !== "empty") sawBody = true;
        y -= advance;
        prevKind = kind;
        prevLayer = layer;
        if (y < BODY_BOTTOM) break;
        continue;
      }
    } else if (kind === "callout") {
      color = EDITORIAL_CALLOUT_INK;
    } else if (kind === "numbered") {
      const numMatch = trimmed.match(/^(\d+)\.\s*/);
      if (numMatch) {
        page.drawText(`${numMatch[1]}.`, {
          x: MARGIN_X + 2,
          y,
          size: 10,
          font,
          color: EDITORIAL_NUMBER_MUTED,
        });
        drawText = trimmed.slice(numMatch[0].length);
        x = planBodyDrawX(line, MARGIN_X);
      }
    }

    page.drawText(drawText, { x, y, size, font, color });

    if (kind !== "empty") sawBody = true;

    y -= advance + extraPause;
    prevKind = kind;
    prevLayer = layer;
    if (y < BODY_BOTTOM) break;
  }
}

async function renderPlanOnly(input: {
  project: ProjectRecord;
  solution: SolutionRecord;
  placeholders: ProductPlaceholder[];
  tier?: UserTier;
  omitChrome?: boolean;
  tenderDocument?: TenderDocumentContext;
}): Promise<Buffer> {
  const tier = input.tier ?? "enterprise";
  const doc = await PDFDocument.create();
  const font = await loadChineseFont(doc);

  const sections = buildSections({ ...input, tier });
  const sectionPages = sections.flatMap((section) => paginateSection(section, font));

  const firstPageMap: Record<string, number> = {};
  let current = planBodyStartPage1Based(tier);
  for (const section of sections) {
    const pages = sectionPages.filter((x) => x.sectionKey === section.key);
    firstPageMap[section.key] = current;
    current += pages.length;
  }

  let docCtx =
    input.tenderDocument ??
    buildTenderDocumentContext({
      projectId: input.project.id,
      planId: input.project.id,
      tier,
    });
  if (!docCtx.reqsig?.trim()) {
    const reqsig = await computeTenderPackReqsig(docCtx);
    docCtx = { ...docCtx, reqsig };
  }
  const reqsigLine = formatReqsigLine(docCtx.reqsig);
  const generatedDate = formatCoverDateIso();

  await drawCover(doc, font, input);
  drawTenderDeliveryNoticePage(doc, font, {
    reqsigLine,
    versionLabel: docCtx.version,
    generatedDate,
  });
  if (tier !== "free") {
    drawDeclaration(doc, font);
  }
  drawToc(doc, font, sections, firstPageMap);
  for (const sp of sectionPages) drawSectionPage(doc, font, sp);

  if (tier === "free") {
    while (doc.getPageCount() > 5) {
      doc.removePage(doc.getPageCount() - 1);
    }
    for (let i = 0; i < doc.getPageCount(); i++) {
      const page = doc.getPage(i);
      page.drawText("仅供参考 / 非正式投标文件", {
        x: 110,
        y: PAGE_HEIGHT / 2,
        size: 32,
        font,
        color: rgb(0.86, 0.1, 0.1),
        rotate: degrees(32),
        opacity: 0.16,
      });
    }
  }

  if (!input.omitChrome) {
    restampTenderDeliveryChrome(doc, font, {
      skipPageIndexes: [0, PLAN_DELIVERY_NOTICE_PAGE_INDEX],
      footerCenterLabel: docCtx.version,
      footerSigLine: reqsigLine,
      marginL: MARGIN_X,
      marginR: MARGIN_X,
    });

    applyTenderDocumentMetadata(doc, docCtx, docCtx.reqsig!, "plan");
  }

  return Buffer.from(await doc.save());
}

/** 供 Tender Pack 计算章节起始页（与 renderPlanOnly 分页规则一致） */
export async function computePlanPackMeta(input: {
  project: ProjectRecord;
  solution: SolutionRecord;
  placeholders: ProductPlaceholder[];
  tier?: UserTier;
}): Promise<{
  firstPageMap: Record<string, number>;
  totalPlanPages: number;
  planBodyStart1Based: number;
}> {
  const tier = input.tier ?? "enterprise";
  const doc = await PDFDocument.create();
  const font = await loadChineseFont(doc);
  const sections = buildSections({ ...input, tier });
  const sectionPages = sections.flatMap((section) => paginateSection(section, font));
  const firstPageMap: Record<string, number> = {};
  let current = planBodyStartPage1Based(tier);
  for (const section of sections) {
    const pages = sectionPages.filter((x) => x.sectionKey === section.key);
    firstPageMap[section.key] = current;
    current += pages.length;
  }
  const planBodyStart1Based = planBodyStartPage1Based(tier);
  const totalPlanPages = planFrontMatterPageCount(tier) + sectionPages.length;
  return { firstPageMap, totalPlanPages, planBodyStart1Based };
}

export async function renderPlanPdf(
  project: ProjectLike,
  solution: SolutionLike,
  placeholders: PlaceholderLike[],
  options?: {
    tier?: UserTier;
    omitChrome?: boolean;
    tenderDocument?: TenderDocumentContext;
  },
): Promise<Buffer>;
export async function renderPlanPdf(input: {
  project: ProjectRecord;
  solution: SolutionRecord;
  placeholders: ProductPlaceholder[];
  tier?: UserTier;
  omitChrome?: boolean;
  tenderDocument?: TenderDocumentContext;
}): Promise<Buffer>;
export async function renderPlanPdf(
  arg1:
    | {
        project: ProjectRecord;
        solution: SolutionRecord;
        placeholders: ProductPlaceholder[];
      }
    | ProjectLike,
  arg2?: SolutionLike,
  arg3?: PlaceholderLike[],
  arg4?: {
    tier?: UserTier;
    omitChrome?: boolean;
    tenderDocument?: TenderDocumentContext;
  },
): Promise<Buffer> {
  if (arg2 && arg3) {
    return renderPlanOnly({
      project: normalizeProject(arg1 as ProjectLike),
      solution: normalizeSolution(arg2),
      placeholders: normalizePlaceholders(arg3),
      tier: arg4?.tier,
      omitChrome: arg4?.omitChrome,
      tenderDocument: arg4?.tenderDocument,
    });
  }
  return renderPlanOnly(arg1 as {
    project: ProjectRecord;
    solution: SolutionRecord;
    placeholders: ProductPlaceholder[];
    tier?: UserTier;
    omitChrome?: boolean;
    tenderDocument?: TenderDocumentContext;
  });
}
