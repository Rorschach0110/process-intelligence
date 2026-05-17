"use client";

import { useState } from "react";
import { MetricCard } from "@/components/ui/metric-card";
import { Panel } from "@/components/ui/panel";
import { kg } from "@/lib/formatters/number";
import type { CarbonFactor, CarbonSummary, GraphPayload, Recommendation } from "@/types/api";
import { FactorLibrary } from "./factor-library";
import { RootCauseLibrary } from "./root-cause-library";

export function CarbonWorkbench({ carbon, factors, graph, recommendations }: { carbon: CarbonSummary; factors: CarbonFactor[]; graph: GraphPayload; recommendations: Recommendation[] }) {
  const [tab, setTab] = useState<"factors" | "causes">("factors");
  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard detail="事件聚合" label="能耗" value={`${carbon.summary.total_energy_kwh} kWh`} />
        <MetricCard detail="事件聚合" label="物料" value={`${carbon.summary.total_material_kg} kg`} />
        <MetricCard detail="CO2e" label="总碳排" value={kg(carbon.summary.total_carbon_kg)} />
        <MetricCard detail="库内可用版本" label="因子" value={String(factors.length)} />
      </section>
      <Panel
        action={<div className="flex rounded-md bg-slate-100 p-1 text-sm"><Tab active={tab === "factors"} onClick={() => setTab("factors")}>因子库</Tab><Tab active={tab === "causes"} onClick={() => setTab("causes")}>根因库</Tab></div>}
        title={tab === "factors" ? "碳因子库" : "根因库"}
      >
        {tab === "factors" ? <FactorLibrary initialFactors={factors} /> : <RootCauseLibrary graph={graph} recommendations={recommendations} />}
      </Panel>
    </div>
  );
}

function Tab({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return <button className={`rounded px-3 py-1 ${active ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"}`} onClick={onClick} type="button">{children}</button>;
}
