import { planningClient } from "@/lib/api/domains/planning";
import { OptimizationWorkbench } from "./_components/optimization-workbench";

export default async function OptimizationPage() {
  const [recommendations, providers] = await Promise.all([
    planningClient.recommendations(),
    planningClient.providers(),
  ]);
  return <OptimizationWorkbench providers={providers.providers} recommendations={recommendations.recommendations} />;
}
