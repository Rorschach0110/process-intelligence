import { processClient } from "@/lib/api/domains/process";
import { carbonClient } from "@/lib/api/domains/carbon";
import { planningClient } from "@/lib/api/domains/planning";
import { ProcessMapWorkbench } from "./_components/process-map-workbench";

export default async function ProcessMapPage() {
  const [process, carbon, recommendations] = await Promise.all([
    processClient.summary(),
    carbonClient.summary(),
    planningClient.recommendations(),
  ]);
  return (
    <ProcessMapWorkbench
      carbon={carbon.carbon}
      process={process.process}
      recommendations={recommendations.recommendations}
    />
  );
}
