import { apiGet } from "@/lib/api/client";
import type { ProcessSummary } from "@/types/api";

export const processClient = {
  summary: () => apiGet<{ process: ProcessSummary }>("/api/process/summary"),
  compare: () => apiGet<{ comparison: Record<string, unknown> }>("/api/process/compare"),
};
