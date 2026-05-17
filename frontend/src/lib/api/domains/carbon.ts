import { apiGet, apiPost } from "@/lib/api/client";
import type { CarbonFactor, CarbonSummary } from "@/types/api";

export const carbonClient = {
  factors: () => apiGet<{ factors: CarbonFactor[] }>("/api/carbon/factors"),
  createFactor: (factor: Omit<CarbonFactor, "id">) => apiPost<CarbonFactor>("/api/carbon/factors", factor),
  summary: () => apiGet<{ carbon: CarbonSummary }>("/api/carbon/summary"),
};
