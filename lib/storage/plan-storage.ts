/**
 * Plan 文件存储工具
 * 
 * 目录结构：
 * /plans
 *   /ATG-20260120-2744
 *     ├── plan.json
 *     ├── plan.pdf
 */

import fs from "fs";
import path from "path";
import { Plan } from "@/lib/types/plan";

const PLANS_DIR = path.join(process.cwd(), "plans");

/**
 * 确保 plans 目录存在
 */
function ensurePlansDir() {
  if (!fs.existsSync(PLANS_DIR)) {
    fs.mkdirSync(PLANS_DIR, { recursive: true });
  }
}

/**
 * 获取 plan 目录路径
 */
function getPlanDir(planId: string): string {
  ensurePlansDir();
  return path.join(PLANS_DIR, planId);
}

/**
 * 确保 plan 目录存在
 */
function ensurePlanDir(planId: string): string {
  const planDir = getPlanDir(planId);
  if (!fs.existsSync(planDir)) {
    fs.mkdirSync(planDir, { recursive: true });
  }
  return planDir;
}

/**
 * 保存 plan.json 到文件系统
 * 
 * @param plan Plan 对象
 * @returns 保存的文件路径
 */
export function savePlanJson(plan: Plan): string {
  const planId = plan.meta.plan_id;
  const planDir = ensurePlanDir(planId);
  const jsonPath = path.join(planDir, "plan.json");
  
  fs.writeFileSync(jsonPath, JSON.stringify(plan, null, 2), "utf-8");
  console.log(`[Plan Storage] Saved plan.json: ${jsonPath}`);
  
  return jsonPath;
}

/**
 * 从文件系统读取 plan.json
 * 
 * @param planId Plan ID
 * @returns Plan 对象，如果不存在则返回 null
 */
export function loadPlanJson(planId: string): Plan | null {
  const jsonPath = path.join(getPlanDir(planId), "plan.json");
  
  if (!fs.existsSync(jsonPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(jsonPath, "utf-8");
    const plan = JSON.parse(content) as Plan;
    console.log(`[Plan Storage] Loaded plan.json: ${jsonPath}`);
    return plan;
  } catch (error) {
    console.error(`[Plan Storage] Failed to load plan.json: ${jsonPath}`, error);
    return null;
  }
}

/**
 * 保存 plan.pdf 到文件系统
 * 
 * @param planId Plan ID
 * @param pdfBuffer PDF Buffer
 * @returns 保存的文件路径
 */
export function savePlanPdf(planId: string, pdfBuffer: Buffer): string {
  const planDir = ensurePlanDir(planId);
  const pdfPath = path.join(planDir, "plan.pdf");
  
  fs.writeFileSync(pdfPath, pdfBuffer);
  console.log(`[Plan Storage] Saved plan.pdf: ${pdfPath}`);
  
  return pdfPath;
}

/**
 * 从文件系统读取 plan.pdf
 * 
 * @param planId Plan ID
 * @returns PDF Buffer，如果不存在则返回 null
 */
export function loadPlanPdf(planId: string): Buffer | null {
  const pdfPath = path.join(getPlanDir(planId), "plan.pdf");
  
  if (!fs.existsSync(pdfPath)) {
    return null;
  }
  
  try {
    const buffer = fs.readFileSync(pdfPath);
    console.log(`[Plan Storage] Loaded plan.pdf: ${pdfPath}`);
    return buffer;
  } catch (error) {
    console.error(`[Plan Storage] Failed to load plan.pdf: ${pdfPath}`, error);
    return null;
  }
}

/**
 * 检查 plan.json 是否存在
 */
export function planJsonExists(planId: string): boolean {
  const jsonPath = path.join(getPlanDir(planId), "plan.json");
  return fs.existsSync(jsonPath);
}

/**
 * 检查 plan.pdf 是否存在
 */
export function planPdfExists(planId: string): boolean {
  const pdfPath = path.join(getPlanDir(planId), "plan.pdf");
  return fs.existsSync(pdfPath);
}


