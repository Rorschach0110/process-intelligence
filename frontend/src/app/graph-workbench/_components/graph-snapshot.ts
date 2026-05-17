import type { GraphPayload } from "@/types/api";

const MAX_NODES = 72;
const MAX_EDGES = 120;

type Category = "bottleneck" | "flow" | "metric" | "noise" | "resource" | "support";

const categoryWeight: Record<Category, number> = {
  bottleneck: 4.2,
  flow: 4.8,
  metric: 3.8,
  noise: 0,
  resource: 3.2,
  support: 2.2,
};

export function buildCompactGraph(graph: GraphPayload): GraphPayload {
  const degree = new Map<string, number>();
  for (const edge of graph.edges) {
    degree.set(edge.source, (degree.get(edge.source) || 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) || 0) + 1);
  }

  const candidates = graph.nodes.filter((node) => classifyKind(node.kind) !== "noise");
  if (!candidates.length) return graph;

  const scores = new Map(
    candidates.map((node) => {
      const carbon = Number(node.properties?.carbon_kg || node.properties?.total_carbon_kg || 0);
      const score = categoryWeight[classifyKind(node.kind)] * 100 + (degree.get(node.id) || 0) * 8 + Math.min(carbon, 120);
      return [node.id, score];
    }),
  );
  const rankedNodes = candidates.slice().sort((left, right) => (scores.get(right.id) || 0) - (scores.get(left.id) || 0));
  const keepIds = new Set(rankedNodes.slice(0, MAX_NODES).map((node) => node.id));
  const rankedEdges = graph.edges
    .filter((edge) => keepIds.has(edge.source) && keepIds.has(edge.target))
    .sort((left, right) => edgeScore(right, scores) - edgeScore(left, scores))
    .slice(0, MAX_EDGES);
  const connectedIds = new Set(rankedEdges.flatMap((edge) => [edge.source, edge.target]));

  for (const node of rankedNodes) {
    if (connectedIds.size >= MAX_NODES) break;
    if (connectedIds.has(node.id) || classifyKind(node.kind) !== "flow") continue;
    connectedIds.add(node.id);
  }

  const nodes = rankedNodes.filter((node) => connectedIds.has(node.id));
  const edges = rankedEdges.filter((edge) => connectedIds.has(edge.source) && connectedIds.has(edge.target));
  return {
    edges,
    nodes,
    schema: {
      node_types: [...new Set(nodes.map((node) => node.kind))].sort(),
      relation_types: [...new Set(edges.map((edge) => edge.relation))].sort(),
    },
  };
}

function classifyKind(kind: string): Category {
  const value = kind.toLowerCase();
  if (matches(value, ["case", "event", "trace", "log", "instance", "order", "material", "product"])) return "noise";
  if (matches(value, ["activity", "process", "step", "operation"])) return "flow";
  if (matches(value, ["resource", "worker", "operator", "team"])) return "resource";
  if (matches(value, ["bottleneck", "risk", "deviation"])) return "bottleneck";
  if (matches(value, ["carbon", "metric", "emission", "kpi", "score"])) return "metric";
  return "support";
}

function edgeScore(edge: GraphPayload["edges"][number], scores: Map<string, number>): number {
  return (scores.get(edge.source) || 0) + (scores.get(edge.target) || 0);
}

function matches(value: string, tokens: string[]): boolean {
  return tokens.some((token) => value.includes(token));
}
