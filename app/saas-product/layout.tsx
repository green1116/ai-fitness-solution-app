import type { ReactNode } from "react";
import { PortalShell, requirePortalSession } from "@/lib/saas-product-portal";

export default async function SaasProductLayout({ children }: { children: ReactNode }) {
  const session = await requirePortalSession();
  return <PortalShell session={session}>{children}</PortalShell>;
}
