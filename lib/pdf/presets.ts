// lib/pdf/presets.ts

export type TenderLevel = "saas" | "enterprise" | "government";
export type PdfThemeName = "brand" | "tender";

export function parseTenderLevel(v?: string | null): TenderLevel {
  const s = (v || "").trim().toLowerCase();
  if (s === "enterprise") return "enterprise";
  if (s === "government") return "government";
  return "saas";
}

export function parseTheme(v?: string | null): PdfThemeName {
  const s = (v || "").trim().toLowerCase();
  if (s === "tender") return "tender";
  return "brand";
}

/**
 * 预算 PDF 支持的模块（sections）
 */
export type BudgetPdfSection =
  | "cover"
  | "toc"
  | "header"
  | "overall"
  | "table"
  | "pricing_terms"
  | "delivery_terms"
  | "payment_terms"
  | "after_sales"
  | "compliance"
  | "sign_seal"
  | "attachments"
  | "footer";

/**
 * ✅ 输出预设：把 level + theme + render开关 全部收口在这里
 * - style: 行距/密度等
 * - budget: sections + gov编号策略
 * - plan: Plan22 的桥接/页脚擦除/TOC重画等
 */
export type PdfPreset = {
  level: TenderLevel;
  theme: PdfThemeName;

  style: {
    dense: boolean;
  };

  budget: {
    sections: BudgetPdfSection[];

    /** 政府版是否需要 docSeq 形成“文档编号” */
    requireDocSeq: boolean;

    /** 政府版是否强制在首页出现 DOCNO/SIG（你回归脚本在断言这个） */
    requireDocNoAndSigOnPage1: boolean;
  };

  plan: {
    /** Plan22 golden 回放：是否画 slim header（避免压原版式） */
    headerSlim: boolean;

    /** 是否擦除底部安全带，再画统一 footer（你现在就是这么做的） */
    wipeFooterBand: boolean;

    /** 是否重绘 TOC 区块（你现在在 TOC_PAGE_INDEX 做了重画） */
    redrawToc: boolean;
  };
};

/**
 * 旧的 LEVEL_PRESETS 保留，但升级为基础预设（不含 theme）
 * theme 会在 resolvePreset 里合并进去
 */
const LEVEL_BASE: Record<
  TenderLevel,
  Omit<PdfPreset, "theme">
> = {
  // C：商业标准版（默认）
  saas: {
    level: "saas",
    style: { dense: true },
    budget: {
      sections: ["header", "overall", "table", "footer"],
      requireDocSeq: false,
      requireDocNoAndSigOnPage1: false,
    },
    plan: {
      headerSlim: true,
      wipeFooterBand: true,
      redrawToc: true,
    },
  },

  // A：企业招标级
  enterprise: {
    level: "enterprise",
    style: { dense: false },
    budget: {
      sections: [
        "header",
        "overall",
        "table",
        "pricing_terms",
        "delivery_terms",
        "payment_terms",
        "after_sales",
        "sign_seal",
        "footer",
      ],
      requireDocSeq: false,
      requireDocNoAndSigOnPage1: false,
    },
    plan: {
      headerSlim: true,
      wipeFooterBand: true,
      redrawToc: true,
    },
  },

  // B：政府投标级
  government: {
    level: "government",
    style: { dense: false },
    budget: {
      sections: [
        "cover",
        "toc",
        "header",
        "overall",
        "table",
        "pricing_terms",
        "delivery_terms",
        "payment_terms",
        "after_sales",
        "compliance",
        "sign_seal",
        "attachments",
        "footer",
      ],
      requireDocSeq: true,
      requireDocNoAndSigOnPage1: true,
    },
    plan: {
      headerSlim: true,
      wipeFooterBand: true,
      redrawToc: true,
    },
  },
};

/**
 * ✅ 单一入口：任何地方只用它
 */
export function resolvePreset(args?: {
  level?: TenderLevel;
  theme?: PdfThemeName;
}): PdfPreset {
  const level = args?.level ?? "saas";
  const theme = args?.theme ?? "brand";
  const base = LEVEL_BASE[level] ?? LEVEL_BASE.saas;
  return { ...base, theme };
}

/**
 * ✅ 兼容你现在旧用法（LEVEL_PRESETS）
 * 如果你已有代码引用 LEVEL_PRESETS，先不改也能继续工作。
 */
export const LEVEL_PRESETS: Record<
  TenderLevel,
  { budgetSections: BudgetPdfSection[]; style: { dense: boolean } }
> = {
  saas: { budgetSections: LEVEL_BASE.saas.budget.sections, style: LEVEL_BASE.saas.style },
  enterprise: { budgetSections: LEVEL_BASE.enterprise.budget.sections, style: LEVEL_BASE.enterprise.style },
  government: { budgetSections: LEVEL_BASE.government.budget.sections, style: LEVEL_BASE.government.style },
};