import { GraphView } from "@/components/graph/graph-view";
import { Panel } from "@/components/ui/panel";
import { apiGet } from "@/lib/api/client";

type GraphResponse = {
  content?: Graph;
  nodes?: Graph["nodes"];
  edges?: Graph["edges"];
};

type Graph = {
  nodes: { id: string; label: string; kind: string }[];
  edges: { source: string; target: string; relation: string }[];
};

export default async function GraphPage() {
  const [exported, plan] = await Promise.all([
    apiGet<GraphResponse>("/api/graph/export"),
    apiGet<{ node_count: number; edge_count: number; mode: string }>("/api/graph/neo4j-plan"),
  ]);
  const graph = exported.content || { nodes: exported.nodes || [], edges: exported.edges || [] };
  return (
    <div className="grid gap-6">
      <Panel title="知识图谱">
        <GraphView graph={graph} />
      </Panel>
      <Panel title="Neo4j 导入计划">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>节点：{plan.node_count}</div>
          <div>关系：{plan.edge_count}</div>
          <div>模式：{plan.mode}</div>
        </div>
      </Panel>
    </div>
  );
}
