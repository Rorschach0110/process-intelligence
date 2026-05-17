"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { StepShell } from "@/components/ui/steps/step-shell";
import { ErrorNote } from "@/components/ui/feedback/error-note";
import { Button } from "@/components/ui/forms/button";
import { datasetsClient } from "@/lib/api/domains/datasets";
import { pipelineClient, type PipelineResult } from "@/lib/api/domains/pipeline";
import { defaultMapping, useQuantificationStore } from "@/lib/stores/quantification";
import { useWorkspaceStore } from "@/lib/stores/workspace";
import type { CarbonFactor, Dataset, DatasetPreview } from "@/types/api";
import { FactorPanel } from "./factor-panel";
import { FieldMappingPanel } from "./field-mapping-panel";
import { RunResultPanel } from "./run-result-panel";

const steps = [
  { title: "选择数据", description: "从知识库选择或使用示例 CSV" },
  { title: "字段映射", description: "校验必填字段和冲突" },
  { title: "碳因子", description: "选择版本或临时覆盖" },
  { title: "运行结果", description: "执行 pipeline 并进入工作区" },
];

export function QuantificationWorkbench({ datasets, factors }: { datasets: Dataset[]; factors: CarbonFactor[] }) {
  const { step, file, mapping, setStep, setFile, setMapping, setFactor, factors: factorValues } = useQuantificationStore();
  const { setDatasetId, setRunId } = useWorkspaceStore();
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [result, setResult] = useState<PipelineResult>();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const selected = datasets.find((item) => item.file_path === file);
    if (selected) datasetsClient.preview(selected.id, 1, 10).then(setPreview).catch(() => setPreview(null));
  }, [datasets, file]);

  async function run() {
    setRunning(true);
    setError("");
    try {
      const output = await pipelineClient.run({ file, mapping, factors: factorValues });
      setResult(output);
      if (output.history?.run_id) setRunId(output.history.run_id);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "运行失败");
    } finally {
      setRunning(false);
    }
  }

  function selectDataset(dataset: Dataset) {
    setFile(dataset.file_path);
    setDatasetId(dataset.id);
    setMapping(defaultMapping);
  }

  return (
    <div className="grid gap-5">
      <StepShell current={step} steps={steps} />
      <ErrorNote message={error} />
      <Panel title={steps[step].title} action={<StepActions current={step} onBack={() => setStep(step - 1)} onNext={() => setStep(step + 1)} />}>
        {step === 0 ? <DatasetSelector datasets={datasets} file={file} onSelect={selectDataset} /> : null}
        {step === 1 ? <FieldMappingPanel fields={preview?.fields || Object.values(defaultMapping)} mapping={mapping} onChange={setMapping} /> : null}
        {step === 2 ? <FactorPanel factors={factors} values={factorValues} onChange={setFactor} /> : null}
        {step === 3 ? <RunResultPanel onRun={run} result={result} running={running} /> : null}
      </Panel>
    </div>
  );
}

function DatasetSelector({ datasets, file, onSelect }: { datasets: Dataset[]; file: string; onSelect: (dataset: Dataset) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {datasets.map((dataset) => (
        <button className={`rounded-md border p-4 text-left text-sm ${file === dataset.file_path ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`} key={dataset.id} onClick={() => onSelect(dataset)} type="button">
          <strong>{dataset.name}</strong>
          <p className="mt-1 text-slate-500">{dataset.file_path}</p>
          <p className="mt-3 text-xs text-slate-500">{dataset.field_count} 字段 · {dataset.row_count} 预览行</p>
        </button>
      ))}
      {!datasets.length ? <p className="text-sm text-slate-500">暂无知识库数据集，将使用示例事件日志。</p> : null}
    </div>
  );
}

function StepActions({ current, onBack, onNext }: { current: number; onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex gap-2">
      <Button disabled={current === 0} onClick={onBack}>上一步</Button>
      <Button disabled={current === 3} onClick={onNext} variant="primary">下一步</Button>
    </div>
  );
}
