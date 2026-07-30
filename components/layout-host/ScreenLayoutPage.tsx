import { ContinuityEntryNavigation } from "@/components/navigation/ContinuityEntryNavigation";
import { GoalEntryNavigation } from "@/components/navigation/GoalEntryNavigation";
import { OutcomeEntryNavigation } from "@/components/navigation/OutcomeEntryNavigation";
import { LayoutHost } from "@/components/layout-host/LayoutHost";
import type { ScreenLayoutBinding } from "@/lib/frontend/layout-patterns";

type ScreenLayoutPageProps = Readonly<{
  screenId: ScreenLayoutBinding["screenId"];
  eyebrow: string;
  title: string;
  description: string;
}>;

function ScreenCopy({
  eyebrow,
  title,
  description,
}: Readonly<{ eyebrow: string; title: string; description: string }>) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
    </div>
  );
}

/**
 * Presentation-only Screen composition through the frozen LAY-* host.
 * Navigation skeletons fill frozen entry / continuity / outcome slots only.
 */
export function ScreenLayoutPage({
  screenId,
  eyebrow,
  title,
  description,
}: ScreenLayoutPageProps) {
  const copy = (
    <ScreenCopy
      eyebrow={eyebrow}
      title={title}
      description={description}
    />
  );

  switch (screenId) {
    case "SCR-01":
      return (
        <LayoutHost
          screenId={screenId}
          access={copy}
          goals={<GoalEntryNavigation />}
          continuity={<ContinuityEntryNavigation />}
        />
      );
    case "SCR-02":
    case "SCR-03":
      return (
        <LayoutHost
          screenId={screenId}
          guide={copy}
          capture={null}
          forward={null}
        />
      );
    case "SCR-04":
      return (
        <LayoutHost
          screenId={screenId}
          conversation={null}
          task={copy}
          context={null}
          outcomes={<OutcomeEntryNavigation />}
        />
      );
    case "SCR-05":
    case "SCR-06":
      return (
        <LayoutHost
          screenId={screenId}
          summary={copy}
          body={null}
          artifacts={null}
          forward={null}
        />
      );
    case "SCR-07":
      return (
        <LayoutHost
          screenId={screenId}
          list={
            <div className="flex flex-col gap-6">
              {copy}
              <ContinuityEntryNavigation />
            </div>
          }
        />
      );
    case "SCR-08":
      return (
        <LayoutHost
          screenId={screenId}
          categories={copy}
          items={null}
          artifacts={null}
          forward={null}
        />
      );
    case "SCR-09":
      return <LayoutHost screenId={screenId} areas={copy} />;
    default: {
      const _exhaustive: never = screenId;
      return _exhaustive;
    }
  }
}
