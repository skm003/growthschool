"use client";

import { useSyncExternalStore } from "react";
import { useDashboardStore } from "@/store/dashboardStore";

/**
 * Returns true once the persisted store has rehydrated from localStorage.
 * Uses useSyncExternalStore so there's no hydration mismatch and no
 * setState-in-effect — server snapshot is always false.
 */
export function useStoreHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useDashboardStore.persist.onFinishHydration(cb),
    () => useDashboardStore.persist.hasHydrated(),
    () => false
  );
}
