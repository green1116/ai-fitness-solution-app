/**
 * LicenseBinding 工具：把已发放的 LicenseKey 绑定到当前用户。
 *
 * 用途：
 *  - webhook 履约时，create-order 那一刻可能尚未登录 / Session cookie 未传到下游，
 *    导致 UpgradeOrder.userId 为空、syncLicenseBindingForPaidOrder 被跳过。
 *  - 我们在 webhook 成功后用当前 Session 的 user.id 主动补绑，保证 entitlement 立即可见。
 */
import { prisma } from "@/lib/prisma";

export async function ensureLicenseBinding(params: {
  userId: string;
  licenseId: string;
  fingerprint?: string | null;
}): Promise<{ ok: boolean; created: boolean; reason?: string }> {
  const userId = params.userId?.trim();
  const licenseId = params.licenseId?.trim();
  if (!userId || !licenseId) {
    return { ok: false, created: false, reason: "missing-ids" };
  }
  /** dev-synthetic license（fulfill fallback 产物）没有真实 DB 行 */
  if (licenseId === "dev-synthetic") {
    return { ok: false, created: false, reason: "synthetic-license" };
  }

  const lic = await prisma.licenseKey.findUnique({ where: { id: licenseId } });
  if (!lic) return { ok: false, created: false, reason: "license-missing" };

  const existed = await prisma.licenseBinding.findUnique({
    where: { userId_licenseId: { userId, licenseId } },
  });

  const fp = params.fingerprint?.trim() || null;

  await prisma.licenseBinding.upsert({
    where: { userId_licenseId: { userId, licenseId } },
    create: { userId, licenseId, fingerprint: fp },
    update: fp ? { fingerprint: fp } : {},
  });

  return { ok: true, created: !existed };
}
