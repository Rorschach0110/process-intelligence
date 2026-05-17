"use client";

import { useEffect, useState } from "react";
import { DrawerShell } from "@/components/ui/shell/drawer-shell";
import { DataTable } from "@/components/ui/data/data-table";
import { datasetsClient } from "@/lib/api/domains/datasets";
import type { Dataset, DatasetDetail, DatasetPreview } from "@/types/api";

type DatasetDetailProps = {
  dataset?: Dataset;
};

export function DatasetDetailPane({ dataset }: DatasetDetailProps) {
  const [detail, setDetail] = useState<DatasetDetail | null>(null);
  const [preview, setPreview] = useState<DatasetPreview | null>(null);

  useEffect(() => {
    if (!dataset) return;
    datasetsClient.detail(dataset.id).then(setDetail).catch(() => setDetail(null));
    datasetsClient.preview(dataset.id, 1, 12).then(setPreview).catch(() => setPreview(null));
  }, [dataset]);

  if (!dataset) {
    return <DrawerShell title="数据集详情"><p className="text-sm text-slate-500">请选择一个数据集。</p></DrawerShell>;
  }
  const fields = preview?.fields || [];
  const rows = preview?.preview || [];
  const quality = detail?.profile?.quality || {};
  return (
    <DrawerShell title={dataset.name}>
      <div className="grid gap-4 text-sm">
        <section className="grid grid-cols-3 gap-2">
          <Stat label="字段" value={dataset.field_count} />
          <Stat label="预览行" value={dataset.row_count} />
          <Stat label="质量" value={String(quality.score ?? "-")} />
        </section>
        <section>
          <h3 className="mb-2 font-semibold text-slate-900">字段概览</h3>
          <div className="flex flex-wrap gap-2">{fields.map((field) => <span className="rounded bg-slate-100 px-2 py-1 text-xs" key={field}>{field}</span>)}</div>
        </section>
        <section>
          <h3 className="mb-2 font-semibold text-slate-900">分页预览</h3>
          <DataTable
            columns={fields.slice(0, 5).map((field) => ({ key: field, header: field, render: (row: Record<string, string>) => row[field] }))}
            rowKey={(_, index) => index}
            rows={rows}
          />
        </section>
      </div>
    </DrawerShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><strong>{value}</strong></div>;
}
