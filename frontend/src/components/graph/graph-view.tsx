"use client";

import cytoscape, { type Core } from "cytoscape";
import { useEffect, useRef } from "react";

type Graph = {
  edges: { relation: string; source: string; target: string }[];
  nodes: { id: string; kind: string; label: string; properties?: Record<string, unknown> }[];
};

type GraphViewProps = {
  graph: Graph;
  onSelect?: (nodeId: string) => void;
  selectedId?: string;
};

export function GraphView({ graph, onSelect, selectedId }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current) return;
    const cy = cytoscape({
      container: containerRef.current,
      hideEdgesOnViewport: true,
      pixelRatio: 1,
      style: [
        { selector: "node", style: { label: "data(label)", "background-color": "data(color)", color: "#0f172a", "font-size": 10, "text-margin-y": "7px", "text-max-width": "92px", "text-valign": "bottom", "text-wrap": "wrap" } },
        { selector: "node:selected", style: { "background-color": "#2563eb", "border-color": "#bfdbfe", "border-width": 4 } },
        { selector: "edge", style: { width: 1.8, "curve-style": "bezier", "line-color": "#7aa9df", opacity: 0.75, "target-arrow-color": "#7aa9df", "target-arrow-shape": "triangle" } },
      ] as never,
      textureOnViewport: true,
    });
    cy.on("tap", "node", (event) => onSelectRef.current?.(event.target.id()));
    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().remove();
    cy.add([
      ...graph.nodes.map((node) => ({ data: { ...node, color: colorForKind(node.kind) } })),
      ...graph.edges.map((edge, index) => ({ data: { id: `e${index}`, ...edge } })),
    ]);
    cy.layout(graph.nodes.length > 52 ? { animate: false, concentric: (node) => rankForKind(String(node.data("kind"))), fit: true, levelWidth: () => 1, minNodeSpacing: 22, name: "concentric", padding: 28, spacingFactor: 1.08 } : { animate: false, edgeElasticity: 90, fit: true, idealEdgeLength: 96, name: "cose", nodeRepulsion: 90000, padding: 32 }).run();
    cy.ready(() => cy.fit(undefined, 28));
  }, [graph]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().unselect();
    if (selectedId) cy.getElementById(selectedId).select();
  }, [selectedId]);

  return <div className="h-[520px] rounded-xl border border-slate-200 bg-white" ref={containerRef} />;
}

function colorForKind(kind: string): string {
  const value = kind.toLowerCase();
  if (includes(value, ["activity", "process", "step", "operation"])) return "#5b67d8";
  if (includes(value, ["resource", "worker", "operator", "team"])) return "#6ea9d6";
  if (includes(value, ["carbon", "metric", "emission", "kpi", "score"])) return "#8bc2ae";
  if (includes(value, ["bottleneck", "risk", "deviation"])) return "#f59e0b";
  return "#9ca3af";
}

function rankForKind(kind: string): number {
  const value = kind.toLowerCase();
  if (includes(value, ["activity", "process", "step", "operation"])) return 4;
  if (includes(value, ["resource", "worker", "operator", "team"])) return 3;
  if (includes(value, ["carbon", "metric", "emission", "kpi", "score"])) return 2;
  return 1;
}

function includes(value: string, tokens: string[]): boolean {
  return tokens.some((token) => value.includes(token));
}
