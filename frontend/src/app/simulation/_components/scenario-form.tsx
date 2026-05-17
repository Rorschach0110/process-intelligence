"use client";

import { useState } from "react";
import { Button } from "@/components/ui/forms/button";

type ScenarioParameters = {
  carbon_reduction_rate: number;
  capacity_delta: number;
  cost_delta: number;
};

type ScenarioFormProps = {
  onCreate: (name: string, parameters: Record<string, number>) => void;
  creating: boolean;
};

export function ScenarioForm({ creating, onCreate }: ScenarioFormProps) {
  const [name, setName] = useState("Low carbon dispatch");
  const [parameters, setParameters] = useState({ carbon_reduction_rate: 0.08, capacity_delta: -0.01, cost_delta: 0.02 });
  return (
    <div className="grid gap-4">
      <label className="grid gap-1 text-sm"><span>方案名称</span><input className="h-10 rounded-md border border-slate-200 px-3" onChange={(event) => setName(event.target.value)} value={name} /></label>
      <Slider label="减排率" max={0.4} min={0} name="carbon_reduction_rate" onChange={setParameters} parameters={parameters} step={0.01} />
      <Slider label="产能变化" max={0.2} min={-0.2} name="capacity_delta" onChange={setParameters} parameters={parameters} step={0.01} />
      <Slider label="成本变化" max={0.3} min={-0.1} name="cost_delta" onChange={setParameters} parameters={parameters} step={0.01} />
      <Button disabled={creating} onClick={() => onCreate(name, parameters)} variant="primary">{creating ? "生成中..." : "生成方案"}</Button>
    </div>
  );
}

function Slider({ label, max, min, name, onChange, parameters, step }: { label: string; max: number; min: number; name: keyof ScenarioParameters; step: number; parameters: ScenarioParameters; onChange: (value: ScenarioParameters) => void }) {
  return (
    <label className="grid gap-1 text-sm">
      <span>{label}: {Math.round(parameters[name] * 100)}%</span>
      <input max={max} min={min} onChange={(event) => onChange({ ...parameters, [name]: Number(event.target.value) })} step={step} type="range" value={parameters[name]} />
    </label>
  );
}
