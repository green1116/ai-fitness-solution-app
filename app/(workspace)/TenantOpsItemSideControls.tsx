"use client";

import { useCallback, useState } from "react";

import type { TenantOpsReviewActionResult } from "@/lib/runtime-ops/tenant-ops-action";
import { TenantOpsHistoryControl } from "./TenantOpsHistoryControl";
import { TenantOpsReviewActionControl } from "./TenantOpsReviewActionControl";
import { submitTenantOpsReviewAction } from "./submit-tenant-ops-review-action";

type SubmitTenantOpsReviewAction = (
  prev: TenantOpsReviewActionResult | null,
  formData: FormData,
) => Promise<TenantOpsReviewActionResult>;

/**
 * WP-TENANT-OPS-HISTORY-REFRESH-1
 * Bridges mutation SUCCESS → history stale/reload without mixing controls.
 */
export function TenantOpsItemSideControls({
  itemId,
  customerId,
  stage,
  reviewEligible,
  executeEligible,
  openDealEligible,
  closeWonEligible,
  closeLostEligible,
  recovered,
  showActions,
  submitReviewAction = submitTenantOpsReviewAction,
}: {
  itemId: string;
  customerId: string;
  stage: string;
  reviewEligible: boolean;
  executeEligible: boolean;
  openDealEligible: boolean;
  closeWonEligible: boolean;
  closeLostEligible: boolean;
  recovered: boolean;
  showActions: boolean;
  submitReviewAction?: SubmitTenantOpsReviewAction;
}) {
  const [historyEpoch, setHistoryEpoch] = useState(0);
  const onMutationSuccess = useCallback(() => {
    setHistoryEpoch((n) => n + 1);
  }, []);

  return (
    <>
      {showActions ? (
        <TenantOpsReviewActionControl
          itemId={itemId}
          stage={stage}
          reviewEligible={reviewEligible}
          executeEligible={executeEligible}
          openDealEligible={openDealEligible}
          closeWonEligible={closeWonEligible}
          closeLostEligible={closeLostEligible}
          recovered={recovered}
          submitReviewAction={submitReviewAction}
          onMutationSuccess={onMutationSuccess}
        />
      ) : null}
      <TenantOpsHistoryControl
        itemId={itemId}
        customerId={customerId}
        refreshEpoch={historyEpoch}
      />
    </>
  );
}
