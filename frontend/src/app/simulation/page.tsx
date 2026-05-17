import { planningClient } from "@/lib/api/domains/planning";
import { opsClient } from "@/lib/api/domains/ops";
import { SimulationWorkbench } from "./_components/simulation-workbench";

export default async function SimulationPage() {
  const [scenarios, runs] = await Promise.all([planningClient.scenarios(), opsClient.runs()]);
  return <SimulationWorkbench initialScenarios={scenarios.scenarios} runs={runs.runs} />;
}
