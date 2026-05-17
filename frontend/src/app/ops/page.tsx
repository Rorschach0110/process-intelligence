import { MetricCard } from "@/components/ui/metric-card";
import { Panel } from "@/components/ui/panel";
import { apiGet } from "@/lib/api/client";
import type { Health } from "@/types/api";

type Diagnostics = {
  health: Health;
  counts: Record<string, number>;
};

export default async function OpsPage() {
  const [diagnostics, backup] = await Promise.all([
    apiGet<Diagnostics>("/api/ops/diagnostics"),
    apiGet<{ items: string[]; created_at: string }>("/api/ops/backup-manifest"),
  ]);
  return (
    <div className="grid gap-6">
      <section className="grid grid-cols-4 gap-4">
        <MetricCard label="数据库" value={String(diagnostics.health.database)} detail="SQLite 状态" />
        <MetricCard label="上传目录" value={String(diagnostics.health.uploads_dir)} detail="文件接入" />
        <MetricCard label="运行目录" value={String(diagnostics.health.runs_dir)} detail="结果制品" />
        <MetricCard label="报告目录" value={String(diagnostics.health.reports_dir)} detail="报告制品" />
      </section>
      <Panel title="数据库统计">
        <div className="grid grid-cols-4 gap-3 text-sm">
          {Object.entries(diagnostics.counts).map(([key, value]) => <div key={key}>{key}: <strong>{value}</strong></div>)}
        </div>
      </Panel>
      <Panel title="备份清单">
        {backup.items.map((item) => <p className="text-sm" key={item}>{item}</p>)}
      </Panel>
    </div>
  );
}
