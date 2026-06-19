import { SettingsPageContent, requirePortalSessionServer } from "@/lib/saas-product-portal";

export default async function SaasProductSettingsPage() {
  const session = await requirePortalSessionServer();
  return <SettingsPageContent session={session} />;
}
