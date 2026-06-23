import { ProductionShell } from "@/components/production/ProductionShell";

export default function ProductionLayout({ children }: { children: React.ReactNode }) {
  return <ProductionShell>{children}</ProductionShell>;
}
