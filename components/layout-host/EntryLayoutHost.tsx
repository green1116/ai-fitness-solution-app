import { LayoutRegion } from "./LayoutRegion";

type EntryLayoutHostProps = Readonly<{
  access?: React.ReactNode;
  goals?: React.ReactNode;
  continuity?: React.ReactNode;
}>;

export function EntryLayoutHost({
  access,
  goals,
  continuity,
}: EntryLayoutHostProps) {
  return (
    <div
      data-layout-host="LAYCMP-ENTRY"
      data-layout-pattern="LAY-ENTRY"
      className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10"
    >
      <LayoutRegion name="access">{access}</LayoutRegion>
      <LayoutRegion name="goals">{goals}</LayoutRegion>
      <LayoutRegion name="continuity">{continuity}</LayoutRegion>
    </div>
  );
}
