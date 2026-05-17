"use client";

import { Database, Network, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { GraphView } from "@/components/graph/graph-view";
import { Button } from "@/components/ui/forms/button";
import { SearchBox } from "@/components/ui/forms/search-box";
import { Toolbar } from "@/components/ui/shell/toolbar";
import { useWorkspaceStore } from "@/lib/stores/workspace";
import type { GraphPayload, RunSummary } from "@/types/api";
import { buildCompactGraph } from "./graph-snapshot";
import { NodeDetail } from "./node-detail";

type GraphWorkbenchProps = {
  graph: GraphPayload;
  plan: { adapter: string; cypher: string; edge_count: number; mode: string; node_count: number };
  runs: RunSummary[];
};

export function GraphWorkbench({ graph, plan, runs }: GraphWorkbenchProps) {
  const { graphNodeId, setGraphNodeId } = useWorkspaceStore();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");
  const [minCarbon, setMinCarbon] = useState(0);
  const compactGraph = useMemo(() => buildCompactGraph(graph), [graph]);
  const filtered = useMemo(() => filterGraph(compactGraph, query, kind, minCarbon), [compactGraph, kind, minCarbon, query]);
  const selected = filtered.nodes.find((node) => node.id === graphNodeId) || filtered.nodes[0];
  const activeRun = runs[0];
  const hiddenNodes = Math.max(0, graph.nodes.length - compactGraph.nodes.length);
  const hiddenEdges = Math.max(0, graph.edges.length - compactGraph.edges.length);

  return (
    <div className="grid gap-5">
      <Toolbar
        actions={
          <Button>
            <Network size={16} />
            核心视图 {filtered.nodes.length}/{graph.nodes.length}
          </Button>
        }
        description="图谱来自最近一次 pipeline 运行结果。默认只保留流程骨架、资源和关键碳指标，避免页面因为长尾节点而卡顿。"
        title="知识图谱"
      >
        <SearchBox onChange={setQuery} placeholder="搜索节点或属性" value={query} />
        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" onChange={(event) => setKind(event.target.value)} value={kind}>
          <option value="">全部类型</option>
          {compactGraph.schema?.node_types.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          碳排阈值
          <input className="w-40" max="200" min="0" onChange={(event) => setMinCarbon(Number(event.target.value))} type="range" value={minCarbon} />
          {minCarbon}
        </label>
        <Button onClick={() => setGraphNodeId(selected?.id || "")}>
          <Search size={16} />
          聚焦节点
        </Button>
      </Toolbar>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          <GraphView graph={filtered} onSelect={setGraphNodeId} selectedId={selected?.id} />
          <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm md:grid-cols-3">
            <InfoCard title="当前视图" value={`${filtered.nodes.length} 节点 / ${filtered.edges.length} 关系`}>
              已省略 {hiddenNodes} 个非核心节点和 {hiddenEdges} 条长尾关系，保证浏览顺畅。
            </InfoCard>
            <InfoCard title="数据来源" value={activeRun?.run_id || "ad-hoc"}>
              {activeRun ? `${activeRun.events} 事件 · ${activeRun.cases} 案例 · ${activeRun.total_carbon_kg.toFixed(1)} kg CO2e` : "暂未找到最近一次运行记录。"}
            </InfoCard>
            <InfoCard title="Neo4j 导入计划" value={`${plan.adapter} · ${plan.mode}`}>
              <span className="flex items-center gap-1">
                <Database size={14} />
                {plan.cypher.split("\n").length} statements
              </span>
            </InfoCard>
          </section>
        </section>
        <NodeDetail edges={filtered.edges} node={selected} />
      </div>
    </div>
  );
}

function InfoCard({ children, title, value }: { children: ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-2 text-base font-semibold text-slate-950">{value}</p>
      <div className="mt-2 text-slate-600">{children}</div>
    </div>
  );
}

function filterGraph(graph: GraphPayload, query: string, kind: string, minCarbon: number): GraphPayload {
  const text = query.toLowerCase();
  const nodes = graph.nodes.filter((node) => {
    const matchesKind = kind ? node.kind === kind : true;
    const carbon = Number(node.properties?.carbon_kg || node.properties?.total_carbon_kg || 0);
    const matchesCarbon = minCarbon ? carbon >= minCarbon || carbon === 0 : true;
    const haystack = `${node.id} ${node.label} ${JSON.stringify(node.properties || {})}`.toLowerCase();
    return matchesKind && matchesCarbon && (!text || haystack.includes(text));
  });
  const ids = new Set(nodes.map((node) => node.id));
  const edges = graph.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target));
  return {
    ...graph,
    edges,
    nodes,
    schema: {
      node_types: [...new Set(nodes.map((node) => node.kind))].sort(),
      relation_types: [...new Set(edges.map((edge) => edge.relation))].sort(),
    },
  };
}
