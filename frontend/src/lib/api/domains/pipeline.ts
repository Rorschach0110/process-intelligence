import { apiPost } from "@/lib/api/client";

type PipelinePayload = {
  file: string;
  mapping: Record<string, string>;
  factors: Record<string, number>;
};

export const pipelineClient = {
  run: (payload: PipelinePayload) => apiPost<PipelineResult>("/api/run-pipeline", payload),
};

export type PipelineResult = {
  source: { file: string; rows: number };
  process: { events: number; cases: number; health_score: { score: number; grade: string } };
  carbon: { summary: { total_carbon_kg: number } };
  optimization: { estimated_saving_kg: number; recommendations: { title: string; estimated_saving_kg: number }[] };
  history?: { run_id: string; result_path: string; created_at: string };
};
