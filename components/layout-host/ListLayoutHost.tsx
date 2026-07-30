import { LayoutRegion } from "./LayoutRegion";

type ListLayoutHostProps = Readonly<{
  list?: React.ReactNode;
}>;

export function ListLayoutHost({ list }: ListLayoutHostProps) {
  return (
    <div
      data-layout-host="LAYCMP-LIST"
      data-layout-pattern="LAY-LIST"
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10"
    >
      <LayoutRegion name="list">{list}</LayoutRegion>
    </div>
  );
}
