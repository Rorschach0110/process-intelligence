"use client";

import { Download, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable } from "@/components/ui/data/data-table";
import { Toolbar } from "@/components/ui/shell/toolbar";
import { Button } from "@/components/ui/forms/button";
import { kg } from "@/lib/formatters/number";
import { useWorkspaceStore } from "@/lib/stores/workspace";
import type { CarbonSummary, ProcessSummary, Recommendation } from "@/types/api";
import { ActivityDetail } from "./activity-detail";
import { ProcessFlow } from "./process-flow";

export function ProcessMapWorkbench({ carbon, process, recommendations }: { carbon: CarbonSummary; process: ProcessSummary; recommendations: Recommendation[] }) {
  const { activity, setActivity } = useWorkspaceStore();
  const [minCount, setMinCount] = useState(1);
  const [pathThreshold, setPathThreshold] = useState(1);
  const [metric, setMetric] = useState("carbon");
  const selected = activity || process.activities[0]?.name;

  return (
    <div className="grid gap-5">
      <Toolbar
        actions={
          <Button>
            <Download size={16} />
            导出视图
          </Button>
        }
        description="围绕活动、路径、瓶颈和碳排进行联动分析。"
        title="流程地图"
      >
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <SlidersHorizontal size={16} />
          活动阈值
          <input className="w-36" max="10" min="1" onChange={(event) => setMinCount(Number(event.target.value))} type="range" value={minCount} />
          {minCount}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          路径阈值
          <input className="w-36" max="10" min="1" onChange={(event) => setPathThreshold(Number(event.target.value))} type="range" value={pathThreshold} />
          {pathThreshold}
        </label>
        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" onChange={(event) => setMetric(event.target.value)} value={metric}>
          <option value="carbon">碳排</option>
          <option value="duration">时长</option>
          <option value="events">事件</option>
        </select>
      </Toolbar>
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard detail="日志事件数" label="事件" value={String(process.events)} />
        <MetricCard detail="流程实例数" label="案例" value={String(process.cases)} />
        <MetricCard detail="平均案例时长" label="周期" value={`${process.avg_case_duration_min} min`} />
        <MetricCard detail={process.health_score.grade} label="健康分" value={String(process.health_score.score)} />
      </section>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-5">
          <ProcessFlow carbon={carbon} minCount={minCount} onSelect={setActivity} process={process} selected={selected} />
          <DataTable
            columns={[
              { key: "activity", header: "瓶颈活动", render: (row) => <button className="font-semibold text-blue-700" onClick={() => setActivity(row.activity)} type="button">{row.activity}</button> },
              { key: "duration", header: "总时长", render: (row) => `${row.total_duration_min} min` },
              { key: "avg", header: "平均", render: (row) => `${row.avg_duration_min} min` },
              { key: "carbon", header: "碳排", render: (row) => kg(carbon.by_activity.find((item) => item.activity === row.activity)?.carbon_kg) },
            ]}
            rowKey={(row) => row.activity}
            rows={process.bottlenecks.filter((row) => row.samples >= pathThreshold || row.total_duration_min >= pathThreshold)}
          />
        </section>
        <ActivityDetail activity={selected} carbon={carbon} process={process} recommendations={recommendations} />
      </div>
    </div>
  );
}
