import { Play, ShieldCheck, UploadCloud } from "lucide-react";
import Link from "next/link";
import { apiGet } from "@/lib/api/client";
import type { Health, RunSummary } from "@/types/api";

const mobileLinks = [
  ["/", "驾驶舱"],
  ["/data", "数据"],
  ["/process-map", "流程"],
  ["/optimization", "优化"],
  ["/reports", "报告"],
];

export async function Topbar() {
  const [health, runs] = await Promise.all([
    apiGet<Health>("/api/health"),
    apiGet<{ runs: RunSummary[] }>("/api/runs"),
  ]);
  const latest = runs.runs[0];

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-[#f5f5f7]/78 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#86868b]">Current workspace</p>
          <h1 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">工业流程低碳优化平台</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="hidden max-w-[180px] truncate text-[#6e6e73] xl:inline">{latest?.run_id || "ad-hoc"}</span>
          <Link className="inline-flex items-center gap-2 rounded-xl bg-[#1d1d1f] px-3 py-2 font-medium text-white shadow-sm transition hover:bg-black" href="/quantification">
            <UploadCloud size={16} />
            运行分析
          </Link>
          <Link className="inline-flex items-center gap-2 rounded-xl border border-[#d2d2d7] bg-white/75 px-3 py-2 font-medium text-[#1d1d1f] shadow-sm transition hover:bg-white" href="/optimization">
            <Play size={15} />
            决策
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 font-medium text-emerald-700">
            <ShieldCheck size={15} />
            {health.status}
          </span>
        </div>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 text-sm lg:hidden">
        {mobileLinks.map(([href, label]) => (
          <Link className="shrink-0 rounded-xl bg-white/70 px-3 py-2 text-[#424245]" href={href} key={href}>
            {label}
          </Link>
        ))}
      </div>
    </header>
  );
}
