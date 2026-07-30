import {
  getScreenLayoutBinding,
  type LayoutPatternId,
  type ScreenLayoutBinding,
} from "@/lib/frontend/layout-patterns";

import { EntryLayoutHost } from "./EntryLayoutHost";
import { IntakeLayoutHost } from "./IntakeLayoutHost";
import { LibraryLayoutHost } from "./LibraryLayoutHost";
import { ListLayoutHost } from "./ListLayoutHost";
import { OpsLayoutHost } from "./OpsLayoutHost";
import { ResultLayoutHost } from "./ResultLayoutHost";
import { Split3LayoutHost } from "./Split3LayoutHost";

type LayoutHostSlots = Readonly<{
  access?: React.ReactNode;
  goals?: React.ReactNode;
  continuity?: React.ReactNode;
  guide?: React.ReactNode;
  capture?: React.ReactNode;
  forward?: React.ReactNode;
  conversation?: React.ReactNode;
  task?: React.ReactNode;
  context?: React.ReactNode;
  outcomes?: React.ReactNode;
  summary?: React.ReactNode;
  body?: React.ReactNode;
  artifacts?: React.ReactNode;
  list?: React.ReactNode;
  categories?: React.ReactNode;
  items?: React.ReactNode;
  areas?: React.ReactNode;
}>;

type LayoutHostProps = LayoutHostSlots &
  Readonly<
    | {
        screenId: ScreenLayoutBinding["screenId"];
        layoutId?: never;
      }
    | {
        layoutId: LayoutPatternId;
        screenId?: never;
      }
  >;

function resolveLayoutId(props: LayoutHostProps): LayoutPatternId {
  if ("screenId" in props && props.screenId) {
    return getScreenLayoutBinding(props.screenId).layoutId;
  }
  return props.layoutId;
}

/**
 * Screen-level layout composition host.
 * Selects exactly one frozen LAY-* pattern and arranges presentation slots only.
 */
export function LayoutHost(props: LayoutHostProps) {
  const layoutId = resolveLayoutId(props);
  const slots = props;

  switch (layoutId) {
    case "LAY-ENTRY":
      return (
        <EntryLayoutHost
          access={slots.access}
          goals={slots.goals}
          continuity={slots.continuity}
        />
      );
    case "LAY-INTAKE":
      return (
        <IntakeLayoutHost
          guide={slots.guide}
          capture={slots.capture}
          forward={slots.forward}
        />
      );
    case "LAY-SPLIT-3":
      return (
        <Split3LayoutHost
          conversation={slots.conversation}
          task={slots.task}
          context={slots.context}
          outcomes={slots.outcomes}
        />
      );
    case "LAY-RESULT":
      return (
        <ResultLayoutHost
          summary={slots.summary}
          body={slots.body}
          artifacts={slots.artifacts}
          forward={slots.forward}
        />
      );
    case "LAY-LIST":
      return <ListLayoutHost list={slots.list} />;
    case "LAY-LIBRARY":
      return (
        <LibraryLayoutHost
          categories={slots.categories}
          items={slots.items}
          artifacts={slots.artifacts}
          forward={slots.forward}
        />
      );
    case "LAY-OPS":
      return <OpsLayoutHost areas={slots.areas} />;
    default: {
      const _exhaustive: never = layoutId;
      return _exhaustive;
    }
  }
}
