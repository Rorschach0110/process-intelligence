import { BottleneckPanel, FlowPreview, OperationsPanel, SystemPanel } from "@/components/home/dashboard-panels";
import { HeroSection } from "@/components/home/hero-section";
import { StatStrip } from "@/components/home/stat-strip";
import { apiGet } from "@/lib/api/client";
import { kg } from "@/lib/formatters/number";
import type { CarbonSummary, Dataset, Health, ProcessSummary, RunSummary } from "@/types/api";

export default async function Home() {
  const [health, datasets, runs, carbonPayload, processPayload] = await Promise.all([
    apiGet<Health>("/api/health"),
    apiGet<{ datasets: Dataset[] }>("/api/datasets"),
    apiGet<{ runs: RunSummary[] }>("/api/runs"),
    apiGet<{ carbon: CarbonSummary }>("/api/carbon/summary"),
    apiGet<{ process: ProcessSummary }>("/api/process/summary"),
  ]);
  const carbon = carbonPayload.carbon;
  const process = processPayload.process;
  const latest = runs.runs[0];
  const stats = [
    { label: "数据资产", value: String(datasets.datasets.length), detail: "已登记数据集" },
    { label: "运行记录", value: String(runs.runs.length), detail: latest?.run_id || "等待新任务" },
    { label: "总碳排", value: kg(carbon.summary.total_carbon_kg), detail: "当前样本基线" },
    { label: "流程健康", value: `${process.health_score.score}`, detail: `等级 ${process.health_score.grade}` },
  ];

  return (
    <div className="mx-auto grid max-w-[1500px] gap-6">
      <HeroSection />
      <StatStrip stats={stats} />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <FlowPreview carbon={carbon} process={process} />
        <BottleneckPanel process={process} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SystemPanel health={health} />
        <OperationsPanel latest={latest} process={process} />
      </div>
    </div>
  );
}
