import { LayoutRegion } from "./LayoutRegion";

type IntakeLayoutHostProps = Readonly<{
  guide?: React.ReactNode;
  capture?: React.ReactNode;
  forward?: React.ReactNode;
}>;

export function IntakeLayoutHost({
  guide,
  capture,
  forward,
}: IntakeLayoutHostProps) {
  return (
    <div
      data-layout-host="LAYCMP-INTAKE"
      data-layout-pattern="LAY-INTAKE"
      className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10"
    >
      <LayoutRegion name="guide">{guide}</LayoutRegion>
      <LayoutRegion name="capture">{capture}</LayoutRegion>
      <LayoutRegion name="forward">{forward}</LayoutRegion>
    </div>
  );
}
