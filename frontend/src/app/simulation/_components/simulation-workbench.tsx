"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/panel";
import { StepShell } from "@/components/ui/steps/step-shell";
import { Button } from "@/components/ui/forms/button";
import { planningClient } from "@/lib/api/domains/planning";
import type { RunSummary, Scenario } from "@/types/api";
import { ScenarioForm } from "./scenario-form";
import { ScenarioTable } from "./scenario-table";

const steps = [
  { title: "选择基线", description: "选择运行记录" },
  { title: "配置参数", description: "设置减排、产能和成本" },
  { title: "生成方案", description: "调用仿真 API" },
  { title: "方案对比", description: "评分与风险排序" },
  { title: "仿真导出", description: "导出对比结果" },
];

export function SimulationWorkbench({ initialScenarios, runs }: { initialScenarios: Scenario[]; runs: RunSummary[] }) {
  const [current, setCurrent] = useState(0);
  const [scenarios, setScenarios] = useState(initialScenarios);
  const [runId, setRunId] = useState(runs[0]?.run_id || "ad-hoc");
  const [creating, setCreating] = useState(false);
  async function create(name: string, parameters: Record<string, number>) {
    setCreating(true);
    const result = await planningClient.createScenario(name, parameters, runId);
    setScenarios([{ id: result.id, name: result.name, run_id: runId, score: result.results.priority_score || 0, parameters, results: result.results, created_at: new Date().toISOString() }, ...scenarios]);
    setCreating(false);
    setCurrent(3);
  }
  return (
    <div className="grid gap-5">
      <StepShell current={current} steps={steps} />
      <Panel title={steps[current].title} action={<Nav current={current} setCurrent={setCurrent} />}>
        {current === 0 ? <RunSelector runId={runId} runs={runs} setRunId={setRunId} /> : null}
        {current === 1 || current === 2 ? <ScenarioForm creating={creating} onCreate={create} /> : null}
        {current === 3 ? <ScenarioTable scenarios={scenarios} /> : null}
        {current === 4 ? <ExportPanel scenarios={scenarios} /> : null}
      </Panel>
    </div>
  );
}

function RunSelector({ runId, runs, setRunId }: { runId: string; runs: RunSummary[]; setRunId: (id: string) => void }) {
  return <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" onChange={(event) => setRunId(event.target.value)} value={runId}>{runs.map((run) => <option key={run.run_id} value={run.run_id}>{run.run_id}</option>)}<option value="ad-hoc">ad-hoc</option></select>;
}

function ExportPanel({ scenarios }: { scenarios: Scenario[] }) {
  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-slate-200 bg-white p-4 text-sm">
        <h3 className="font-semibold">仿真时间线</h3>
        <div className="mt-3 grid gap-2">
          {scenarios.slice(0, 4).map((scenario) => <div className="h-8 rounded bg-blue-100 px-3 py-1 text-blue-800" key={scenario.id}>{scenario.name}</div>)}
        </div>
      </div>
      <pre className="max-h-96 overflow-auto rounded bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(scenarios, null, 2)}</pre>
    </div>
  );
}

function Nav({ current, setCurrent }: { current: number; setCurrent: (value: number) => void }) {
  return <div className="flex gap-2"><Button disabled={current === 0} onClick={() => setCurrent(current - 1)}>上一步</Button><Button disabled={current === 4} onClick={() => setCurrent(current + 1)} variant="primary">下一步</Button></div>;
}
