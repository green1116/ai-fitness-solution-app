import { LayoutRegion } from "./LayoutRegion";

type ResultLayoutHostProps = Readonly<{
  summary?: React.ReactNode;
  body?: React.ReactNode;
  artifacts?: React.ReactNode;
  forward?: React.ReactNode;
}>;

export function ResultLayoutHost({
  summary,
  body,
  artifacts,
  forward,
}: ResultLayoutHostProps) {
  return (
    <div
      data-layout-host="LAYCMP-RESULT"
      data-layout-pattern="LAY-RESULT"
      className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10"
    >
      <LayoutRegion name="summary">{summary}</LayoutRegion>
      <LayoutRegion name="body">{body}</LayoutRegion>
      <LayoutRegion name="artifacts">{artifacts}</LayoutRegion>
      <LayoutRegion name="forward">{forward}</LayoutRegion>
    </div>
  );
}
