import { LayoutRegion } from "./LayoutRegion";

type Split3LayoutHostProps = Readonly<{
  conversation?: React.ReactNode;
  task?: React.ReactNode;
  context?: React.ReactNode;
  outcomes?: React.ReactNode;
}>;

export function Split3LayoutHost({
  conversation,
  task,
  context,
  outcomes,
}: Split3LayoutHostProps) {
  return (
    <div
      data-layout-host="LAYCMP-SPLIT-3"
      data-layout-pattern="LAY-SPLIT-3"
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <LayoutRegion name="conversation">{conversation}</LayoutRegion>
        <LayoutRegion name="task">{task}</LayoutRegion>
        <LayoutRegion name="context">{context}</LayoutRegion>
      </div>
      <LayoutRegion name="outcomes">{outcomes}</LayoutRegion>
    </div>
  );
}
