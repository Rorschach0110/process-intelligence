import { apiGet, apiPost } from "@/lib/api/client";
import type { Recommendation, Report, Scenario } from "@/types/api";

export const planningClient = {
  recommendations: () => apiGet<{ recommendations: Recommendation[] }>("/api/optimization/recommendations"),
  providers: () => apiGet<{ providers: { id: number; name: string; model: string; is_active: number }[] }>("/api/optimization/providers"),
  scenarios: () => apiGet<{ scenarios: Scenario[] }>("/api/simulation/scenarios"),
  createScenario: (name: string, parameters: Record<string, number | string>, runId = "ad-hoc") =>
    apiPost<{ id: number; name: string; results: Record<string, number> }>("/api/simulation/scenarios", { name, run_id: runId, parameters }),
  reports: () => apiGet<{ reports: Report[] }>("/api/reports"),
  createReport: (reportType: string) => apiPost<Report>("/api/reports", { report_type: reportType }),
};
