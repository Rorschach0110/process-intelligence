import type { CarbonSummary, ProcessSummary } from '@/types/api';

export const FLOW_NODE_W = 236;
export const FLOW_NODE_H = 88;

const FLOW_WIDTH = 1040;
const FLOW_TOP = 24;
const FLOW_ROW_GAP = 136;
const FLOW_CENTER_LEFT = FLOW_WIDTH / 2 - FLOW_NODE_W / 2;
const FLOW_SIDE_OFFSET = FLOW_NODE_W + 132;

type BaseNode = {
  carbonKg: number;
  count: number;
  incoming: number;
  name: string;
  outgoing: number;
};

export type FlowNode = BaseNode & {
  depth: number;
  lane: -1 | 0 | 1;
  role: 'anchor' | 'branch';
  x: number;
  y: number;
};

export type FlowEdge = {
  count: number;
  emphasis: 'primary' | 'secondary';
  source: string;
  target: string;
};

export type FlowLayout = {
  edges: FlowEdge[];
  height: number;
  nodes: FlowNode[];
  width: number;
};

export function buildFlowLayout(process: ProcessSummary, carbon: CarbonSummary, minCount: number): FlowLayout {
  const activities = process.activities.filter((item) => item.count >= minCount);
  const names = new Set(activities.map((item) => item.name));
  const edges = process.edges.filter((edge) => names.has(edge.source) && names.has(edge.target));
  const carbonByActivity = new Map(carbon.by_activity.map((item) => [item.activity, item.carbon_kg]));
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();

  for (const edge of edges) {
    incoming.set(edge.target, (incoming.get(edge.target) || 0) + edge.count);
    outgoing.set(edge.source, (outgoing.get(edge.source) || 0) + edge.count);
  }

  const nodesByName = new Map(
    activities.map((item) => [
      item.name,
      {
        carbonKg: carbonByActivity.get(item.name) || 0,
        count: item.count,
        incoming: incoming.get(item.name) || 0,
        name: item.name,
        outgoing: outgoing.get(item.name) || 0,
      },
    ]),
  );
  const anchors = buildAnchorOrder(process, activities, edges, incoming);
  const anchorSet = new Set(anchors);
  const branches = activities
    .filter((item) => !anchorSet.has(item.name))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));

  const nodes: FlowNode[] = [];
  const rows: FlowNode[][] = [];
  const used = new Set<string>();

  anchors.forEach((name, depth) => {
    const base = nodesByName.get(name);
    if (!base || used.has(name)) return;
    const anchor = placeNode(base, 0, rows.length, depth, 'anchor');
    rows.push([anchor]);
    nodes.push(anchor);
    used.add(name);

    const related = branches.filter((item) => !used.has(item.name) && touches(name, item.name, edges));
    for (const pair of chunk(related, 2)) {
      const row = pair.map((item, index) => {
        used.add(item.name);
        return placeNode(nodesByName.get(item.name) as BaseNode, index === 0 ? -1 : 1, rows.length, depth + 1, 'branch');
      });
      rows.push(row);
      nodes.push(...row);
    }
  });

  for (const pair of chunk(branches.filter((item) => !used.has(item.name)), 2)) {
    const row = pair.map((item, index) =>
      placeNode(nodesByName.get(item.name) as BaseNode, index === 0 ? -1 : 1, rows.length, anchors.length, 'branch'),
    );
    rows.push(row);
    nodes.push(...row);
  }

  const mainPath = new Set(anchors.slice(0, -1).map((item, index) => `${item}::${anchors[index + 1]}`));
  const layoutEdges = edges
    .map((edge) => ({
      count: edge.count,
      emphasis: (mainPath.has(`${edge.source}::${edge.target}`) ? 'primary' : 'secondary') as FlowEdge['emphasis'],
      source: edge.source,
      target: edge.target,
    }))
    .sort((left, right) => right.count - left.count);
  const height = Math.max(420, FLOW_TOP + rows.length * FLOW_ROW_GAP + FLOW_NODE_H + 24);

  return { edges: layoutEdges, height, nodes, width: FLOW_WIDTH };
}

function placeNode(base: BaseNode, lane: -1 | 0 | 1, row: number, depth: number, role: 'anchor' | 'branch'): FlowNode {
  return {
    ...base,
    depth,
    lane,
    role,
    x: FLOW_CENTER_LEFT + lane * FLOW_SIDE_OFFSET,
    y: FLOW_TOP + row * FLOW_ROW_GAP,
  };
}

function buildAnchorOrder(
  process: ProcessSummary,
  activities: ProcessSummary['activities'],
  edges: ProcessSummary['edges'],
  incoming: Map<string, number>,
): string[] {
  const variant = process.variant_details
    .slice()
    .sort((left, right) => right.share - left.share)[0]
    ?.path.filter((name) => activities.some((item) => item.name === name));
  if (variant?.length) return [...new Set(variant)];
  if (!activities.length) return [];

  const remaining = new Set(activities.map((item) => item.name));
  const ordered: string[] = [];
  let current =
    activities
      .slice()
      .sort((left, right) => (incoming.get(left.name) || 0) - (incoming.get(right.name) || 0) || right.count - left.count)[0]
      ?.name || activities[0].name;

  while (current && remaining.has(current)) {
    ordered.push(current);
    remaining.delete(current);
    const next = edges
      .filter((edge) => edge.source === current && remaining.has(edge.target))
      .sort((left, right) => right.count - left.count)[0]?.target;
    current = next || [...remaining][0];
  }
  return ordered;
}

function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

function touches(source: string, target: string, edges: ProcessSummary['edges']): boolean {
  return edges.some((edge) => (edge.source === source && edge.target === target) || (edge.source === target && edge.target === source));
}
