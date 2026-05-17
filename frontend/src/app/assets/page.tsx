import { graphClient } from "@/lib/api/domains/graph";
import { carbonClient } from "@/lib/api/domains/carbon";
import { planningClient } from "@/lib/api/domains/planning";
import { AssetsWorkbench } from "./_components/assets-workbench";

export default async function AssetsPage() {
  const [graph, carbon, recommendations] = await Promise.all([
    graphClient.exportJson(),
    carbonClient.summary(),
    planningClient.recommendations(),
  ]);
  return <AssetsWorkbench carbon={carbon.carbon} graph={graph.content} recommendations={recommendations.recommendations} />;
}
