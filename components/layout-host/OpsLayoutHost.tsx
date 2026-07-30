import { LayoutRegion } from "./LayoutRegion";

type OpsLayoutHostProps = Readonly<{
  areas?: React.ReactNode;
}>;

export function OpsLayoutHost({ areas }: OpsLayoutHostProps) {
  return (
    <div
      data-layout-host="LAYCMP-OPS"
      data-layout-pattern="LAY-OPS"
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10"
    >
      <LayoutRegion name="areas">{areas}</LayoutRegion>
    </div>
  );
}
