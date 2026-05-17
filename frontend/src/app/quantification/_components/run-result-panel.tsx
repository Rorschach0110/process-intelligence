"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/forms/button";
import { kg } from "@/lib/formatters/number";
import type { PipelineResult } from "@/lib/api/domains/pipeline";

type RunResultPanelProps = {
  result?: PipelineResult;
  running: boolean;
  onRun: () => void;
};

export function RunResultPanel({ result, running, onRun }: RunResultPanelProps) {
  return (
    <div className="grid gap-4">
      <Button disabled={running} onClick={onRun} variant="primary">{running ? "运行中..." : "执行 pipeline"}</Button>
      {result ? (
        <div className="grid gap-4 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <div className="flex items-center gap-2 font-semibold text-emerald-800"><CheckCircle2 size={18} />量化完成</div>
          <div className="grid gap-3 md:grid-cols-4">
            <Stat label="事件" value={result.process.events} />
            <Stat label="案例" value={result.process.cases} />
            <Stat label="总碳排" value={kg(result.carbon.summary.total_carbon_kg)} />
            <Stat label="预计节省" value={kg(result.optimization.estimated_saving_kg)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-md bg-white px-3 py-2 text-sm font-medium text-emerald-800" href="/process-map">进入流程地图</Link>
            <Link className="rounded-md bg-white px-3 py-2 text-sm font-medium text-emerald-800" href="/graph-workbench">追溯知识图谱</Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div><p className="text-xs text-emerald-700">{label}</p><strong>{value}</strong></div>;
}
