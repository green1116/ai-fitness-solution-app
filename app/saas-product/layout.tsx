import type { ReactNode } from "react";
import { PortalShell, requirePortalSessionServer } from "@/lib/saas-product-portal";

export default async function SaasProductLayout({ children }: { children: ReactNode }) {
  const session = await requirePortalSessionServer();
  return <PortalShell session={session}>{children}</PortalShell>;
}
