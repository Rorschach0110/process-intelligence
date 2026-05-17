"use client";

import { RefreshCw, Table2, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/feedback/empty-state";
import { Button } from "@/components/ui/forms/button";
import { Modal } from "@/components/ui/forms/modal";
import { SearchBox } from "@/components/ui/forms/search-box";
import { DataTable } from "@/components/ui/data/data-table";
import { Toolbar } from "@/components/ui/shell/toolbar";
import { useWorkspaceStore } from "@/lib/stores/workspace";
import type { Dataset } from "@/types/api";
import { CategorySidebar } from "./category-sidebar";
import { DatasetCard } from "./dataset-card";
import { DatasetDetailPane } from "./dataset-detail";
import { UploadModal } from "./upload-modal";

type DataWorkbenchProps = {
  initialDatasets: Dataset[];
};

export function DataWorkbench({ initialDatasets }: DataWorkbenchProps) {
  const [datasets, setDatasets] = useState(initialDatasets);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editing, setEditing] = useState<Dataset | null>(null);
  const [deleting, setDeleting] = useState<Dataset | null>(null);
  const [selectedId, setSelectedId] = useState(datasets[0]?.id);
  const { datasetId, setDatasetId } = useWorkspaceStore();

  const visible = useMemo(() => datasets.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())), [datasets, query]);
  const selected = visible.find((item) => item.id === selectedId) || visible[0];

  function refresh() {
    window.location.reload();
  }

  return (
    <div className="flex min-h-[calc(100vh-9rem)] overflow-hidden rounded-lg border border-slate-200 bg-white">
      <CategorySidebar selected={category} onSelect={setCategory} />
      <section className="flex min-w-0 flex-1 flex-col bg-slate-50">
        <Toolbar
          actions={<Button onClick={() => setUploadOpen(true)} variant="primary"><UploadCloud size={16} />上传文件</Button>}
          description="管理事件日志、量化结果、报告和因子来源，作为后续建模工作区的数据入口。"
          title="数据知识库"
        >
          <SearchBox onChange={setQuery} placeholder="搜索数据集、文件路径" value={query} />
          <Button onClick={refresh}><RefreshCw size={16} />刷新</Button>
          <Button onClick={() => setView(view === "cards" ? "table" : "cards")}><Table2 size={16} />{view === "cards" ? "表格" : "卡片"}</Button>
        </Toolbar>
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_360px]">
          <section className="overflow-auto p-5">
            {visible.length ? (
              view === "cards" ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {visible.map((dataset) => (
                    <DatasetCard
                      active={dataset.id === datasetId}
                      dataset={dataset}
                      key={dataset.id}
                      onDelete={() => setDeleting(dataset)}
                      onEdit={() => setEditing(dataset)}
                      onOpen={() => setSelectedId(dataset.id)}
                      onSetActive={() => setDatasetId(dataset.id)}
                      selected={dataset.id === selected?.id}
                    />
                  ))}
                </div>
              ) : (
                <DataTable
                  columns={[
                    { key: "name", header: "名称", render: (row) => <button className="font-semibold text-blue-700" onClick={() => setSelectedId(row.id)} type="button">{row.name}</button> },
                    { key: "fields", header: "字段", render: (row) => row.field_count },
                    { key: "rows", header: "预览行", render: (row) => row.row_count },
                    { key: "created", header: "创建时间", render: (row) => row.created_at },
                  ]}
                  rowKey={(row) => row.id}
                  rows={visible}
                />
              )
            ) : <EmptyState action={<Button onClick={() => setUploadOpen(true)} variant="primary">上传第一个数据集</Button>} description="当前分类或搜索条件下没有数据。上传 CSV 后即可进入字段映射和量化建模。" title="暂无数据集" />}
          </section>
          <DatasetDetailPane dataset={selected} />
        </div>
      </section>
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={() => setDatasets(datasets)} />
      <EditDatasetModal dataset={editing} onClose={() => setEditing(null)} />
      <DeleteDatasetModal dataset={deleting} onClose={() => setDeleting(null)} onDelete={() => {
        setDatasets(datasets.filter((item) => item.id !== deleting?.id));
        setDeleting(null);
      }} />
    </div>
  );
}

function EditDatasetModal({ dataset, onClose }: { dataset: Dataset | null; onClose: () => void }) {
  return (
    <Modal open={Boolean(dataset)} title="编辑元数据" onClose={onClose}>
      <div className="grid gap-3 text-sm">
        <label className="grid gap-1"><span>名称</span><input className="h-10 rounded-md border border-slate-200 px-3" defaultValue={dataset?.name} /></label>
        <label className="grid gap-1"><span>标签</span><input className="h-10 rounded-md border border-slate-200 px-3" placeholder="事件日志、产线 A、2026Q2" /></label>
        <div className="flex justify-end gap-2"><Button onClick={onClose}>取消</Button><Button onClick={onClose} variant="primary">保存</Button></div>
      </div>
    </Modal>
  );
}

function DeleteDatasetModal({ dataset, onClose, onDelete }: { dataset: Dataset | null; onClose: () => void; onDelete: () => void }) {
  return (
    <Modal open={Boolean(dataset)} title="删除确认" onClose={onClose}>
      <p className="text-sm text-slate-600">确认从当前视图移除 {dataset?.name}？后端删除接口接入后将同步删除数据资产。</p>
      <div className="mt-5 flex justify-end gap-2"><Button onClick={onClose}>取消</Button><Button onClick={onDelete} variant="danger">删除</Button></div>
    </Modal>
  );
}
