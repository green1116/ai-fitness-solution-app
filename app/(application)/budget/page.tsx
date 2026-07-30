import { BudgetResultScreen } from "@/components/screens/result/BudgetResultScreen";

type BudgetPageProps = Readonly<{
  searchParams: Promise<{ projectId?: string | string[] }>;
}>;

function readProjectId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }
  return value?.trim() ?? "";
}

/**
 * PG-BUDGET → SCR-06 Budget Result (PD-4.2 RT-BUDGET).
 */
export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const params = await searchParams;
  return <BudgetResultScreen projectId={readProjectId(params.projectId)} />;
}
