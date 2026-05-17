import { apiGet } from "@/lib/api/client";
import type { Health, RunSummary } from "@/types/api";

export const opsClient = {
  health: () => apiGet<Health>("/api/health"),
  runs: () => apiGet<{ runs: RunSummary[] }>("/api/runs"),
  diagnostics: () => apiGet<{ health: Health; counts: Record<string, number> }>("/api/ops/diagnostics"),
  backupManifest: () => apiGet<{ items: string[]; created_at: string }>("/api/ops/backup-manifest"),
};
