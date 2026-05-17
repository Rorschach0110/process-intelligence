import { DrawerShell } from "@/components/ui/shell/drawer-shell";
import { kg } from "@/lib/formatters/number";
import type { CarbonSummary, ProcessSummary, Recommendation } from "@/types/api";

type ActivityDetailProps = {
  activity?: string;
  process: ProcessSummary;
  carbon: CarbonSummary;
  recommendations: Recommendation[];
};

type ResourceLoad = ProcessSummary["resource_load"][number] & {
  utilization_index?: number;
  share?: number;
};

export function ActivityDetail({ activity, carbon, process, recommendations }: ActivityDetailProps) {
  if (!activity) {
    return (
      <DrawerShell title="活动详情">
        <p className="text-sm text-slate-500">请选择一个流程活动。</p>
      </DrawerShell>
    );
  }
  const bottle = process.bottlenecks.find((item) => item.activity === activity);
  const carbonRow = carbon.by_activity.find((item) => item.activity === activity);
  const related = recommendations.filter((item) => item.title.includes(activity));
  return (
    <DrawerShell title={activity}>
      <div className="grid gap-4 text-sm">
        <section className="grid grid-cols-2 gap-2">
          <Stat label="总时长" value={`${bottle?.total_duration_min || 0} min`} />
          <Stat label="平均时长" value={`${bottle?.avg_duration_min || 0} min`} />
          <Stat label="碳排" value={kg(carbonRow?.carbon_kg)} />
          <Stat label="事件" value={carbonRow?.events || 0} />
        </section>
        <section>
          <h3 className="mb-2 font-semibold">资源负载</h3>
          {resourceLoads(process).map((item) => (
            <p className="flex justify-between border-b border-slate-100 py-1" key={item.resource}>
              <span>{item.resource}</span>
              <strong>{Math.round(item.load * 100)}%</strong>
            </p>
          ))}
        </section>
        <section>
          <h3 className="mb-2 font-semibold">关联建议</h3>
          {related.length ? (
            related.map((item) => <p className="mb-2 rounded bg-slate-50 p-2" key={item.id}>{item.title}</p>)
          ) : (
            <p className="text-slate-500">暂无持久化建议。</p>
          )}
        </section>
        <section>
          <h3 className="mb-2 font-semibold">返工路径</h3>
          {process.rework_paths.filter((item) => item.activity === activity).map((item) => (
            <p className="mb-2 rounded bg-amber-50 p-2" key={`${item.case_id}-${item.path}`}>
              {item.case_id}: {item.path}
            </p>
          ))}
        </section>
      </div>
    </DrawerShell>
  );
}

function resourceLoads(process: ProcessSummary): (ResourceLoad & { load: number })[] {
  const rows = process.resource_load.slice(0, 4) as ResourceLoad[];
  const maxEvents = Math.max(1, ...rows.map((item) => item.events || 0));
  return rows.map((item) => ({
    ...item,
    load: item.share ?? item.utilization_index ?? (item.events || 0) / maxEvents,
  }));
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
