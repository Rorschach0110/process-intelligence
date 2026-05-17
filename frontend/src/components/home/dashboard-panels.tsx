import { Database, Gauge, GitBranch, Zap } from "lucide-react";
import { kg, pct } from "@/lib/formatters/number";
import type { CarbonSummary, Health, ProcessSummary, RunSummary } from "@/types/api";

const statusLabels: Record<string, string> = {
  database: "数据库",
  uploads_dir: "上传目录",
  runs_dir: "运行目录",
  reports_dir: "报告目录",
};

function maxOf(values: number[]): number {
  return Math.max(1, ...values);
}

function formatMinutes(value: number): string {
  if (value >= 60) return `${(value / 60).toFixed(1)} h`;
  return `${Math.round(value)} min`;
}

export function FlowPreview({ process, carbon }: { process: ProcessSummary; carbon: CarbonSummary }) {
  const activities = process.activities.slice(0, 5);
  const maxCount = maxOf(activities.map((item) => item.count));

  return (
    <section className="rounded-xl border border-white/80 bg-[#1d1d1f] p-6 text-white shadow-[0_28px_90px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Live process</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">流程脉冲</h2>
        </div>
        <span className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white/75">{process.edges.length} 条关系</span>
      </div>
      <div className="mt-8 grid gap-4">
        {activities.map((item) => (
          <div className="grid grid-cols-[92px_1fr_44px] items-center gap-3 text-sm" key={item.name}>
            <span className="truncate text-white/65">{item.name}</span>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#8fdccd,#54afff,#f5b85c)]"
                style={{ width: `${Math.max(14, (item.count / maxCount) * 100)}%` }}
              />
            </div>
            <span className="text-right text-white/65">{item.count}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-white/45">事件</p>
          <p className="mt-1 text-xl font-semibold">{process.events}</p>
        </div>
        <div>
          <p className="text-white/45">案例</p>
          <p className="mt-1 text-xl font-semibold">{process.cases}</p>
        </div>
        <div>
          <p className="text-white/45">单事件碳强度</p>
          <p className="mt-1 text-xl font-semibold">{kg(carbon.dimensions.carbon_intensity.per_event_kg)}</p>
        </div>
      </div>
    </section>
  );
}

export function BottleneckPanel({ process }: { process: ProcessSummary }) {
  const bottlenecks = process.bottlenecks.slice(0, 4);
  const maxDuration = maxOf(bottlenecks.map((item) => item.total_duration_min));

  return (
    <section className="rounded-xl border border-white/80 bg-white/75 p-6 shadow-[0_22px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#86868b]">Bottlenecks</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">主要瓶颈</h2>
        </div>
        <GitBranch className="text-[#86868b]" size={24} />
      </div>
      <div className="mt-6 grid gap-3">
        {bottlenecks.map((item, index) => (
          <div className="rounded-lg bg-[#f5f5f7] p-4" key={item.activity}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 place-items-center rounded-lg bg-white text-sm font-semibold text-[#1d1d1f]">
                  {index + 1}
                </span>
                <strong className="truncate text-sm font-semibold">{item.activity}</strong>
              </div>
              <span className="text-sm text-[#6e6e73]">{formatMinutes(item.total_duration_min)}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-[#ff9f0a]"
                style={{ width: `${Math.max(12, (item.total_duration_min / maxDuration) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SystemPanel({ health }: { health: Health }) {
  const entries = Object.entries(statusLabels);

  return (
    <section className="rounded-xl border border-white/80 bg-white/75 p-6 shadow-[0_22px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#86868b]">System</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">运行状态</h2>
        </div>
        <span className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{health.status}</span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {entries.map(([key, label]) => (
          <div className="flex items-center justify-between rounded-lg bg-[#f5f5f7] px-4 py-3 text-sm" key={key}>
            <span className="text-[#6e6e73]">{label}</span>
            <span className="font-semibold text-[#1d1d1f]">{health[key as keyof Health] ? "在线" : "离线"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OperationsPanel({ latest, process }: { latest?: RunSummary; process: ProcessSummary }) {
  return (
    <section className="grid gap-4 rounded-xl border border-white/80 bg-white/75 p-6 shadow-[0_22px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl md:grid-cols-3">
      <div className="flex items-start gap-3">
        <Database className="mt-1 text-[#007aff]" size={22} />
        <div>
          <p className="text-sm font-semibold">数据覆盖</p>
          <p className="mt-1 text-sm text-[#6e6e73]">{process.events} 条事件，{process.cases} 个案例</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Gauge className="mt-1 text-[#30d158]" size={22} />
        <div>
          <p className="text-sm font-semibold">资源负载</p>
          <p className="mt-1 text-sm text-[#6e6e73]">
            {process.resource_load[0]?.resource || "暂无"} 占比 {pct(process.resource_load[0]?.share)}
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Zap className="mt-1 text-[#ff9f0a]" size={22} />
        <div>
          <p className="text-sm font-semibold">节省潜力</p>
          <p className="mt-1 text-sm text-[#6e6e73]">{kg(latest?.estimated_saving_kg)} 预计减排</p>
        </div>
      </div>
    </section>
  );
}
