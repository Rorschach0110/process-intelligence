import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CarbonSummary, ProcessSummary } from "@/types/api";
import { ProcessFlow } from "./process-flow";

const process = {
  activities: [
    { name: "Cutting", count: 5 },
    { name: "Assembly", count: 4 },
    { name: "Inspection", count: 3 },
  ],
  avg_case_duration_min: 10,
  bottlenecks: [],
  cases: 1,
  compliance_deviations: [],
  edges: [
    { count: 5, source: "Cutting", target: "Assembly" },
    { count: 3, source: "Assembly", target: "Inspection" },
  ],
  events: 5,
  health_score: { grade: "A", score: 90 },
  resource_load: [],
  rework_paths: [],
  variant_details: [],
} satisfies ProcessSummary;

const carbon = {
  by_activity: [
    { activity: "Cutting", carbon_kg: 2, carbon_per_event: 0.4, energy_kwh: 1, events: 5, material_kg: 1 },
    { activity: "Assembly", carbon_kg: 3, carbon_per_event: 0.75, energy_kwh: 1, events: 4, material_kg: 1 },
    { activity: "Inspection", carbon_kg: 1, carbon_per_event: 0.33, energy_kwh: 1, events: 3, material_kg: 1 },
  ],
  by_resource: [],
  dimensions: { by_order: [], carbon_intensity: { per_case_kg: 2, per_event_kg: 0.4, per_product_family_kg: 2 }, scopes: {} },
  factors: {},
  summary: { total_carbon_kg: 2, total_energy_kwh: 1, total_material_kg: 1 },
} satisfies CarbonSummary;

describe("ProcessFlow", () => {
  it("renders process nodes with carbon data", () => {
    render(<ProcessFlow carbon={carbon} minCount={1} onSelect={vi.fn()} process={process} />);
    expect(screen.getByText("流程控制图")).toBeTruthy();
    expect(screen.getByText("Cutting")).toBeTruthy();
    expect(screen.getByText("2.0 kg CO2e")).toBeTruthy();
  });
});
