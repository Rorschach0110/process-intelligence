import { graphClient } from "@/lib/api/domains/graph";
import { opsClient } from "@/lib/api/domains/ops";
import { GraphWorkbench } from "./_components/graph-workbench";

export default async function GraphWorkbenchPage() {
  const [graph, plan, runs] = await Promise.all([
    graphClient.exportJson(),
    graphClient.neo4jPlan(),
    opsClient.runs(),
  ]);
  return <GraphWorkbench graph={graph.content} plan={plan} runs={runs.runs} />;
}
