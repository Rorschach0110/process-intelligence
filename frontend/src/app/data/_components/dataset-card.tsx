import { CheckCircle2, Database, FileSpreadsheet } from "lucide-react";
import type { Dataset } from "@/types/api";

type DatasetCardProps = {
  dataset: Dataset;
  active: boolean;
  selected: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onOpen: () => void;
  onSetActive: () => void;
};

export function DatasetCard({ dataset, active, selected, onDelete, onEdit, onOpen, onSetActive }: DatasetCardProps) {
  return (
    <article className={`rounded-lg border bg-white p-4 ${selected ? "border-blue-400" : "border-slate-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-cyan-50 p-2 text-cyan-700"><FileSpreadsheet size={18} /></span>
          <div>
            <h3 className="text-sm font-semibold text-slate-950">{dataset.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{dataset.file_path}</p>
          </div>
        </div>
        {active ? <CheckCircle2 size={18} className="text-emerald-600" /> : null}
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div><dt className="text-xs text-slate-500">字段</dt><dd className="font-semibold">{dataset.field_count}</dd></div>
        <div><dt className="text-xs text-slate-500">预览行</dt><dd className="font-semibold">{dataset.row_count}</dd></div>
        <div><dt className="text-xs text-slate-500">类型</dt><dd className="font-semibold">CSV</dd></div>
      </dl>
      <div className="mt-4 flex gap-2">
        <button className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200" onClick={onOpen} type="button">
          查看详情
        </button>
        <button className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200" onClick={onEdit} type="button">
          编辑
        </button>
        <button className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100" onClick={onDelete} type="button">
          删除
        </button>
        <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700" onClick={onSetActive} type="button">
          <Database className="inline" size={14} /> 设为当前
        </button>
      </div>
    </article>
  );
}
