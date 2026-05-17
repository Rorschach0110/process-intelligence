import { DrawerShell } from "@/components/ui/shell/drawer-shell";
import { kg, pct } from "@/lib/formatters/number";
import type { Recommendation } from "@/types/api";

export function RecommendationDetail({ item }: { item?: Recommendation }) {
  if (!item) return <DrawerShell title="建议详情"><p className="text-sm text-slate-500">请选择优化建议。</p></DrawerShell>;
  const saving = Number(item.evidence.estimated_saving_kg || item.evidence.activity_carbon_kg || item.evidence.carbon_kg || 0) * 0.1;
  return (
    <DrawerShell title={item.title}>
      <div className="grid gap-4 text-sm">
        <section className="grid grid-cols-2 gap-2">
          <Stat label="置信度" value={pct(item.confidence)} />
          <Stat label="预计减排" value={kg(saving)} />
          <Stat label="状态" value={item.status} />
          <Stat label="运行" value={item.run_id || "ad-hoc"} />
        </section>
        <section>
          <h3 className="mb-2 font-semibold">风险</h3>
          {Object.entries(item.risk).map(([key, value]) => <p className="flex justify-between border-b border-slate-100 py-1" key={key}><span>{key}</span><strong>{value}</strong></p>)}
        </section>
        <section>
          <h3 className="mb-2 font-semibold">证据</h3>
          <pre className="max-h-56 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify(item.evidence, null, 2)}</pre>
        </section>
        <section>
          <h3 className="mb-2 font-semibold">验证方式</h3>
          <p className="rounded bg-slate-50 p-3 text-slate-600">小批量执行后对比单位事件碳强度、吞吐量、返工率和质量异常。</p>
        </section>
        <section>
          <h3 className="mb-2 font-semibold">关联图谱路径</h3>
          <p className="rounded bg-blue-50 p-3 text-blue-800">{item.run_id || "ad-hoc"} → activity/resource → carbon:total</p>
        </section>
      </div>
    </DrawerShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><strong>{value}</strong></div>;
}
