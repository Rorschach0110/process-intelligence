import { carbonClient } from "@/lib/api/domains/carbon";
import { graphClient } from "@/lib/api/domains/graph";
import { planningClient } from "@/lib/api/domains/planning";
import { CarbonWorkbench } from "./_components/carbon-workbench";

export default async function CarbonPage() {
  const [carbon, factors, graph, recommendations] = await Promise.all([
    carbonClient.summary(),
    carbonClient.factors(),
    graphClient.exportJson(),
    planningClient.recommendations(),
  ]);
  return <CarbonWorkbench carbon={carbon.carbon} factors={factors.factors} graph={graph.content} recommendations={recommendations.recommendations} />;
}
