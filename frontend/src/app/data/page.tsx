import { apiGet } from "@/lib/api/client";
import type { Dataset } from "@/types/api";
import { DataWorkbench } from "./_components/data-workbench";

export default async function DataPage() {
  const { datasets } = await apiGet<{ datasets: Dataset[] }>("/api/datasets");
  return <DataWorkbench initialDatasets={datasets} />;
}
