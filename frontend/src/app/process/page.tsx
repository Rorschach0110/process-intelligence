import { MetricCard } from "@/components/ui/metric-card";
import { Panel } from "@/components/ui/panel";
import { apiGet } from "@/lib/api/client";

type Process = {
  process: {
    events: number;
    cases: number;
    avg_case_duration_min: number;
    health_score: { score: number; grade: string };
    variant_details: { id: number; path: string[]; share: number }[];
    rework_paths: { case_id: string; activity: string; path: string }[];
    compliance_deviations: { case_id: string; path: string }[];
  };
};

export default async function ProcessPage() {
  const { process } = await apiGet<Process>("/api/process/summary");
  return (
    <div className="grid gap-6">
      <section className="grid grid-cols-4 gap-4">
        <MetricCard label="事件" value={String(process.events)} detail="日志事件数" />
        <MetricCard label="案例" value={String(process.cases)} detail="流程实例数" />
        <MetricCard label="平均时长" value={`${process.avg_case_duration_min} min`} detail="案例总时长" />
        <MetricCard label="健康评分" value={String(process.health_score.score)} detail={process.health_score.grade} />
      </section>
      <Panel title="流程变体">
        <div className="grid gap-2">
          {process.variant_details.slice(0, 6).map((variant) => (
            <div className="rounded-md bg-slate-50 p-3 text-sm" key={variant.id}>
              <strong>Variant {variant.id}</strong>
              <p className="mt-1 text-slate-600">{variant.path.join(" -> ")} · {Math.round(variant.share * 100)}%</p>
            </div>
          ))}
        </div>
      </Panel>
      <section className="grid grid-cols-2 gap-6">
        <Panel title="返工路径">
          {process.rework_paths.map((item) => <p className="mb-2 text-sm" key={`${item.case_id}-${item.path}`}>{item.case_id}: {item.path}</p>)}
        </Panel>
        <Panel title="合规偏差">
          {process.compliance_deviations.map((item) => <p className="mb-2 text-sm" key={item.case_id}>{item.case_id}: {item.path}</p>)}
        </Panel>
      </section>
    </div>
  );
}
