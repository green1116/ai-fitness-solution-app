/**
 * 【仅开发/测试】将指定 planId 下所有 UpgradeOrder / LicenseKey 提升为 enterprise，
 * 便于本地验证 /api/entitlements 返回 zipEnabled: true 等逻辑。
 *
 * ⚠️ 不要在生产数据库上运行。本脚本在 NODE_ENV=production 时会直接退出。
 */
import { PrismaClient } from "@prisma/client";

/** 改成你要测试的项目 planId */
const TEST_PLAN_ID = "REPLACE_WITH_YOUR_PLAN_ID";

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

function assertNotProduction() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "已拒绝执行：NODE_ENV=production。这是开发用脚本，禁止在生产环境运行。"
    );
  }
}

async function main() {
  assertNotProduction();

  if (!TEST_PLAN_ID || TEST_PLAN_ID === "REPLACE_WITH_YOUR_PLAN_ID") {
    throw new Error("请先在脚本中设置有效的 TEST_PLAN_ID。");
  }

  console.log("=== dev-set-enterprise（按 planId 全量）===");
  console.log(`planId = ${TEST_PLAN_ID}`);
  console.log(`DATABASE_URL host 摘要: ${maskDatabaseUrl(process.env.DATABASE_URL)}`);

  const orders = await prisma.upgradeOrder.findMany({
    where: { planId: TEST_PLAN_ID },
    select: { id: true, status: true, targetLevel: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\n[UpgradeOrder] 命中 ${orders.length} 条`);
  for (const o of orders) {
    await prisma.upgradeOrder.update({
      where: { id: o.id },
      data: { status: "paid", targetLevel: "enterprise" },
    });
    console.log(
      `  更新 id=${o.id}: status "${o.status}" → "paid", targetLevel "${o.targetLevel}" → "enterprise"`
    );
  }

  const licenses = await prisma.licenseKey.findMany({
    where: { planId: TEST_PLAN_ID },
    select: { id: true, planLevel: true, keyHash: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\n[LicenseKey] 命中 ${licenses.length} 条`);
  for (const l of licenses) {
    await prisma.licenseKey.update({
      where: { id: l.id },
      data: { planLevel: "enterprise" },
    });
    const hashPreview = `${l.keyHash.slice(0, 8)}…`;
    console.log(
      `  更新 id=${l.id} keyHash=${hashPreview}: planLevel "${l.planLevel}" → "enterprise"`
    );
  }

  console.log("\n完成。请用同一 planId 调用 /api/entitlements 验证 zipEnabled 等字段。");
}

function maskDatabaseUrl(url: string | undefined): string {
  if (!url) return "(未设置)";
  try {
    const u = new URL(url);
    if (u.password) u.password = "***";
    return `${u.protocol}//${u.host}${u.pathname}`;
  } catch {
    return "(无法解析)";
  }
}

main()
  .catch((e) => {
    console.error("\n执行失败:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(process.exitCode ?? 0);
  });
