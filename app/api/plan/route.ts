import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { Plan, generatePlanId, validatePlan } from "@/lib/types/plan";
import {
  buildPlanPrompt,
  getDefaultSystemPrompt,
  buildUserPrompt,
} from "@/lib/prompts/plan-prompt";
import { prisma } from "@/lib/prisma";
import { deepSnakeToCamel } from "@/lib/plan-utils";
import { signDownloadJwt } from "@/lib/download-token";

export const runtime = "nodejs";

/**
 * Plan JSON Schema（Zod 验证）
 * 用于严格验证 LLM 输出的 JSON 格式
 */
const PlanSchema = z.object({
  meta: z.object({
    plan_id: z.string(),
    proposalNo: z.string().optional(), // 兼容旧字段
    generated_at: z.string(),
    version: z.string(),
    created_at: z.string().optional(),
  }),
  client_profile: z.object({
    company_size: z.number(),
    industry: z.string().optional(),
    space_area: z.number(),
    scene: z.string(),
    budget_range: z.string(),
    potential_scope: z.array(z.string()).optional(), // ✅ 给工程CTA用（可选）
    // 兼容旧字段
    companySize: z.number().optional(),
    area: z.number().optional(),
    scenario: z.string().optional(),
    budget: z.string().optional(),
  }),
  solution_summary: z.object({
    management_conclusion: z.array(z.string()),
  }),
  equipment_plan: z.array(
    z.object({
      category: z.string(),
      items: z.array(
        z.object({
          name: z.string(),
          qty: z.number(),
          price_level: z.enum(["低", "中", "高"]).optional(),
          purpose: z.string().optional(),
          budget: z.string().optional(),
          reason: z.string().optional(), // 兼容旧字段
        })
      ),
    })
  ),
  implementation: z.object({
    phase_1: z.string(),
    phase_2: z.string(),
    phase_3: z.string(),
  }),
  upsell_modules: z.object({
    layout_design: z.boolean(),
    "3d_render": z.boolean(),
    rehab_module: z.boolean(),
  }),
  pricing_summary: z
    .object({
      confidence: z.enum(["低", "中", "高"]),
      range_total: z.string(),
      breakdown: z.array(
        z.object({
          name: z.string(),
          range: z.string(),
        })
      ),
      assumptions: z.array(z.string()),
    })
    .optional(), // v1.1 新增，可选
  next_actions: z.array(z.string()).optional(),
});

type PlanFromSchema = z.infer<typeof PlanSchema>;

/**
 * 数据流向架构：
 * 
 * 表单 → LLM → plan.json（唯一事实源）→ PDF 渲染 / 后台留资 / 销售/升级
 * 
 * 此 API 负责：
 * 1. 接收表单数据
 * 2. 构建包含 JSON schema 的 prompt
 * 3. 调用 LLM 生成 plan.json
 * 4. 返回标准的 plan.json 格式
 * 5. （可选）保存 plan.json 到数据库
 */
export async function POST(req: NextRequest) {
  try {
    const input = await req.json();

    // 构建包含 JSON schema 要求的 prompt
    const systemPrompt = getDefaultSystemPrompt();
    const userPrompt = buildUserPrompt(input);
    const { system, user } = buildPlanPrompt(systemPrompt, userPrompt);

    // 尝试调用外部 LLM API，生成 plan.json
    let planJson: Plan;
    try {
      // 调用 LLM API，传递完整的 prompt（包含 JSON schema 要求）
      const response = await fetch("https://your-java-api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 保留原始输入数据（向后兼容）
          ...input,
          // 添加 prompt 信息（LLM API 应该使用这些来构建完整的 prompt）
          system_prompt: system,
          user_prompt: user,
          // 明确要求 JSON 输出
          response_format: "json",
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from API');
      }

      // ✅ 防御：清理 JSON 文本（移除可能的 markdown 代码块标记）
      const raw = responseText.trim();
      const jsonText = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      // 解析 JSON
      let parsed: any;
      try {
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        console.error("Failed to parse LLM response as JSON:", jsonText.substring(0, 200));
        throw new Error(`LLM 返回的不是有效的 JSON 格式: ${parseError}`);
      }

      // ✅ 使用 Zod Schema 严格验证（结构不对会直接报错）
      try {
        planJson = PlanSchema.parse(parsed) as Plan;
        console.log("[Plan API] LLM 输出通过 Zod 验证");
        
        // ✅ 确保 plan_id 真唯一（如果缺失或格式不对，重新生成）
        if (!planJson.meta.plan_id || !planJson.meta.plan_id.match(/^ATG-\d{8}-\d{4}$/)) {
          console.warn("[Plan API] plan_id 格式不正确，重新生成:", planJson.meta.plan_id);
          planJson.meta.plan_id = generatePlanId();
        }
      } catch (schemaError: any) {
        // Schema 验证失败，使用转换函数
        console.warn("[Plan API] LLM 输出不符合 Schema，使用转换函数:", schemaError.message);
        planJson = convertToStandardPlan(parsed, input);
        
        // 转换后再次验证
        try {
          planJson = PlanSchema.parse(planJson) as Plan;
        } catch (convertedError: any) {
          console.error("[Plan API] 转换后的数据仍不符合 Schema:", convertedError.message);
          // 如果转换后仍不符合，使用 mock 数据
          planJson = generateMockPlan(input);
          planJson = PlanSchema.parse(planJson) as Plan;
        }
      }
    } catch (apiError) {
      // LLM API 不可用时，使用模拟数据生成标准的 plan.json
      console.warn('LLM API unavailable, using mock plan.json:', apiError);
      planJson = generateMockPlan(input);
    }

    // ✅ 最终验证：使用 Zod Schema 确保输出符合标准（结构不对会直接报错）
    try {
      planJson = PlanSchema.parse(planJson) as Plan;
      
      // ✅ 确保 plan_id 真唯一（如果缺失或格式不对，重新生成）
      if (!planJson.meta.plan_id || !planJson.meta.plan_id.match(/^ATG-\d{8}-\d{4}$/)) {
        console.warn("[Plan API] plan_id 格式不正确，重新生成:", planJson.meta.plan_id);
        planJson.meta.plan_id = generatePlanId();
      }
    } catch (finalError: any) {
      console.error("[Plan API] 最终验证失败:", finalError.message);
      // 如果最终验证失败，使用 mock 数据作为 fallback
      console.warn("[Plan API] 使用 mock 数据作为 fallback");
      planJson = generateMockPlan(input);
      planJson = PlanSchema.parse(planJson) as Plan; // Mock 数据应该总是符合 Schema
    }

    // 1️⃣ 先保存 JSON 到文件系统（唯一数据源）
    // savePlanJson(planJson); // 暂时注释，数据库已经是主存储了

    // 2️⃣ 保存 plan.json 到数据库（Prisma）- 使用 planJob 模型
    try {
      await (prisma as any).planJob.create({
        data: {
          id: planJson.meta.plan_id,
          input,
          plan: planJson as any,
          status: "generated",
        },
      });
      console.log("[Plan API] Plan 已保存到数据库，plan_id:", planJson.meta.plan_id);
    } catch (dbError: any) {
      // 数据库保存失败不影响主流程，只记录错误
      console.error("[Plan API] 保存 Plan 到数据库失败:", dbError?.message || dbError);
    }

    // 生成下载 token 和下载链接
    const planId = planJson.meta.plan_id;
    const token = await signDownloadJwt({
      planId,
      mode: "full",
    });
    const downloadUrl =
      `/api/pdf?planId=${encodeURIComponent(planId)}` +
      `&downloadToken=${encodeURIComponent(token)}` +
      `&mode=full` +
      `&reason=${encodeURIComponent("plan_api")}`;

    // 返回 plan_id 和下载链接（数据库保存成功）
    return NextResponse.json({
      ok: true,
      planId,
      plan_id: planId, // 保留原有字段以兼容
      downloadUrl,
    });
  } catch (error: any) {
    console.error('Plan generation error:', error);
    return NextResponse.json(
      { error: "生成方案失败", detail: error?.message || "未知错误" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/plan?plan_id=xxx
 * 
 * 从数据库或文件系统读取 plan.json
 * 优先级：数据库 > 文件系统
 */
export async function GET(req: NextRequest) {
  try {
    // 从 URL 查询参数获取 plan_id
    const url = new URL(req.url);
    const planId = url.searchParams.get("plan_id");
    
    if (!planId) {
      return NextResponse.json({ error: "Missing plan_id" }, { status: 400 });
    }

    let plan: Plan;

    // 1️⃣ 优先从数据库读取
    try {
      const row = await (prisma as any).planJob.findUnique({
        where: { id: planId },
      });

      if (row) {
        // ✅ 转换 snake_case 为 camelCase
        const raw = row.plan ?? row.input ?? {};
        const normalized = deepSnakeToCamel(raw);
        // ✅ 使用 Zod Schema 验证数据
        plan = PlanSchema.parse(normalized);
        console.log("[Plan API] Plan 从数据库读取成功:", planId);
        return NextResponse.json(plan);
      }
    } catch (dbError: any) {
      console.warn("[Plan API] 从数据库读取失败，尝试文件系统:", dbError?.message);
    }

    // 2️⃣ 从文件系统读取（fallback）
    try {
      const p = path.join(process.cwd(), "plans", planId, "plan.json");
      const fileContent = await fs.readFile(p, "utf-8");
      plan = PlanSchema.parse(JSON.parse(fileContent));
      console.log("[Plan API] Plan 从文件系统读取成功:", planId);
      return NextResponse.json(plan);
    } catch (fileError: any) {
      // 文件不存在或其他错误
      if ((fileError as any)?.code === "ENOENT") {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }
      throw fileError;
    }
  } catch (error: any) {
    console.error("[Plan API] GET failed:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid plan data", detail: error.format() },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch plan", detail: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * 将 LLM 响应转换为标准的 plan.json 格式
 */
function convertToStandardPlan(aiResponse: any, input: any): Plan {
  const planId = aiResponse.meta?.plan_id || generatePlanId();
  const dateStr = new Date().toISOString().split("T")[0];

  // 转换设备列表：从扁平数组转换为分类数组
  const equipmentMap = new Map<string, any[]>();
  if (Array.isArray(aiResponse.equipment)) {
    for (const item of aiResponse.equipment) {
      const category = item.category || "其他";
      if (!equipmentMap.has(category)) {
        equipmentMap.set(category, []);
      }
      equipmentMap.get(category)!.push({
        name: item.name,
        qty: item.qty || 1,
        price_level: item.price_level || "中",
        purpose: item.reason || item.purpose || "",
      });
    }
  }

  const equipmentPlan = Array.from(equipmentMap.entries()).map(([category, items]) => ({
    category,
    items,
  }));

  return {
    meta: {
      plan_id: planId,
      proposalNo: planId, // 兼容旧字段
      generated_at: dateStr,
      version: aiResponse.meta?.version || "v1",
    },
    client_profile: {
      company_size: Number(input.companySize) || 0,
      industry: input.industry || input.scenario || "企业办公",
      space_area: Number(input.area) || 0,
      scene: input.scenario || "办公楼",
      budget_range: input.budget || input.budgetRange || "5-10万",
      // 优先从表单获取，其次从 LLM 响应获取，最后默认空数组（不勾选时）
      potential_scope:
        (Array.isArray(input.potential_scope) && input.potential_scope.length > 0
          ? input.potential_scope
          : undefined) ||
        aiResponse.client_profile?.potential_scope ||
        (Array.isArray(aiResponse.potential_scope) ? aiResponse.potential_scope : undefined) ||
        [], // 默认空数组（不勾选时）
    },
    solution_summary: {
      management_conclusion: Array.isArray(aiResponse.summary)
        ? aiResponse.summary
        : aiResponse.summary
        ? [aiResponse.summary]
        : [],
    },
    equipment_plan: equipmentPlan.length > 0 ? equipmentPlan : [
      {
        category: "基础设备",
        items: [{ name: "待配置", qty: 1, price_level: "中" }],
      },
    ],
    implementation: {
      phase_1: aiResponse.steps?.[0]
        ? `${aiResponse.steps[0].title}（${aiResponse.steps[0].duration}）`
        : "方案确认（7天）",
      phase_2: aiResponse.steps?.[1]
        ? `${aiResponse.steps[1].title}（${aiResponse.steps[1].duration}）`
        : "采购与安装（30天）",
      phase_3: aiResponse.steps?.[2]
        ? `${aiResponse.steps[2].title}（${aiResponse.steps[2].duration}）`
        : "运营优化（90天）",
    },
    upsell_modules: {
      layout_design: aiResponse.upsellHints?.includes("平面布局深化") || false,
      "3d_render": aiResponse.upsellHints?.includes("三维空间设计与渲染") || false,
      rehab_module: aiResponse.upsellHints?.includes("康复模块") || false,
    },
    pricing_summary: aiResponse.pricing_summary || {
      confidence: "中",
      range_total: input.budget || input.budgetRange || "5-10万",
      breakdown: [
        { name: "设备", range: "3-6万" },
        { name: "运输安装", range: "0.5-1.5万" },
        { name: "基础运维", range: "0.5-1万" },
      ],
      assumptions: [
        "不含硬装改造与强电增容",
        "设备品牌为主流商用入门-中端",
      ],
    },
    next_actions: aiResponse.next_actions || [
      "提交平面图深化",
      "获取精确报价",
      "联系顾问",
    ],
  };
}

/**
 * 生成模拟的 plan.json（用于开发测试）
 */
function generateMockPlan(input: any): Plan {
  const planId = generatePlanId();
  const dateStr = new Date().toISOString().split("T")[0];

  return {
    meta: {
      plan_id: planId,
      proposalNo: planId,
      generated_at: dateStr,
      version: "v1",
    },
    client_profile: {
      company_size: Number(input.companySize) || 150,
      industry: "企业办公",
      space_area: Number(input.area) || 200,
      scene: input.scenario || "办公楼",
      budget_range: input.budget || "5-10万",
      // 如果表单没有传递 potential_scope，默认只包含"企业健身空间"（不勾选时）
      potential_scope:
        (Array.isArray(input.potential_scope) && input.potential_scope.length > 0
          ? input.potential_scope
          : ["企业健身空间"]), // 默认只含"企业健身空间"
    },
    solution_summary: {
      management_conclusion: [
        `适用于 ${input.companySize || 150} 人规模企业`,
        `${input.area || 200}㎡ 可落地基础有氧+力量`,
        `预算控制在 ${input.budget || "5-10万"}`,
      ],
    },
    equipment_plan: [
      {
        category: "有氧",
        items: [
          { name: "跑步机", qty: 1, price_level: "中", purpose: "适合有氧训练" },
        ],
      },
    ],
    implementation: {
      phase_1: "方案确认（7天）",
      phase_2: "采购与安装（30天）",
      phase_3: "运营优化（90天）",
    },
    upsell_modules: {
      layout_design: true,
      "3d_render": false,
      rehab_module: false,
    },
    pricing_summary: {
      confidence: "中",
      range_total: input.budget || "5-10万",
      breakdown: [
        { name: "设备", range: "3-6万" },
        { name: "运输安装", range: "0.5-1.5万" },
        { name: "基础运维", range: "0.5-1万" },
      ],
      assumptions: [
        "不含硬装改造与强电增容",
        "设备品牌为主流商用入门-中端",
      ],
    },
    next_actions: [
      "提交平面图深化",
      "获取精确报价",
      "联系顾问",
    ],
  };
}
