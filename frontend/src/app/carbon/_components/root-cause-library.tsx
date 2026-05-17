"use client";

import { Download, GitBranch } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data/data-table";
import { Button } from "@/components/ui/forms/button";
import { SearchBox } from "@/components/ui/forms/search-box";
import { pct } from "@/lib/formatters/number";
import type { GraphPayload, Recommendation } from "@/types/api";

type RootCause = {
  id: string;
  cause: string;
  effect: string;
  confidence: number;
  evidence: string;
  source: string;
};

type RootCauseLibraryProps = {
  graph: GraphPayload;
  recommendations: Recommendation[];
};

export function RootCauseLibrary({ graph, recommendations }: RootCauseLibraryProps) {
  const [query, setQuery] = useState("");
  const causes = useMemo(() => buildCauses(graph, recommendations), [graph, recommendations]);
  const visible = causes.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  function exportJson() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(visible, null, 2)], { type: "application/json" }));
    Object.assign(document.createElement("a"), { href: url, download: "root-causes.json" }).click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchBox onChange={setQuery} placeholder="搜索原因、结果、证据" value={query} />
        <Button onClick={exportJson}><Download size={16} />导出根因</Button>
      </div>
      <DataTable
        columns={[
          { key: "cause", header: "原因", render: (row) => <span className="inline-flex items-center gap-2"><GitBranch size={14} />{row.cause}</span> },
          { key: "effect", header: "结果", render: (row) => row.effect },
          { key: "confidence", header: "置信度", render: (row) => pct(row.confidence) },
          { key: "evidence", header: "证据", render: (row) => row.evidence },
          { key: "source", header: "来源", render: (row) => row.source },
        ]}
        rowKey={(row) => row.id}
        rows={visible}
      />
    </section>
  );
}

function buildCauses(graph: GraphPayload, recommendations: Recommendation[]): RootCause[] {
  const bottlenecks = graph.nodes.filter((node) => node.kind === "bottleneck");
  const graphCauses = bottlenecks.map((node) => ({
    id: node.id,
    cause: node.label,
    effect: "流程时长与碳排上升",
    confidence: 0.72,
    evidence: JSON.stringify(node.properties || {}),
    source: "knowledge_graph",
  }));
  const recCauses = recommendations.map((item) => ({
    id: `rec:${item.id}`,
    cause: item.title,
    effect: "预计减排机会",
    confidence: item.confidence,
    evidence: JSON.stringify(item.evidence),
    source: item.run_id || "optimization",
  }));
  return [...graphCauses, ...recCauses];
}
