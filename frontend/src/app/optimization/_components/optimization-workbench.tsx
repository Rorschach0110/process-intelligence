"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/feedback/empty-state";
import { Toolbar } from "@/components/ui/shell/toolbar";
import type { Recommendation } from "@/types/api";
import { RecommendationCard } from "./recommendation-card";
import { RecommendationDetail } from "./recommendation-detail";

export function OptimizationWorkbench({ recommendations, providers }: { recommendations: Recommendation[]; providers: { id: number; name: string; model: string; is_active: number }[] }) {
  const [selectedId, setSelectedId] = useState(recommendations[0]?.id);
  const [statuses, setStatuses] = useState<Record<number, string>>({});
  const selected = recommendations.find((item) => item.id === selectedId);
  return (
    <div className="grid gap-5">
      <Toolbar description={`Provider: ${providers[0]?.name || "rule-based"} ${providers[0]?.model || ""}`} title="优化建议审核台" />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          {recommendations.length ? recommendations.map((item) => (
            <RecommendationCard
              active={item.id === selected?.id}
              item={item}
              key={item.id}
              localStatus={statuses[item.id]}
              onSelect={() => setSelectedId(item.id)}
              onStatus={(status) => setStatuses({ ...statuses, [item.id]: status })}
            />
          )) : <EmptyState description="运行量化 pipeline 后会沉淀可审核建议。" title="暂无建议" />}
        </section>
        <RecommendationDetail item={selected} />
      </div>
    </div>
  );
}
