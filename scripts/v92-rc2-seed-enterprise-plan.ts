/** V9.2-RC2 staging E2E：将指定 planId 订单/license 升为 enterprise（仅测试库） */
import "dotenv/config";
import { prisma } from "../lib/prisma";

const planId = (process.env.E2E_PLAN_ID || "ATG-20260601-2501").trim();

async function main() {
  const orders = await prisma.upgradeOrder.updateMany({
    where: { planId },
    data: { status: "paid", targetLevel: "enterprise" },
  });
  const licenses = await prisma.licenseKey.updateMany({
    where: { planId },
    data: { planLevel: "enterprise" },
  });
  if (orders.count === 0) {
    await prisma.upgradeOrder.create({
      data: {
        id: `v92-rc2-${planId}`,
        planId,
        targetLevel: "enterprise",
        status: "paid",
        amount: 100,
      },
    });
    console.log("[v92-seed] created paid enterprise order");
  }
  console.log("[v92-seed] planId=", planId, "orders=", orders.count, "licenses=", licenses.count);
  await prisma.$disconnect();
}

main();
