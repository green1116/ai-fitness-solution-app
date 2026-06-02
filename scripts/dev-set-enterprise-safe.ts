/**
 * 【更安全的开发/测试脚本】仅更新：
 *  - 指定 planId 且 userId 匹配的 UpgradeOrder
 *  - 通过 LicenseBinding 绑定到该用户的 LicenseKey（且 planId 匹配）
 *
 * 不会影响同 planId 下其他账号的订单或许可证。
 *
 * ⚠️ 不要在生产数据库上运行。NODE_ENV=production 时直接退出。
 */
import { PrismaClient } from "@prisma/client";

const TEST_PLAN_ID = "REPLACE_WITH_YOUR_PLAN_ID";

/** 与 UpgradeOrder.userId、LicenseBinding.userId 一致的用户 id */
const TEST_USER_ID = "REPLACE_WITH_YOUR_USER_ID";

/** 若填写，则优先按邮箱解析 userId（非空时忽略上面的 TEST_USER_ID 占位检查） */
const TEST_USER_EMAIL: string | null = null;

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

async function resolveUserId(): Promise<string> {
  if (TEST_USER_EMAIL && TEST_USER_EMAIL.trim()) {
    const u = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL.trim() },
      select: { id: true },
    });
    if (!u) {
      throw new Error(`未找到邮箱为 "${TEST_USER_EMAIL}" 的用户。`);
    }
    console.log(`已根据邮箱解析 userId = ${u.id}`);
    return u.id;
  }

  if (!TEST_USER_ID || TEST_USER_ID === "REPLACE_WITH_YOUR_USER_ID") {
    throw new Error("请设置 TEST_USER_EMAIL，或设置有效的 TEST_USER_ID。");
  }

  const exists = await prisma.user.findUnique({
    where: { id: TEST_USER_ID },
    select: { id: true },
  });
  if (!exists) {
    throw new Error(`未找到 id 为 "${TEST_USER_ID}" 的用户。`);
  }

  return TEST_USER_ID;
}

async function main() {
  assertNotProduction();

  if (!TEST_PLAN_ID || TEST_PLAN_ID === "REPLACE_WITH_YOUR_PLAN_ID") {
    throw new Error("请先在脚本中设置有效的 TEST_PLAN_ID。");
  }

  const userId = await resolveUserId();

  console.log("=== dev-set-enterprise-safe（planId + 用户范围）===");
  console.log(`planId = ${TEST_PLAN_ID}`);
  console.log(`userId = ${userId}`);
  console.log(`DATABASE_URL host 摘要: ${maskDatabaseUrl(process.env.DATABASE_URL)}`);

  const orders = await prisma.upgradeOrder.findMany({
    where: { planId: TEST_PLAN_ID, userId },
    select: { id: true, status: true, targetLevel: true, userId: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\n[UpgradeOrder] 命中 ${orders.length} 条（planId + userId）`);
  for (const o of orders) {
    await prisma.upgradeOrder.update({
      where: { id: o.id },
      data: { status: "paid", targetLevel: "enterprise" },
    });
    console.log(
      `  更新 id=${o.id}: status "${o.status}" → "paid", targetLevel "${o.targetLevel}" → "enterprise"`
    );
  }

  if (orders.length === 0) {
    console.log(
      "  （提示：若预期应有订单，请确认 UpgradeOrder.userId 已写入；未登录下单可能为 null，全量脚本才覆盖。）"
    );
  }

  const licenses = await prisma.licenseKey.findMany({
    where: {
      planId: TEST_PLAN_ID,
      bindings: { some: { userId } },
    },
    select: { id: true, planLevel: true, keyHash: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`\n[LicenseKey] 命中 ${licenses.length} 条（planId + 绑定到该用户）`);
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

  if (licenses.length === 0) {
    console.log(
      "  （提示：若预期应有 LicenseKey，请确认 LicenseBinding 已绑定且 LicenseKey.planId 一致。）"
    );
  }

  console.log("\n完成。仅上述用户相关记录被修改。");
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
