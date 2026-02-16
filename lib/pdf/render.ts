// lib/pdf/render.ts
import fs from "fs";
import path from "path";
import { PDFDocument, PDFFont, rgb, PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { prisma } from "@/lib/prisma";

type Mode = "preview" | "full" | "budget";

let cachedFontBytes: Uint8Array | null = null;

function resolveCjkFontPath() {
  const dir = path.resolve(process.cwd(), "public", "fonts");
  const candidates = [
    path.join(dir, "NotoSansSC-Regular.ttf"),
    path.join(dir, "NotoSansSC-Regular.otf"),
  ];
  for (const p of candidates) if (fs.existsSync(p)) return p;

  const existing =
    fs.existsSync(dir)
      ? fs
          .readdirSync(dir)
          .filter((f) => /\.(ttf|otf|ttc)$/i.test(f))
          .join(", ")
      : "(public/fonts 不存在)";

  throw new Error(
    `字体文件不存在：未找到 NotoSansSC-Regular.ttf 或 NotoSansSC-Regular.otf。\n` +
      `请将支持中文的字体放到 public/fonts/ 下。\n` +
      `当前 public/fonts/ 中可见字体：${existing}`
  );
}

function loadFontBytesOnce() {
  if (!cachedFontBytes) cachedFontBytes = fs.readFileSync(resolveCjkFontPath());
  return cachedFontBytes;
}

async function embedCJKFont(pdfDoc: PDFDocument): Promise<PDFFont> {
  pdfDoc.registerFontkit(fontkit);
  const bytes = loadFontBytesOnce();
  // ✅ 嵌入完整字体（subset:false），尽量避免少数字体/抽取/阅读器兼容问题
  return await pdfDoc.embedFont(bytes, { subset: false });
}

function isoNow() {
  return new Date().toISOString();
}

// ✅ 中文换行：按字符宽度
function wrapTextByChar(font: PDFFont, text: string, size: number, maxWidth: number) {
  const s = String(text ?? "");
  const lines: string[] = [];
  let cur = "";

  for (const ch of s) {
    if (ch === "\n") {
      lines.push(cur);
      cur = "";
      continue;
    }
    const candidate = cur + ch;
    const w = font.widthOfTextAtSize(candidate, size);
    if (w <= maxWidth) cur = candidate;
    else {
      if (cur) lines.push(cur);
      cur = ch;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawParagraph(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  color = rgb(0, 0, 0),
  lineGap = 4
) {
  const lines = wrapTextByChar(font, text, size, maxWidth);
  let cy = y;
  for (const line of lines) {
    page.drawText(line, { x, y: cy, size, font, color });
    cy -= size + lineGap;
  }
  return cy;
}

function formatMoneyRange(min: number, max: number) {
  const f = (n: number) =>
    "¥" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${f(min)} - ${f(max)}`;
}

// ---------- plan pickers ----------
function pickIndustry(plan: any) {
  return plan?.client_profile?.industry || "未填写";
}
function pickCompanySize(plan: any) {
  const n = plan?.client_profile?.company_size;
  return n != null ? String(n) : "未填写";
}
function pickArea(plan: any) {
  const n = plan?.client_profile?.space_area;
  return n != null ? String(n) : "未填写";
}
function pickBudgetRange(plan: any) {
  return plan?.client_profile?.budget_range || "未填写";
}

function pickRecommendedTier(plan: any): "lite" | "standard" | "pro" {
  const t =
    plan?.recommendation?.tier ||
    plan?.recommend_tier ||
    plan?.recommended_tier ||
    plan?.tier ||
    "standard";
  const s = String(t).toLowerCase();
  if (s.includes("pro") || s.includes("high")) return "pro";
  if (s.includes("lite") || s.includes("low")) return "lite";
  return "standard";
}

// ---- DB load ----
async function loadPlan(planId: string): Promise<any | null> {
  try {
    const row = await prisma.planJob.findUnique({
      where: { id: planId },
      select: { plan: true },
    });
    return (row?.plan as any) ?? null;
  } catch (e) {
    console.warn("[plan] prisma load failed:", e);
    return null;
  }
}

// ---- render entry（保持入口不变） ----
export async function renderPdf(planId: string, opts: { mode: Mode }) {
  const mode = opts.mode;
  console.info("[lib/pdf/render] renderPdf called", { planId, mode });

  const plan = await loadPlan(planId);

  if (mode === "budget") return await renderBudgetPdfV2_Table(planId, plan);
  if (mode === "preview") return await renderPreviewPdf(planId, plan);
  return await renderFullPlanPdfV2_22Pages(planId, plan);
}

// ✅ 只保留一次导出，避免“already been declared”
export async function renderPlanPdfBuffer(planId: string) {
  return await renderPdf(planId, { mode: "full" });
}
export async function renderBudgetPdfBuffer(planId: string) {
  return await renderPdf(planId, { mode: "budget" });
}

/* =========================================================
   ✅ 方案 PDF：融合 18 页“内容更足” + 最新“附录更完整”
   输出：22 页
   - 1 封面
   - 2 执行摘要（优先 DB 的 management_conclusion）
   - 3 三档对比
   - 4-18：Lite/Standard/Pro 各 5 页（共 15 页）
   - 19-22：附录 A-D
   ========================================================= */
async function renderFullPlanPdfV2_22Pages(planId: string, plan: any | null) {
  const pdfDoc = await PDFDocument.create();
  const font = await embedCJKFont(pdfDoc);

  const A4: [number, number] = [595, 842];
  const margin = 48;
  const w = A4[0];
  const h = A4[1];
  const usableW = w - margin * 2;

  const industry = plan ? pickIndustry(plan) : "未填写";
  const companySize = plan ? pickCompanySize(plan) : "未填写";
  const area = plan ? pickArea(plan) : "未填写";
  const budgetRange = plan ? pickBudgetRange(plan) : "未填写";
  const tier = plan ? pickRecommendedTier(plan) : "standard";

  const companyName =
    plan?.company?.name ||
    plan?.client_profile?.company_name ||
    plan?.client_profile?.company ||
    "示例企业";

  // 参与率：尽量从 DB 或 plan 中拿，没有就给默认
  const participation =
    plan?.client_profile?.participation ??
    plan?.participation ??
    0.3;

  const preferSmart = !!(plan?.client_profile?.prefer_smart ?? plan?.preferSmart ?? true);
  const preferQuiet = !!(plan?.client_profile?.prefer_quiet ?? plan?.preferQuiet ?? false);

  const tierLabel =
    tier === "lite"
      ? "lite（lite）"
      : tier === "pro"
        ? "pro（pro）"
        : "standard（standard）";

  const positioning =
    companySize !== "未填写" && companySize !== "0"
      ? `为 ${companySize} 人规模${industry}企业打造的高性价比办公健康支持解决方案`
      : `为${industry}企业打造的高性价比办公健康支持解决方案`;

  function header(page: PDFPage, title: string) {
    page.drawText(title, { x: margin, y: h - margin - 10, size: 16, font, color: rgb(0, 0, 0) });
  }
  function footer(page: PDFPage, pageNo: number) {
    page.drawText(`第 ${pageNo} 页`, {
      x: margin,
      y: margin - 12,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  // —— Page 1 封面 ——
  {
    const page = pdfDoc.addPage(A4);
    let y = h - margin - 30;

    page.drawText("办公健康支持方案（自动生成）", { x: margin, y, size: 22, font });
    y -= 40;

    const meta = [
      `企业：${companyName}`,
      `Plan ID：${planId}`,
      `行业：${industry}`,
      `企业规模：${companySize} 人`,
      `面积：${area}㎡`,
      `预算范围：${budgetRange}`,
      `推荐档位：${tierLabel}`,
      `定位：${positioning}`,
      `参与率：${Math.round(participation * 100)}% ｜ 偏好：${preferSmart ? "偏好智能" : "—"}${preferQuiet ? "｜偏好低噪" : ""} ｜ 导出时间：${isoNow()}`,
    ];

    y = drawParagraph(page, font, meta.join("\n"), margin, y, usableW, 11, rgb(0.1, 0.1, 0.1), 6);
    footer(page, 1);
  }

  // —— Page 2 执行摘要（优先用“18 页那种更足”的 bullets） ——
  {
    const page = pdfDoc.addPage(A4);
    header(page, "执行摘要");
    let y = h - margin - 50;

    const arr = plan?.solution_summary?.management_conclusion;
    const bullets: string[] =
      Array.isArray(arr) && arr.length
        ? arr.map((x: any) => String(x))
        : [
            `适用于约 ${companySize} 人规模企业的办公健身/健康支持场景`,
            `在约 ${area}㎡ 空间内，可支持 20–30 人 同时使用`,
            "覆盖员工日常健康维护、体能支持与压力释放三类核心需求",
            `预算控制在 ${budgetRange}，优先保障安全性与商用品质`,
            "本方案为标准配置，可根据使用强度与预算进行扩展或精简",
          ];

    for (const b of bullets) {
      y = drawParagraph(page, font, `• ${b}`, margin, y, usableW, 11, rgb(0, 0, 0), 6);
    }
    footer(page, 2);
  }

  // —— Page 3 三档对比 ——
  {
    const page = pdfDoc.addPage(A4);
    header(page, "三档方案配置对比");
    let y = h - margin - 50;

    const blocks = [
      [
        "精简版（Lite）",
        "- 同时使用：10–15 人",
        "- 参与率：10%–15%（企业员工中经常使用的比例）",
        "- 覆盖：基础有氧 + 基础力量",
        "- 适合：试点部署 / 预算敏感",
        "- 特点：最低成本可用，安全优先",
      ],
      [
        "标准版（Standard｜推荐）",
        "- 同时使用：20–30 人",
        "- 参与率：15%–25%（企业员工中经常使用的比例）",
        "- 覆盖：有氧 + 力量 + 拉伸",
        "- 适合：常规办公健身房配置",
        "- 特点：兼顾体验与安全，性价比优先",
      ],
      [
        "强化版（Pro）",
        "- 同时使用：30–40 人",
        "- 参与率：20%–35%（企业员工中经常使用的比例）",
        "- 覆盖：全套训练 + 体测 + 康复增强",
        "- 适合：高使用强度 / 福利型投入",
        "- 特点：体验拉满，可用于品牌/雇主形象展示",
      ],
    ];

    for (const block of blocks) {
      y = drawParagraph(page, font, block.join("\n"), margin, y, usableW, 11, rgb(0, 0, 0), 6);
      y -= 10;
    }

    footer(page, 3);
  }

  type TierKey = "lite" | "standard" | "pro";
  const tiers: {
    key: TierKey;
    title: string;
    simultaneously: string;
    rate: string;
    equip: string[];
    upsell: string[];
  }[] = [
    {
      key: "lite",
      title: "精简版（Lite）",
      simultaneously: "约 10–15 人",
      rate: "10%–15%",
      equip: [
        "【有氧】",
        "- 1 × 商用跑步机",
        "→ 覆盖基础心肺训练需求，适合多数非健身基础员工。",
        "【自由力量】",
        "- 1 × 可调哑铃组",
        "→ 覆盖多关节训练，提升训练灵活性并节省空间。",
        "【拉伸】",
        "- 1 × 拉伸垫+泡沫轴套装",
        "→ 覆盖久坐人群放松需求，作为健身角必备基础。",
      ],
      upsell: [
        "可选增购模块：",
        "- 布局设计：已开启",
        "→ 优化空间利用率，减少安全隐患，提高整体使用体验",
        "- 康复模块：未开启",
        "→ 覆盖久坐人群肩颈/腰背放松需求",
        "- 三维渲染：未开启",
        "→ 用于内部汇报、审批展示与决策沟通",
      ],
    },
    {
      key: "standard",
      title: "标准版（Standard｜推荐）",
      simultaneously: "约 20–30 人",
      rate: "15%–25%",
      equip: [
        "【有氧】",
        "- 2 × 商用跑步机",
        "→ 覆盖基础心肺训练需求，适合多数非健身基础员工。",
        "【力量】",
        "- 1 × 史密斯机",
        "→ 兼顾复合训练能力与企业环境安全性，降低自由重量风险。",
        "【自由力量】",
        "- 1 × 可调哑铃组",
        "→ 满足多数力量训练动作需求，灵活度高。",
        "【拉伸】",
        "- 1 × 拉伸垫+泡沫轴套装",
        "→ 覆盖日常放松与运动恢复。",
      ],
      upsell: [
        "可选增购模块：",
        "- 布局设计：已开启",
        "→ 优化空间利用率，减少安全隐患，提高整体使用体验",
        "- 康复模块：未开启",
        "→ 覆盖久坐人群肩颈/腰背放松需求",
        "- 三维渲染：未开启",
        "→ 用于内部汇报、审批展示与决策沟通",
      ],
    },
    {
      key: "pro",
      title: "强化版（Pro）",
      simultaneously: "约 30–40 人",
      rate: "20%–35%",
      equip: [
        "【有氧】",
        "- 3 × 商用跑步机",
        "→ 提升峰值使用承载能力，适配更高使用频率。",
        "【力量】",
        "- 1 × 史密斯机",
        "→ 企业环境核心器械，安全与可训练性兼顾。",
        "【固定器械】",
        "- 6–10 × 固定力量器械（全身覆盖）",
        "→ 降低学习门槛，提升训练效率。",
        "【自由力量】",
        "- 2 × 可调哑铃组 + 卧推架等",
        "→ 满足进阶训练需求与多样化动作。",
        "【拉伸/康复】",
        "- 拉伸垫+泡沫轴+筋膜枪等",
        "→ 加强久坐人群恢复与放松体验。",
      ],
      upsell: [
        "可选增购模块：",
        "- 布局设计：已开启",
        "→ 优化空间利用率，减少安全隐患，提高整体使用体验",
        "- 康复模块：已开启",
        "→ 覆盖久坐人群肩颈/腰背放松需求",
        "- 三维渲染：已开启",
        "→ 用于内部汇报、审批展示与决策沟通",
      ],
    },
  ];

  function addTierPages(basePageNo: number, tierObj: typeof tiers[number]) {
    const label =
      tierObj.key === "lite"
        ? "精简版（Lite）"
        : tierObj.key === "pro"
          ? "强化版（Pro）"
          : "标准版（Standard｜推荐）";

    // 1) 使用场景与覆盖能力
    {
      const page = pdfDoc.addPage(A4);
      header(page, `${label}｜使用场景与覆盖能力`);
      let y = h - margin - 50;

      const lines = [
        `定位：${positioning}`,
        "使用场景假设：",
        "- 主要使用人群：普通员工 / 无系统健身基础",
        "- 使用高峰时段：18:00–20:00",
        "覆盖能力：",
        `- 同时使用能力：${tierObj.simultaneously}`,
        `- 预计参与率：${tierObj.rate}（企业员工中经常使用的比例）`,
      ];
      y = drawParagraph(page, font, lines.join("\n"), margin, y, usableW, 11, rgb(0, 0, 0), 6);
      footer(page, basePageNo);
    }

    // 2) 器材配置方案
    {
      const page = pdfDoc.addPage(A4);
      header(page, `${label}｜器材配置方案（含配置逻辑）`);
      let y = h - margin - 50;

      y = drawParagraph(page, font, tierObj.equip.join("\n"), margin, y, usableW, 11, rgb(0, 0, 0), 6);
      footer(page, basePageNo + 1);
    }

    // 3) 实施计划与周期
    {
      const page = pdfDoc.addPage(A4);
      header(page, `${label}｜实施计划与周期`);
      let y = h - margin - 50;

      const lines = [
        "阶段 1（1–2 周）",
        "- 需求复核、场地条件确认、设备清单与预算锁定",
        "阶段 2（2–4 周）",
        "- 设备采购、物流、安装调试与基础使用培训",
        "阶段 3（持续）",
        "- 反馈收集、配置优化建议、扩展升级规划",
      ];
      y = drawParagraph(page, font, lines.join("\n"), margin, y, usableW, 11, rgb(0, 0, 0), 6);
      footer(page, basePageNo + 2);
    }

    // 4) 增购模块 / 话术
    {
      const page = pdfDoc.addPage(A4);
      header(page, `${label}｜增购模块 / 推荐说明 / 话术`);
      let y = h - margin - 50;

      y = drawParagraph(page, font, tierObj.upsell.join("\n"), margin, y, usableW, 11, rgb(0, 0, 0), 6);
      footer(page, basePageNo + 3);
    }

    // 5) 风险与不适合
    {
      const page = pdfDoc.addPage(A4);
      header(page, `${label}｜使用风险与不适合说明`);
      let y = h - margin - 50;

      const lines = [
        "使用前提：",
        "- 适用于身体健康、无重大运动禁忌的员工人群",
        "- 建议制定基础使用规范与安全提示（企业环境必备）",
        "不适合场景：",
        "- 员工以康复/医疗训练为主要需求（建议定制化康复方案）",
        "- 场地层高/承重/通风条件无法满足设备与安全要求",
        "- 无法安排任何形式的使用管理或安全提示机制",
      ];
      y = drawParagraph(page, font, lines.join("\n"), margin, y, usableW, 11, rgb(0, 0, 0), 6);
      footer(page, basePageNo + 4);
    }
  }

  // Lite: pages 4-8
  addTierPages(4, tiers[0]);
  // Standard: pages 9-13
  addTierPages(9, tiers[1]);
  // Pro: pages 14-18
  addTierPages(14, tiers[2]);

  // ===== 附录 A-D（19-22）=====
  // 附录 A：器材明细表（示例结构，可接入真实清单）
  {
    const pageNo = 19;
    const page = pdfDoc.addPage(A4);
    header(page, "附录 A｜器材明细表（示例结构，可接入真实清单）");
    let y = h - margin - 60;

    const lines = [
      "品类  名称  数量  备注",
      "有氧  商用跑步机  2  建议带减震/低噪/耐用",
      "力量  史密斯机  1  企业安全优先",
      "自由力量  可调哑铃组  1  节省空间，覆盖动作广",
      "拉伸  瑜伽垫/泡沫轴  1批  久坐人群必备",
      "",
      "说明：该页为“结构化明细表”版式示例。接入真实清单后，会自动分页输出。",
    ];
    y = drawParagraph(page, font, lines.join("\n"), margin, y, usableW, 11, rgb(0, 0, 0), 6);
    footer(page, pageNo);
  }

  // 附录 B：品牌建议
  {
    const pageNo = 20;
    const page = pdfDoc.addPage(A4);
    header(page, "附录 B｜品牌建议（按品类）");
    let y = h - margin - 60;

    const lines = [
      "• 有氧设备",
      "优先选择商用耐久、低噪、维护网络完善的品牌；关注电机寿命与减震结构。",
      "",
      "• 力量/固定器械",
      "企业场景优先“安全轨道/限位/稳定性”；关注钢材厚度、焊点、质保。",
      "",
      "• 自由力量",
      "优先考虑可调哑铃与模块化架体；关注握感、防锈、掉落保护。",
      "",
      "• 辅材/耗材",
      "地垫防滑耐磨、无异味；弹力带/瑜伽垫需耐用与易清洁。",
    ];

    y = drawParagraph(page, font, lines.join("\n"), margin, y, usableW, 11, rgb(0, 0, 0), 6);
    footer(page, pageNo);
  }

  // 附录 C：补充说明
  {
    const pageNo = 21;
    const page = pdfDoc.addPage(A4);
    header(page, "附录 C｜补充说明（口径/维护/运营）");
    let y = h - margin - 60;

    const lines = [
      `• 参与率说明：参与率 = 在企业总人数里，预计“经常使用健身房”的那一部分比例。`,
      `• 本次生成参与率取值：${Math.round(participation * 100)}%（若未填写，则按默认经验假设）。`,
      "• 建议配置：安全提示上墙、基础动作引导、器材巡检台账与简易报修流程。",
      "• 维护建议：每月例行检查（螺丝紧固/跑带磨损/润滑），高频设备建议备件。",
      "• 运营建议：高峰时段限流、预约制度（可选）、新员工入门课程（可选）。",
    ];
    y = drawParagraph(page, font, lines.join("\n"), margin, y, usableW, 11, rgb(0, 0, 0), 8);
    footer(page, pageNo);
  }

  // 附录 D：其他备注
  {
    const pageNo = 22;
    const page = pdfDoc.addPage(A4);
    header(page, "附录 D｜其他备注（免责声明/复核清单）");
    let y = h - margin - 60;

    const lines = [
      "• 本方案为自动生成建议，最终落地需结合场地承重/层高/通风/消防要求进行复核。",
      "• 若用于采购，请补充：品牌型号、质保条款、安装方案、运输及施工范围。",
      "• 复核清单：",
      " - 场地承重与地面找平是否满足器械要求",
      " - 电源点位与功率冗余是否足够",
      " - 通风/空调/除味是否满足高峰使用",
      " - 安全提示、紧急预案与管理机制是否建立",
    ];
    y = drawParagraph(page, font, lines.join("\n"), margin, y, usableW, 11, rgb(0, 0, 0), 8);
    footer(page, pageNo);
  }

  return await pdfDoc.save();
}

/* =========================================================
   ✅ 预算 PDF：真正表格版（2 页）
   - 第 1 页：预算对比表 + 分品类预算明细表（含合计在表格内）
   - 第 2 页：补充说明（可扩展）
   ========================================================= */

type TableCell = string;
type TableRow = TableCell[];

function drawTable(opts: {
  page: PDFPage;
  font: PDFFont;
  x: number;
  yTop: number;            // 表格顶部 y
  maxWidth: number;
  colWidths: number[];     // 需要 sum <= maxWidth
  header: TableRow;
  rows: TableRow[];
  fontSize?: number;
  headerFontSize?: number;
  rowMinH?: number;
}) {
  const {
    page,
    font,
    x,
    yTop,
    maxWidth,
    colWidths,
    header,
    rows,
    fontSize = 10,
    headerFontSize = 10,
    rowMinH = 20,
  } = opts;

  const border = rgb(0.8, 0.8, 0.8);
  const headerBg = rgb(0.95, 0.95, 0.95);
  const textColor = rgb(0.1, 0.1, 0.1);

  const totalW = colWidths.reduce((a, b) => a + b, 0);
  if (totalW > maxWidth + 0.1) {
    throw new Error(`drawTable: colWidths sum(${totalW}) > maxWidth(${maxWidth})`);
  }

  const cellPadX = 6;
  const cellPadY = 6;

  const measureLines = (txt: string, size: number, w: number) =>
    wrapTextByChar(font, txt, size, w - cellPadX * 2);

  const calcRowH = (cells: string[], size: number) => {
    const heights = cells.map((c, idx) => {
      const lines = measureLines(String(c ?? ""), size, colWidths[idx]);
      const h = lines.length * (size + 3) + cellPadY * 2;
      return Math.max(h, rowMinH);
    });
    return Math.max(...heights);
  };

  let y = yTop;

  // --- header row ---
  const headerH = calcRowH(header, headerFontSize);

  // header bg
  page.drawRectangle({
    x,
    y: y - headerH,
    width: totalW,
    height: headerH,
    color: headerBg,
    borderColor: border,
    borderWidth: 1,
  });

  // vertical lines + text
  let cx = x;
  for (let i = 0; i < header.length; i++) {
    const wcol = colWidths[i];
    const lines = measureLines(String(header[i] ?? ""), headerFontSize, wcol);
    let ty = y - cellPadY - headerFontSize;
    for (const ln of lines) {
      page.drawText(ln, { x: cx + cellPadX, y: ty, size: headerFontSize, font, color: textColor });
      ty -= headerFontSize + 3;
    }

    // vertical border line (except first already)
    if (i > 0) {
      page.drawLine({
        start: { x: cx, y: y },
        end: { x: cx, y: y - headerH },
        thickness: 1,
        color: border,
      });
    }
    cx += wcol;
  }

  y -= headerH;

  // --- body rows ---
  for (const r of rows) {
    const rowH = calcRowH(r, fontSize);

    // row box
    page.drawRectangle({
      x,
      y: y - rowH,
      width: totalW,
      height: rowH,
      color: rgb(1, 1, 1),
      borderColor: border,
      borderWidth: 1,
    });

    let cxx = x;
    for (let i = 0; i < colWidths.length; i++) {
      const wcol = colWidths[i];
      const txt = String(r[i] ?? "");
      const lines = measureLines(txt, fontSize, wcol);

      let ty = y - cellPadY - fontSize;
      for (const ln of lines) {
        page.drawText(ln, { x: cxx + cellPadX, y: ty, size: fontSize, font, color: textColor });
        ty -= fontSize + 3;
      }

      if (i > 0) {
        page.drawLine({
          start: { x: cxx, y: y },
          end: { x: cxx, y: y - rowH },
          thickness: 1,
          color: border,
        });
      }
      cxx += wcol;
    }

    y -= rowH;
  }

  return y; // 返回表格底部 y
}

async function renderBudgetPdfV2_Table(planId: string, plan: any | null) {
  const pdfDoc = await PDFDocument.create();
  const font = await embedCJKFont(pdfDoc);

  const A4: [number, number] = [595, 842];
  const margin = 48;
  const w = A4[0];
  const h = A4[1];
  const usableW = w - margin * 2;

  const version = "BUDGET_PDF_V20260207_01";
  const ts = isoNow();

  const profile = plan?.client_profile;

  const companyName =
    plan?.company?.name || profile?.company_name || "示例企业";

  const headcount =
    plan?.company?.headcount ??
    profile?.company_size ??
    200;

  // 预算等级：从 plan 或 profile 推断；默认“中”
  const budgetTierRaw =
    plan?.budgetTier || plan?.budget_tier || profile?.budget_tier || "mid";

  const tierKey =
    String(budgetTierRaw).toLowerCase().includes("high") ? "high"
    : String(budgetTierRaw).toLowerCase().includes("low") ? "low"
    : "mid";

  const budgetTierLabel = tierKey === "low" ? "低" : tierKey === "high" ? "高" : "中";

  // 预算区间（你后面可接 DB）
  const totalRange = {
    low: { overall: [50000, 100000], sum: [38000, 95000] },
    mid: { overall: [200000, 450000], sum: [180000, 420000] },
    high: { overall: [600000, 1500000], sum: [560000, 1360000] },
  };

  const overall = totalRange[tierKey].overall;
  const sum = totalRange[tierKey].sum;

  const catRows = [
    { cat: "有氧设备", unit: "¥6,000-15,000/台", qty: "跑步机3-4台；椭圆机2-3台", sub: [60000, 150000] },
    { cat: "力量设备（固定器械）", unit: "¥9,000-20,000/台", qty: "6-10台（全部位覆盖）", sub: [80000, 180000] },
    { cat: "自由力量设备", unit: "哑铃(套)¥4,000-8,000…", qty: "哑铃2套；卧推架…", sub: [30000, 60000] },
    { cat: "辅助设备", unit: "¥100-1,000/件", qty: "瑜伽垫50-80张；…", sub: [10000, 30000] },
  ];

  // Page 1（表格版）
  {
    const page = pdfDoc.addPage(A4);
    let y = h - margin - 30;

    page.drawText("企业健身房预算方案（设备报价映射）", { x: margin, y, size: 18, font });
    y -= 22;

    page.drawText(`${version} | ${ts}`, { x: margin, y, size: 10, font, color: rgb(0.35, 0.35, 0.35) });
    y -= 18;

    const meta = [
      `Plan ID：${planId}`,
      `企业名称：${companyName}`,
      `企业规模：${headcount} 人`,
      `预算等级：${budgetTierLabel}`,
    ];
    y = drawParagraph(page, font, meta.join("\n"), margin, y, usableW, 11, rgb(0.1, 0.1, 0.1), 6);
    y -= 8;

    y = drawParagraph(page, font, "整体预算区间（含基础器材+配套，含税含安装）", margin, y, usableW, 11, rgb(0, 0, 0), 6);
    y = drawParagraph(page, font, `表内整体总计区间：${formatMoneyRange(overall[0], overall[1])}`, margin, y, usableW, 10, rgb(0, 0, 0), 6);
    y = drawParagraph(page, font, `按分项小计加总估算：${formatMoneyRange(sum[0], sum[1])}`, margin, y, usableW, 10, rgb(0, 0, 0), 6);
    y -= 10;

    // ---- 表 1：预算对比（低/中/高）----
    y = drawParagraph(page, font, "预算对比（低 / 中 / 高）", margin, y, usableW, 11, rgb(0, 0, 0), 6);
    y -= 6;

    const compHeader = ["档位", "整体总计区间", "分项加总估算"];
    const compRows: TableRow[] = [
      ["低", formatMoneyRange(totalRange.low.overall[0], totalRange.low.overall[1]), formatMoneyRange(totalRange.low.sum[0], totalRange.low.sum[1])],
      ["中", formatMoneyRange(totalRange.mid.overall[0], totalRange.mid.overall[1]), formatMoneyRange(totalRange.mid.sum[0], totalRange.mid.sum[1])],
      ["高", formatMoneyRange(totalRange.high.overall[0], totalRange.high.overall[1]), formatMoneyRange(totalRange.high.sum[0], totalRange.high.sum[1])],
    ];

    y = drawTable({
      page,
      font,
      x: margin,
      yTop: y,
      maxWidth: usableW,
      colWidths: [60, 210, usableW - 60 - 210],
      header: compHeader,
      rows: compRows,
      fontSize: 10,
      headerFontSize: 10,
      rowMinH: 20,
    }) - 14;

    // ---- 表 2：分品类预算明细（4 列 + 合计在表内）----
    y = drawParagraph(page, font, "分品类预算明细", margin, y, usableW, 11, rgb(0, 0, 0), 6);
    y -= 6;

    const detailHeader = ["设备分类", "单价区间", "常规数量", "单类小计"];
    const detailRows: TableRow[] = catRows.map((r) => [
      r.cat,
      r.unit,
      r.qty,
      formatMoneyRange(r.sub[0], r.sub[1]),
    ]);

    // ✅ 合计行放入表格内
    detailRows.push([
      "合计（分项加总）",
      "-",
      "-",
      formatMoneyRange(sum[0], sum[1]),
    ]);

    drawTable({
      page,
      font,
      x: margin,
      yTop: y,
      maxWidth: usableW,
      colWidths: [120, 140, 160, usableW - 120 - 140 - 160],
      header: detailHeader,
      rows: detailRows,
      fontSize: 10,
      headerFontSize: 10,
      rowMinH: 22,
    });

    page.drawText("第 1 页", { x: margin, y: margin - 12, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  }

  // Page 2（补充说明）
  {
    const page = pdfDoc.addPage(A4);
    let y = h - margin - 40;

    const participation =
      plan?.client_profile?.participation ??
      plan?.participation ??
      0.3;

    const lines = [
      "补充说明",
      "",
      "1) 表内价格为经验区间，最终以品牌型号、质保条款、安装/运输范围为准。",
      "2) 高预算等级可额外增加智能健身镜、体测仪、健身房管理系统等增值设备，费用另计。",
      "3) 小型健身角（10-20人）低预算总计可压缩至 ¥20,000-¥40,000（保留1-2台有氧+简易力量设备）。",
      "4) 不同品牌（国产/进口）、材质、功能会导致单价上下浮动 10%-30%。",
      `5) 参与率说明：参与率 = 在企业总人数里，预计“经常使用健身房”的那一部分比例（当前：${Math.round(participation * 100)}%）。`,
    ];

    y = drawParagraph(page, font, lines.join("\n"), margin, y, usableW, 11, rgb(0.1, 0.1, 0.1), 8);
    page.drawText("第 2 页", { x: margin, y: margin - 12, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  }

  return await pdfDoc.save();
}

// 保留一个轻预览（不影响目标文档）
async function renderPreviewPdf(planId: string, plan: any | null) {
  const pdfDoc = await PDFDocument.create();
  const font = await embedCJKFont(pdfDoc);

  const A4: [number, number] = [595, 842];
  const margin = 48;
  const h = A4[1];
  const usableW = A4[0] - margin * 2;

  const profile = plan?.client_profile;
  const industry = profile?.industry || "未填写";
  const title = "办公健康支持方案（预览）";

  // p1
  {
    const page = pdfDoc.addPage(A4);
    let y = h - margin - 30;
    page.drawText(title, { x: margin, y, size: 22, font });
    y -= 42;
    y = drawParagraph(page, font, `Plan ID：${planId}\n行业：${industry}\n导出时间：${isoNow()}`, margin, y, usableW, 11);
    page.drawText("第 1 页", { x: margin, y: margin - 12, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  }

  return await pdfDoc.save();
}
