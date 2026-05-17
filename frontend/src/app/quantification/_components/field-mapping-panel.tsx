"use client";

import type { FieldMapping } from "@/types/api";

const mappingFields: { key: keyof FieldMapping; label: string; required: boolean }[] = [
  { key: "case_id", label: "案例 ID", required: true },
  { key: "activity", label: "活动", required: true },
  { key: "timestamp", label: "时间戳", required: true },
  { key: "resource", label: "资源", required: false },
  { key: "energy_kwh", label: "能耗 kWh", required: false },
  { key: "material_kg", label: "物料 kg", required: false },
  { key: "device", label: "设备", required: false },
];

type FieldMappingPanelProps = {
  fields: string[];
  mapping: FieldMapping;
  onChange: (mapping: FieldMapping) => void;
};

export function FieldMappingPanel({ fields, mapping, onChange }: FieldMappingPanelProps) {
  const values = Object.values(mapping).filter(Boolean);
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  const missing = mappingFields.filter((item) => item.required && !fields.includes(mapping[item.key]));

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        {mappingFields.map((item) => (
          <label className="grid gap-1 text-sm" key={item.key}>
            <span className="font-medium text-slate-700">{item.label}{item.required ? " *" : ""}</span>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3"
              onChange={(event) => onChange({ ...mapping, [item.key]: event.target.value })}
              value={mapping[item.key]}
            >
              <option value="">不映射</option>
              {fields.map((field) => <option key={field} value={field}>{field}</option>)}
            </select>
          </label>
        ))}
      </div>
      <MappingIssues duplicates={duplicates} missing={missing.map((item) => item.label)} />
    </div>
  );
}

function MappingIssues({ duplicates, missing }: { duplicates: string[]; missing: string[] }) {
  if (!duplicates.length && !missing.length) return <p className="text-sm text-emerald-700">必填字段和冲突检查通过。</p>;
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      {missing.length ? <p>缺少必填字段：{missing.join("、")}</p> : null}
      {duplicates.length ? <p>存在重复映射：{Array.from(new Set(duplicates)).join("、")}</p> : null}
    </div>
  );
}
