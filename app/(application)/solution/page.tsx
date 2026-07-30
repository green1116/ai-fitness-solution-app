import { SolutionResultScreen } from "@/components/screens/result/SolutionResultScreen";

type SolutionPageProps = Readonly<{
  searchParams: Promise<{ projectId?: string | string[] }>;
}>;

function readProjectId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }
  return value?.trim() ?? "";
}

/**
 * PG-SOLUTION → SCR-05 Solution Result (PD-4.2 RT-SOLUTION).
 */
export default async function SolutionPage({ searchParams }: SolutionPageProps) {
  const params = await searchParams;
  return (
    <SolutionResultScreen projectId={readProjectId(params.projectId)} />
  );
}
