import type { BidRiskTarget } from "@/lib/tender/gate/types";

export function jumpToRiskTarget(target?: BidRiskTarget) {
  if (typeof window === "undefined" || !target) return;

  let el: Element | null = null;

  if (target.type === "table-row") {
    el = document.querySelector(
      `[data-table="${target.table}"][data-row-ref="${target.rowRef}"]`
    );
  } else if (target.type === "attachment") {
    el = document.querySelector(
      `[data-attachment-code="${target.attachmentCode}"]`
    );
  } else if (target.type === "section") {
    el = document.getElementById(target.sectionId);
  }

  if (el && "scrollIntoView" in el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    if (el instanceof HTMLElement) {
      el.classList.add("ring-2", "ring-amber-400", "rounded-lg");
      window.setTimeout(() => {
        el.classList.remove("ring-2", "ring-amber-400", "rounded-lg");
      }, 1800);
    }
  }
}
