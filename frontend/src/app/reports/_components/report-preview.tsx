import { DrawerShell } from "@/components/ui/shell/drawer-shell";
import type { Report } from "@/types/api";

export function ReportPreview({ report }: { report?: Report }) {
  if (!report) return <DrawerShell title="报告预览"><p className="text-sm text-slate-500">请选择或生成报告。</p></DrawerShell>;
  return (
    <DrawerShell title={report.title}>
      <div className="grid gap-4 text-sm">
        <section className="grid grid-cols-2 gap-2">
          <Stat label="类型" value={report.report_type} />
          <Stat label="运行" value={report.run_id} />
          <Stat label="文件" value={report.file_path} />
          <Stat label="时间" value={report.created_at} />
        </section>
        <section className="rounded-md bg-slate-50 p-3">
          <h3 className="font-semibold">目录</h3>
          <p className="mt-2 text-slate-600">Summary · Carbon · Optimization · Audit</p>
        </section>
        {"content_html" in report && report.content_html ? (
          <article className="prose prose-sm max-w-none rounded-md border border-slate-200 p-4" dangerouslySetInnerHTML={{ __html: report.content_html }} />
        ) : <p className="rounded-md bg-slate-50 p-3 text-slate-600">列表接口不返回正文。新建报告后会立即显示 HTML 预览。</p>}
        <section className="rounded-md border border-slate-200 p-3">
          <h3 className="font-semibold">审计信息</h3>
          <p className="mt-2 text-slate-600">数据来源、字段映射、碳因子版本和算法版本由后端报告服务生成并随 HTML 文件归档。</p>
        </section>
      </div>
    </DrawerShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><strong className="break-all">{value}</strong></div>;
}
