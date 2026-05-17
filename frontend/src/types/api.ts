export type MetricSummary = {
  label: string;
  value: string;
  detail: string;
};

export type Dataset = {
  id: number;
  name: string;
  file_path: string;
  field_count: number;
  row_count: number;
  created_at: string;
};

export type DatasetDetail = {
  dataset: Dataset;
  profile: {
    mapping: Record<string, string>;
    quality: Record<string, unknown>;
  } | null;
};

export type DatasetPreview = {
  page: number;
  page_size: number;
  preview: Record<string, string>[];
  fields: string[];
  total_rows: number;
};

export type FieldMapping = {
  case_id: string;
  activity: string;
  timestamp: string;
  resource: string;
  energy_kwh: string;
  material_kg: string;
  device: string;
};

export type RunSummary = {
  run_id: string;
  created_at: string;
  events: number;
  cases: number;
  total_carbon_kg: number;
  estimated_saving_kg: number;
};

export type Health = {
  app?: string;
  status: string;
  runtime: string;
  database: boolean;
  uploads_dir: boolean;
  runs_dir: boolean;
  reports_dir: boolean;
};

export type CarbonFactor = {
  id: number;
  name: string;
  factor_type: string;
  unit: string;
  value: number;
  source?: string;
  scope: string;
  version: string;
  is_active?: number | boolean;
  created_at?: string;
};

export type Recommendation = {
  id: number;
  run_id?: string;
  title: string;
  status: string;
  confidence: number;
  risk: Record<string, string>;
  evidence: Record<string, unknown>;
  created_at?: string;
};

export type GraphPayload = {
  nodes: { id: string; label: string; kind: string; properties?: Record<string, unknown> }[];
  edges: { source: string; target: string; relation: string; properties?: Record<string, unknown> }[];
  schema?: { node_types: string[]; relation_types: string[] };
};

export type ProcessSummary = {
  events: number;
  cases: number;
  avg_case_duration_min: number;
  health_score: { score: number; grade: string };
  activities: { name: string; count: number }[];
  edges: { source: string; target: string; count: number }[];
  bottlenecks: { activity: string; avg_duration_min: number; total_duration_min: number; samples: number }[];
  resource_load: { resource: string; events: number; share: number }[];
  rework_paths: { case_id: string; activity: string; path: string }[];
  compliance_deviations: { case_id: string; path: string }[];
  variant_details: { id: number; path: string[]; share: number }[];
};

export type CarbonSummary = {
  summary: { total_energy_kwh: number; total_material_kg: number; total_carbon_kg: number };
  by_activity: { activity: string; events: number; energy_kwh: number; material_kg: number; carbon_kg: number; carbon_per_event: number }[];
  by_resource: { resource: string; events: number; energy_kwh: number; material_kg: number; carbon_kg: number; carbon_per_event: number }[];
  dimensions: {
    by_order: { order: string; carbon_kg: number }[];
    carbon_intensity: { per_case_kg: number; per_event_kg: number; per_product_family_kg: number };
    scopes: Record<string, string>;
  };
  factors: Record<string, number>;
};

export type Scenario = {
  id: number;
  name: string;
  run_id: string;
  score: number;
  parameters: Record<string, unknown>;
  results: Record<string, number>;
  created_at: string;
};

export type Report = {
  id: number;
  report_type: string;
  run_id: string;
  title: string;
  content_html: string;
  file_path: string;
  created_at: string;
};
