/**
 * PCv2.1-A — Requirement / configuration analysis (pure, deterministic, advisory).
 *
 * Only customer-provided facts are reported as facts: missing headcount / area /
 * budget stay "unknown". Strategy text stays within hardware scope (equipment,
 * flooring, mirrors, lighting, acoustics, finish, density/circulation).
 * Does not change equipment quantities.
 */

import {
  hasBasementNoVentilationConstraint,
  hasStrengthEquipmentEmphasis,
  parseExplicitAreaM2FromNotes,
} from "./quote-revision";
import type { CompanyInfoInput } from "./types";

export const CONFIGURATION_STRATEGY_VERSION = "pcv2.1-a" as const;

type FactSource = "quote" | "project" | "notes";

export type KnownOrUnknown<T> =
  | ({ status: "known"; source: FactSource } & T)
  | { status: "unknown" };

export type BudgetFact = KnownOrUnknown<{
  /** Explicit amount from requirement text, e.g. "预算30万" → 300000. */
  amountYuan?: number;
  /** Declared project budget range label, e.g. "10-30万". */
  label?: string;
}>;

export type CriticalInfoKey = "headcount" | "area" | "budget";

export type MissingCriticalInfoItem = {
  key: CriticalInfoKey;
  label: string;
  impact: string;
};

export type TrainingFocus =
  | "pilates"
  | "yoga"
  | "strength"
  | "cardio"
  | "functional"
  | "group_class"
  | "recovery";

export type FocusRole = "primary" | "secondary" | "mentioned";

export type FocusSignal = {
  focus: TrainingFocus;
  label: string;
  role: FocusRole;
  evidence: string;
};

export type ExperienceIntent = {
  /** Configuration / experience positioning — independent of price band. */
  level: "premium" | "standard" | "unspecified";
  signals: string[];
  principles: string[];
};

export type ZoneAllocation = {
  zone: string;
  sharePct: [number, number];
  /** Only present when the customer area is known. */
  areaM2?: [number, number];
};

export type ConfigurationStrategy = {
  facts: {
    headcount: KnownOrUnknown<{ value: number }>;
    areaM2: KnownOrUnknown<{ value: number }>;
    budget: BudgetFact;
    siteType?: string;
    /** Project price band; NOT an experience positioning. */
    priceBand?: string;
  };
  audience: {
    genderSkew: "female" | "male" | null;
    evidence: string[];
  };
  experience: ExperienceIntent;
  focus: {
    primary: TrainingFocus[];
    secondary: TrainingFocus[];
    mentioned: TrainingFocus[];
    signals: FocusSignal[];
  };
  zoning: ZoneAllocation[];
  guidance: string[];
  constraints: string[];
  conflicts: string[];
  /** Known gaps between this strategy and the current template configuration. */
  downstreamNotes: string[];
};

export type ConfigurationAnalysis = {
  version: typeof CONFIGURATION_STRATEGY_VERSION;
  analyzedAt: string;
  missingCriticalInfo: MissingCriticalInfoItem[];
  configurationStrategy: ConfigurationStrategy;
};

export type ConfigurationStrategyProjectInput = {
  targetUsers?: number | null;
  areaM2?: number | null;
  siteType?: string | null;
  budgetLevel?: string | null;
  budgetLabel?: string | null;
  notes?: string | null;
};

// ---------------------------------------------------------------------------
// Facts
// ---------------------------------------------------------------------------

function positive(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

/** Explicit headcount phrases only; bare "N人" (e.g. "10人同时") is ignored. */
function parseExplicitHeadcountFromNotes(notes: string): number | undefined {
  const patterns = [
    /员工\s*(?:约|共|总计)?\s*(\d{1,6})\s*(?:人|名)/,
    /(\d{1,6})\s*(?:名|位|个)?\s*(?:员工|职工)/,
    /(\d{1,6})\s*人\s*(?:规模|企业|公司|团队)/,
  ];
  for (const re of patterns) {
    const m = notes.match(re);
    const n = m ? Number(m[1]) : NaN;
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  return undefined;
}

/** "预算30万" / "30万预算" / "预算 300000 元". */
function parseExplicitBudgetYuanFromNotes(notes: string): number | undefined {
  const wan =
    notes.match(/预算\s*(?:约|大约|控制在|不超过|上限)?\s*(\d+(?:\.\d+)?)\s*(?:万|w|W)/) ??
    notes.match(/(\d+(?:\.\d+)?)\s*(?:万|w|W)\s*(?:元)?\s*(?:以内|左右)?\s*(?:的)?\s*预算/);
  if (wan) {
    const n = Number(wan[1]);
    if (Number.isFinite(n) && n > 0) return Math.round(n * 10000);
  }
  const yuan = notes.match(/预算\s*(?:约|大约|控制在|不超过|上限)?\s*(\d{4,9})\s*元/);
  if (yuan) {
    const n = Number(yuan[1]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

/** Range label → [min, max] yuan; max undefined = open-ended. */
function budgetLabelRangeYuan(label: string): [number, number | undefined] | null {
  const v = label.trim();
  const range = v.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*万/);
  if (range) return [Number(range[1]) * 10000, Number(range[2]) * 10000];
  const within = v.match(/(\d+(?:\.\d+)?)\s*万以内/);
  if (within) return [0, Number(within[1]) * 10000];
  const above = v.match(/(\d+(?:\.\d+)?)\s*万以上/);
  if (above) return [Number(above[1]) * 10000, undefined];
  return null;
}

// ---------------------------------------------------------------------------
// Requirement signals
// ---------------------------------------------------------------------------

const FOCUS_DEFS: Array<{ focus: TrainingFocus; label: string; kw: string }> = [
  { focus: "pilates", label: "普拉提", kw: "普拉提|pilates|核心床|reformer" },
  { focus: "yoga", label: "瑜伽", kw: "瑜伽|yoga" },
  { focus: "strength", label: "力量训练", kw: "力量|自由重量|哑铃|杠铃" },
  { focus: "cardio", label: "有氧训练", kw: "有氧|跑步机|动感单车|椭圆机" },
  { focus: "functional", label: "功能性训练", kw: "功能性训练|功能训练|体能训练" },
  { focus: "group_class", label: "团课/操课", kw: "团课|操课|团体课" },
  { focus: "recovery", label: "拉伸/恢复", kw: "拉伸|放松|康复|恢复" },
];

const CLAUSE_SPLIT = /[，,。；;、\n·|]+/;
const NOT_SEP = "[^，,。；;、\\n·|]";

function focusRole(clause: string, kw: string): FocusRole | null {
  if (!new RegExp(`(?:${kw})`, "i").test(clause)) return null;
  const primary = [
    new RegExp(`(?:${kw})(?:(?!为主|为辅)${NOT_SEP}){0,4}(?:为主|优先|为核心|为重点)`, "i"),
    new RegExp(`(?:主打|偏重|侧重|重点|以)\\s*(?:${kw})`, "i"),
  ];
  const secondary = [
    new RegExp(`(?:${kw})(?:(?!为主|为辅)${NOT_SEP}){0,4}(?:为辅|辅助|次之)`, "i"),
    new RegExp(`(?:辅以|兼顾|搭配|少量|适当)\\s*(?:${kw})`, "i"),
  ];
  if (secondary.some((re) => re.test(clause))) return "secondary";
  if (primary.some((re) => re.test(clause))) return "primary";
  return "mentioned";
}

function detectFocusSignals(notes: string): FocusSignal[] {
  const clauses = notes.split(CLAUSE_SPLIT).map((c) => c.trim()).filter(Boolean);
  const best = new Map<TrainingFocus, FocusSignal>();
  const rank: Record<FocusRole, number> = { primary: 3, secondary: 2, mentioned: 1 };
  for (const clause of clauses) {
    for (const def of FOCUS_DEFS) {
      const role = focusRole(clause, def.kw);
      if (!role) continue;
      const prev = best.get(def.focus);
      if (!prev || rank[role] > rank[prev.role]) {
        best.set(def.focus, { focus: def.focus, label: def.label, role, evidence: clause });
      }
    }
  }
  if (hasStrengthEquipmentEmphasis(notes)) {
    const prev = best.get("strength");
    best.set("strength", {
      focus: "strength",
      label: "力量训练",
      role: "primary",
      evidence: prev?.evidence ?? "偏重力量器械",
    });
  }
  return FOCUS_DEFS.map((d) => best.get(d.focus)).filter(
    (s): s is FocusSignal => Boolean(s),
  );
}

function detectGenderSkew(notes: string): ConfigurationStrategy["audience"] {
  const female = notes.match(
    /(?:女性|女员工|女生)(?:员工)?\s*(?:较多|居多|为主|偏多|占多数|多)|以女性为主/,
  );
  if (female) return { genderSkew: "female", evidence: [female[0]] };
  const male = notes.match(
    /(?:男性|男员工|男生)(?:员工)?\s*(?:较多|居多|为主|偏多|占多数|多)|以男性为主/,
  );
  if (male) return { genderSkew: "male", evidence: [male[0]] };
  return { genderSkew: null, evidence: [] };
}

const PREMIUM_RE = /高端|高档|高品质|高标准|精品|豪华|品质感|轻奢|premium/gi;

function detectExperience(notes: string, priceBand: string | undefined): ExperienceIntent {
  const signals = Array.from(new Set(notes.match(PREMIUM_RE) ?? []));
  if (signals.length > 0) {
    return {
      level: "premium",
      signals,
      principles: [
        "高端指配置与体验定位（非仅单价档位）：器材优先商用级品质、功能完整度与人体工学调节范围",
        "地面：按分区选用专业运动地面（减震、防滑、耐压），分区过渡平整",
        "镜面与照明：训练区镜面墙，均匀无眩光照明，照度与色温按分区区分",
        "声学与材料：吸音降噪处理，墙面与器材饰面选用耐用、易清洁的高品质材料",
        "空间密度与动线：控制器材摆放密度，保留充足训练间距与通行动线，不按人头堆叠器材",
      ],
    };
  }
  return {
    level: "unspecified",
    signals: [],
    principles:
      priceBand === "high"
        ? ["项目预算档位为 high，仅代表价格带，未表达体验定位；如需高端体验请在需求中明确"]
        : [],
  };
}

// ---------------------------------------------------------------------------
// Strategy
// ---------------------------------------------------------------------------

const ZONE_LABEL: Record<TrainingFocus, string> = {
  pilates: "普拉提区",
  yoga: "瑜伽/垫上区",
  strength: "力量训练区",
  cardio: "有氧区",
  functional: "功能性训练区",
  group_class: "多功能训练区",
  recovery: "拉伸/恢复区",
};

function buildZoning(
  primary: TrainingFocus[],
  secondary: TrainingFocus[],
  areaM2: number | undefined,
): ZoneAllocation[] {
  if (primary.length === 0) return [];
  const zones: Array<{ zone: string; sharePct: [number, number] }> = [];
  const primaryShare: [number, number] = secondary.length > 0 ? [45, 55] : [60, 70];
  const perPrimary = primaryShare.map((v) => Math.round(v / primary.length)) as [number, number];
  for (const f of primary) zones.push({ zone: ZONE_LABEL[f], sharePct: perPrimary });
  const secondaryOnly = secondary.filter((f) => f !== "recovery");
  if (secondaryOnly.length > 0) {
    const per = [20, 30].map((v) => Math.round(v / secondaryOnly.length)) as [number, number];
    for (const f of secondaryOnly) zones.push({ zone: ZONE_LABEL[f], sharePct: per });
  }
  if (!primary.includes("recovery")) {
    zones.push({ zone: ZONE_LABEL.recovery, sharePct: [10, 15] });
  }
  zones.push({ zone: "接待/储物/通行", sharePct: [10, 15] });
  return zones.map((z) =>
    areaM2 != null
      ? {
          ...z,
          areaM2: [
            Math.round((areaM2 * z.sharePct[0]) / 100),
            Math.round((areaM2 * z.sharePct[1]) / 100),
          ] as [number, number],
        }
      : z,
  );
}

const FOCUS_GUIDANCE: Partial<Record<TrainingFocus, { primary: string; secondary: string }>> = {
  pilates: {
    primary: "普拉提为核心：以核心床（Reformer）等普拉提器械与垫上区构成主训练区",
    secondary: "保留小型普拉提 / 垫上区，用于核心与体态训练",
  },
  strength: {
    primary: "力量训练为核心：综合训练器与自由力量区为主，按训练动线分区",
    secondary: "力量为辅：以低占地、可调重量的器械（可调哑铃、综合训练器、功能训练架等）用于塑形与体态训练，不做大型自由重量区",
  },
  yoga: {
    primary: "瑜伽为核心：开阔垫上空间，配镜面与柔和灯光",
    secondary: "预留垫上 / 瑜伽区用于拉伸与垫上训练",
  },
  cardio: {
    primary: "有氧训练为核心：有氧器械集中布置，保证器械间距与通风散热",
    secondary: "有氧为辅：少量有氧器械用于热身与心肺训练",
  },
  functional: {
    primary: "功能性训练为核心：开放地面区 + 功能训练架 / 小器械",
    secondary: "预留功能性训练地面区",
  },
  group_class: {
    primary: "团体训练为核心：多功能训练厅（开阔运动地面、镜面墙、音响与灯光系统）",
    secondary: "预留可兼作团体训练的多功能区域",
  },
};

function buildGuidance(input: {
  signals: FocusSignal[];
  genderSkew: "female" | "male" | null;
  experience: ExperienceIntent;
  areaM2?: number;
  budget: BudgetFact;
}): string[] {
  const out: string[] = [];
  for (const s of input.signals) {
    const g = FOCUS_GUIDANCE[s.focus];
    if (!g) continue;
    if (s.role === "primary") out.push(g.primary);
    else if (s.role === "secondary") out.push(g.secondary);
  }
  if (input.genderSkew === "female") {
    out.push("女性员工较多：器材重量梯度从轻量起步、调节范围覆盖较小身材，优先塑形、体态与核心类器材；更衣区私密性与空间分隔优先");
  }
  if (input.experience.level === "premium") {
    out.push(...input.experience.principles);
  }
  if (
    input.areaM2 != null &&
    input.budget.status === "known" &&
    input.budget.amountYuan != null
  ) {
    const perM2 = Math.round(input.budget.amountYuan / input.areaM2);
    out.push(
      `预算强度约 ${perM2} 元/㎡（${Math.round(input.budget.amountYuan / 10000)}万 / ${input.areaM2}㎡），需在器材与空间装修投入间明确分配`,
    );
  }
  return out;
}

export function analyzeConfigurationStrategy(input: {
  companyInfo: CompanyInfoInput;
  project?: ConfigurationStrategyProjectInput | null;
  analyzedAt?: string;
}): ConfigurationAnalysis {
  const project = input.project ?? {};
  const notes = (input.companyInfo.notes?.trim() || project.notes?.trim() || "").trim();

  // Headcount — never inferred.
  const quoteUsers = positive(input.companyInfo.targetUsers);
  const projectUsers = positive(project.targetUsers ?? undefined);
  const notesUsers = notes ? parseExplicitHeadcountFromNotes(notes) : undefined;
  const headcount: ConfigurationStrategy["facts"]["headcount"] =
    quoteUsers != null
      ? { status: "known", source: "quote", value: Math.floor(quoteUsers) }
      : projectUsers != null
        ? { status: "known", source: "project", value: Math.floor(projectUsers) }
        : notesUsers != null
          ? { status: "known", source: "notes", value: notesUsers }
          : { status: "unknown" };

  // Area — explicit notes area wins (same rule as applyQuoteRevisionOverrides); never 120 fallback.
  const notesArea = parseExplicitAreaM2FromNotes(notes);
  const quoteArea = positive(input.companyInfo.areaM2);
  const projectArea = positive(project.areaM2 ?? undefined);
  const areaM2: ConfigurationStrategy["facts"]["areaM2"] =
    notesArea != null
      ? { status: "known", source: "notes", value: notesArea }
      : quoteArea != null
        ? { status: "known", source: "quote", value: quoteArea }
        : projectArea != null
          ? { status: "known", source: "project", value: projectArea }
          : { status: "unknown" };

  // Budget — explicit requirement amount wins over project range label.
  const conflicts: string[] = [];
  const notesBudget = notes ? parseExplicitBudgetYuanFromNotes(notes) : undefined;
  const label = project.budgetLabel?.trim() || undefined;
  let budget: BudgetFact = { status: "unknown" };
  if (notesBudget != null) {
    budget = { status: "known", source: "notes", amountYuan: notesBudget, ...(label ? { label } : {}) };
    const range = label ? budgetLabelRangeYuan(label) : null;
    if (range && (notesBudget < range[0] || (range[1] != null && notesBudget > range[1]))) {
      conflicts.push(
        `需求中的预算 ${Math.round(notesBudget / 10000)}万 与项目预算档位「${label}」不一致，以需求表述为准并需确认`,
      );
    }
  } else if (label) {
    budget = { status: "known", source: "project", label };
  }

  const priceBand = project.budgetLevel?.trim() || undefined;
  const audience = detectGenderSkew(notes);
  const experience = detectExperience(notes, priceBand);
  const signals = notes ? detectFocusSignals(notes) : [];
  const primary = signals.filter((s) => s.role === "primary").map((s) => s.focus);
  const secondary = signals.filter((s) => s.role === "secondary").map((s) => s.focus);
  const mentioned = signals.filter((s) => s.role === "mentioned").map((s) => s.focus);
  const knownArea = areaM2.status === "known" ? areaM2.value : undefined;

  const constraints: string[] = [];
  if (hasBasementNoVentilationConstraint(notes)) {
    constraints.push("地下室且无通风：通风换气与空气质量需在现场踏勘与实施前确认");
  }

  const missingCriticalInfo: MissingCriticalInfoItem[] = [];
  if (headcount.status === "unknown") {
    missingCriticalInfo.push({
      key: "headcount",
      label: "员工 / 使用人数",
      impact: "无法确定同时使用人数与器材规模；分析中保持未知，不做推断",
    });
  }
  if (areaM2.status === "unknown") {
    missingCriticalInfo.push({
      key: "area",
      label: "场地面积（㎡）",
      impact: "无法确定分区面积与可容纳器材；分析中保持未知，不使用默认面积",
    });
  }
  if (budget.status === "unknown") {
    missingCriticalInfo.push({
      key: "budget",
      label: "预算",
      impact: "无法校验配置定位与投入强度是否匹配",
    });
  }

  const downstreamNotes: string[] = [];
  if (primary.includes("pilates") || secondary.includes("pilates")) {
    downstreamNotes.push("当前模板器材位未包含普拉提器械，本阶段不调整器材位与数量");
  }
  if (primary.includes("yoga") || secondary.includes("yoga")) {
    downstreamNotes.push("当前模板器材位未包含瑜伽 / 垫上区，本阶段不调整器材位与数量");
  }
  if (headcount.status === "unknown") {
    downstreamNotes.push("人数未知：器材数量按模板基础配置暂估并标注待确认，不按人数推算");
  }
  if (areaM2.status === "unknown") {
    downstreamNotes.push("面积未知：方案标注面积待确认，器材数量不按面积缩放");
  }

  return {
    version: CONFIGURATION_STRATEGY_VERSION,
    analyzedAt: input.analyzedAt ?? new Date().toISOString(),
    missingCriticalInfo,
    configurationStrategy: {
      facts: {
        headcount,
        areaM2,
        budget,
        ...(project.siteType?.trim() ? { siteType: project.siteType.trim() } : {}),
        ...(priceBand ? { priceBand } : {}),
      },
      audience,
      experience,
      focus: { primary, secondary, mentioned, signals },
      zoning: buildZoning(primary, secondary, knownArea),
      guidance: buildGuidance({
        signals,
        genderSkew: audience.genderSkew,
        experience,
        areaM2: knownArea,
        budget,
      }),
      constraints,
      conflicts,
      downstreamNotes,
    },
  };
}
