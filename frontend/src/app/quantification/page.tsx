import { datasetsClient } from "@/lib/api/domains/datasets";
import { carbonClient } from "@/lib/api/domains/carbon";
import { QuantificationWorkbench } from "./_components/quantification-workbench";

export default async function QuantificationPage() {
  const [datasets, factors] = await Promise.all([
    datasetsClient.list(),
    carbonClient.factors(),
  ]);
  return <QuantificationWorkbench datasets={datasets.datasets} factors={factors.factors} />;
}
