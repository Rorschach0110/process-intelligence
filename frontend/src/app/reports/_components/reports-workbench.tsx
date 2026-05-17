"use client";

import { FilePlus, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data/data-table";
import { Button } from "@/components/ui/forms/button";
import { SearchBox } from "@/components/ui/forms/search-box";
import { Toolbar } from "@/components/ui/shell/toolbar";
import { planningClient } from "@/lib/api/domains/planning";
import type { Report } from "@/types/api";
import { ReportPreview } from "./report-preview";

export function ReportsWorkbench({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(reports[0]?.id);
  const [creating, setCreating] = useState("");
  const visible = useMemo(() => reports.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [reports, query]);
  const selected = reports.find((item) => item.id === selectedId);
  async function create(type: string) {
    setCreating(type);
    const report = await planningClient.createReport(type);
    setReports([report, ...reports]);
    setSelectedId(report.id);
    setCreating("");
  }
  return (
    <div className="grid gap-5">
      <Toolbar actions={<ReportActions creating={creating} onCreate={create} />} description="沉淀面向管理层、工程侧、碳核算和维护侧的报告制品。" title="报告中心">
        <SearchBox onChange={setQuery} placeholder="搜索报告、运行、路径" value={query} />
        <Button onClick={() => window.location.reload()}><RefreshCw size={16} />刷新</Button>
      </Toolbar>
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <DataTable
          columns={[
            { key: "title", header: "标题", render: (row) => <button className="font-semibold text-blue-700" onClick={() => setSelectedId(row.id)} type="button">{row.title}</button> },
            { key: "type", header: "类型", render: (row) => row.report_type },
            { key: "run", header: "运行", render: (row) => row.run_id },
            { key: "path", header: "文件", render: (row) => row.file_path },
            { key: "created", header: "生成时间", render: (row) => row.created_at },
          ]}
          rowKey={(row) => row.id}
          rows={visible}
        />
        <ReportPreview report={selected} />
      </div>
    </div>
  );
}

function ReportActions({ creating, onCreate }: { creating: string; onCreate: (type: string) => void }) {
  return <>{["executive", "engineering", "carbon", "maintenance"].map((type) => <Button disabled={Boolean(creating)} key={type} onClick={() => onCreate(type)} variant="primary"><FilePlus size={16} />{creating === type ? "生成中" : type}</Button>)}</>;
}
