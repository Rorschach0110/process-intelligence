import { apiGet } from "@/lib/api/client";
import type { GraphPayload } from "@/types/api";

export const graphClient = {
  exportJson: () => apiGet<{ format: string; content: GraphPayload }>("/api/graph/export"),
  query: (params: URLSearchParams) => apiGet<GraphPayload>(`/api/graph/query?${params.toString()}`),
  subgraph: (nodeId: string) => apiGet<GraphPayload>(`/api/graph/subgraph?node_id=${encodeURIComponent(nodeId)}`),
  neo4jPlan: () => apiGet<{ adapter: string; mode: string; node_count: number; edge_count: number; cypher: string }>("/api/graph/neo4j-plan"),
};
