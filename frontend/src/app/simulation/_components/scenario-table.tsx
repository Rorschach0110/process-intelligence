import { DataTable } from "@/components/ui/data/data-table";
import { kg } from "@/lib/formatters/number";
import type { Scenario } from "@/types/api";

export function ScenarioTable({ scenarios }: { scenarios: Scenario[] }) {
  return (
    <DataTable
      columns={[
        { key: "name", header: "方案", render: (row) => <strong>{row.name}</strong> },
        { key: "saving", header: "预计节省", render: (row) => kg(row.results.estimated_saving_kg) },
        { key: "capacity", header: "产能变化", render: (row) => `${Math.round(row.results.capacity_delta * 100)}%` },
        { key: "cost", header: "成本变化", render: (row) => `${Math.round(row.results.cost_delta * 100)}%` },
        { key: "risk", header: "风险", render: (row) => row.results.risk_score },
        { key: "score", header: "评分", render: (row) => row.score },
      ]}
      rowKey={(row) => row.id}
      rows={scenarios}
    />
  );
}
