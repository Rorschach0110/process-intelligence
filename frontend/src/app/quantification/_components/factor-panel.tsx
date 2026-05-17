"use client";

import type { CarbonFactor } from "@/types/api";

type FactorPanelProps = {
  factors: CarbonFactor[];
  values: { electricity_kg_per_kwh: number; material_kg_per_kg: number };
  onChange: (key: "electricity_kg_per_kwh" | "material_kg_per_kg", value: number) => void;
};

export function FactorPanel({ factors, values, onChange }: FactorPanelProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <FactorInput label="电力因子 kgCO2e/kWh" name="electricity_kg_per_kwh" onChange={onChange} value={values.electricity_kg_per_kwh} />
        <FactorInput label="物料因子 kgCO2e/kg" name="material_kg_per_kg" onChange={onChange} value={values.material_kg_per_kg} />
      </div>
      <div className="overflow-hidden rounded-md border border-slate-200">
        {factors.slice(0, 6).map((factor) => (
          <div className="grid grid-cols-4 gap-3 border-b border-slate-100 px-3 py-2 text-sm" key={factor.id}>
            <strong>{factor.name}</strong>
            <span>{factor.factor_type}</span>
            <span>{factor.value} {factor.unit}</span>
            <span className="text-slate-500">{factor.scope} · {factor.version}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FactorInput({ label, name, value, onChange }: { label: string; name: "electricity_kg_per_kwh" | "material_kg_per_kg"; value: number; onChange: FactorPanelProps["onChange"] }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        className="h-10 rounded-md border border-slate-200 px-3"
        min="0"
        onChange={(event) => onChange(name, Number(event.target.value))}
        step="0.001"
        type="number"
        value={value}
      />
    </label>
  );
}
