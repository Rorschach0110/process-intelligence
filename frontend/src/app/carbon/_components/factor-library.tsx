"use client";

import { Download, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data/data-table";
import { Button } from "@/components/ui/forms/button";
import { Modal } from "@/components/ui/forms/modal";
import { SearchBox } from "@/components/ui/forms/search-box";
import { carbonClient } from "@/lib/api/domains/carbon";
import type { CarbonFactor } from "@/types/api";

type FactorLibraryProps = {
  initialFactors: CarbonFactor[];
};

export function FactorLibrary({ initialFactors }: FactorLibraryProps) {
  const [factors, setFactors] = useState(initialFactors);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const visible = useMemo(() => factors.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [factors, query]);

  function exportJson() {
    const blob = new Blob([JSON.stringify(visible, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: "carbon-factors.json" }).click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchBox onChange={setQuery} placeholder="搜索因子、Scope、来源" value={query} />
        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)} variant="primary"><Plus size={16} />添加因子</Button>
          <Button onClick={exportJson}><Download size={16} />导出</Button>
          <Button disabled={!selected.length} onClick={() => setFactors(factors.filter((item) => !selected.includes(item.id)))} variant="danger">删除 {selected.length}</Button>
        </div>
      </div>
      <DataTable
        columns={[
          { key: "select", header: "选择", render: (row) => <input checked={selected.includes(row.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, row.id] : selected.filter((id) => id !== row.id))} type="checkbox" /> },
          { key: "name", header: "名称", render: (row) => <strong>{row.name}</strong> },
          { key: "type", header: "类型", render: (row) => row.factor_type },
          { key: "value", header: "数值", render: (row) => `${row.value} ${row.unit}` },
          { key: "scope", header: "Scope", render: (row) => row.scope },
          { key: "source", header: "来源", render: (row) => row.source || "-" },
          { key: "active", header: "状态", render: (row) => row.is_active ? "启用" : "停用" },
          { key: "action", header: "操作", render: (row) => <button className="text-blue-700" onClick={() => { setSelected([row.id]); setOpen(true); }} type="button">编辑</button> },
        ]}
        rowKey={(row) => row.id}
        rows={visible}
      />
      <FactorModal open={open} onClose={() => setOpen(false)} onSaved={(factor) => setFactors([factor, ...factors])} />
    </section>
  );
}

function FactorModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: (factor: CarbonFactor) => void }) {
  const [form, setForm] = useState({ name: "", factor_type: "electricity", unit: "kgCO2e/kWh", value: 0.581, source: "manual", version: "v1", scope: "Scope 2" });
  async function save() {
    const factor = await carbonClient.createFactor({ ...form, is_active: true });
    onSaved(factor);
    onClose();
  }
  return (
    <Modal open={open} title="添加碳因子" onClose={onClose}>
      <div className="grid gap-3">
        {(["name", "factor_type", "unit", "source", "version", "scope"] as const).map((key) => (
          <label className="grid gap-1 text-sm" key={key}><span>{key}</span><input className="h-10 rounded-md border border-slate-200 px-3" onChange={(event) => setForm({ ...form, [key]: event.target.value })} value={form[key]} /></label>
        ))}
        <label className="grid gap-1 text-sm"><span>value</span><input className="h-10 rounded-md border border-slate-200 px-3" onChange={(event) => setForm({ ...form, value: Number(event.target.value) })} type="number" value={form.value} /></label>
        <div className="flex justify-end gap-2"><Button onClick={onClose}>取消</Button><Button onClick={save} variant="primary">保存</Button></div>
      </div>
    </Modal>
  );
}
