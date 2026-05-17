import { planningClient } from "@/lib/api/domains/planning";
import { ReportsWorkbench } from "./_components/reports-workbench";

export default async function ReportsPage() {
  const { reports } = await planningClient.reports();
  return <ReportsWorkbench initialReports={reports} />;
}
