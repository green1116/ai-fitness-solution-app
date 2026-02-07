// lib/pdf/loadPlan.ts
import fs from "fs";
import path from "path";

export type PlanJson = {
  meta?: {
    planId?: string;
    title?: string;
    version?: string;
    currency?: string;
  };
  company?: {
    name?: string;
    headcount?: number;
    participationRate?: number; // 0~1
    participationNote?: string;
  };
  summary?: {
    goal?: string;
    durationMonths?: number;
  };
  budget?: {
    items?: Array<{
      category?: string;
      name?: string;
      unitPrice?: number;
      quantity?: number;
    }>;
  };
  remarks?: string[];
};

function safePlanId(input: string) {
  const s = (input || "").trim();
  if (!/^[a-z0-9][a-z0-9\-]{1,80}$/i.test(s)) {
    throw new Error(`Invalid planId: ${s}`);
  }
  return s;
}

export function getPlanJsonPath(planId: string) {
  const id = safePlanId(planId);
  // 方向A：plans/<planId>/plan.json
  return path.join(process.cwd(), "plans", id, "plan.json");
}

export function loadPlanJsonFromDisk(planId: string): PlanJson {
  const filePath = getPlanJsonPath(planId);
  if (!fs.existsSync(filePath)) {
    throw new Error(`plan.json not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf8"); // 明确用 utf8 读
  let obj: any;
  try {
    obj = JSON.parse(raw);
  } catch (e: any) {
    throw new Error(`Invalid JSON in ${filePath}: ${e?.message || e}`);
  }

  // 轻量规范化：保证关键字段存在，避免渲染时到处判空
  const normalized: PlanJson = {
    meta: {
      planId: obj?.meta?.planId ?? planId,
      title: obj?.meta?.title ?? "",
      version: obj?.meta?.version ?? "",
      currency: obj?.meta?.currency ?? "CNY",
    },
    company: {
      name: obj?.company?.name ?? "",
      headcount: Number(obj?.company?.headcount ?? 0),
      participationRate:
        typeof obj?.company?.participationRate === "number"
          ? obj.company.participationRate
          : 0,
      participationNote: obj?.company?.participationNote ?? "",
    },
    summary: {
      goal: obj?.summary?.goal ?? "",
      durationMonths: Number(obj?.summary?.durationMonths ?? 0),
    },
    budget: {
      items: Array.isArray(obj?.budget?.items) ? obj.budget.items : [],
    },
    remarks: Array.isArray(obj?.remarks) ? obj.remarks : [],
  };

  return normalized;
}

export function calcBudgetTotals(plan: PlanJson) {
  const items = plan.budget?.items || [];
  const rows = items.map((it) => {
    const unitPrice = Number(it?.unitPrice ?? 0);
    const quantity = Number(it?.quantity ?? 0);
    const lineTotal = unitPrice * quantity;
    return {
      category: String(it?.category ?? ""),
      name: String(it?.name ?? ""),
      unitPrice,
      quantity,
      lineTotal,
    };
  });
  const grandTotal = rows.reduce((sum, r) => sum + (Number.isFinite(r.lineTotal) ? r.lineTotal : 0), 0);
  return { rows, grandTotal };
}
