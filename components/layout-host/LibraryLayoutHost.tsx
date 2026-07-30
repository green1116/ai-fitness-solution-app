import { LayoutRegion } from "./LayoutRegion";

type LibraryLayoutHostProps = Readonly<{
  categories?: React.ReactNode;
  items?: React.ReactNode;
  artifacts?: React.ReactNode;
  forward?: React.ReactNode;
}>;

export function LibraryLayoutHost({
  categories,
  items,
  artifacts,
  forward,
}: LibraryLayoutHostProps) {
  return (
    <div
      data-layout-host="LAYCMP-LIBRARY"
      data-layout-pattern="LAY-LIBRARY"
      className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10"
    >
      <LayoutRegion name="categories">{categories}</LayoutRegion>
      <LayoutRegion name="items">{items}</LayoutRegion>
      <LayoutRegion name="artifacts">{artifacts}</LayoutRegion>
      <LayoutRegion name="forward">{forward}</LayoutRegion>
    </div>
  );
}
