"use client";

import { useMemo } from "react";
import type { CarbonSummary, ProcessSummary } from "@/types/api";
import { buildFlowLayout, FLOW_NODE_H, FLOW_NODE_W, type FlowNode } from "./process-flow-layout";

type ProcessFlowProps = {
  carbon: CarbonSummary;
  minCount: number;
  onSelect: (activity: string) => void;
  process: ProcessSummary;
  selected?: string;
};

const anchorTones = [
  "bg-[#5756af] text-white shadow-[0_22px_48px_rgba(87,86,175,0.24)]",
  "bg-[#6260c2] text-white shadow-[0_18px_38px_rgba(98,96,194,0.2)]",
];
const branchTones = [
  "bg-[#74a8d3] text-[#0f2f48] shadow-[0_16px_30px_rgba(116,168,211,0.2)]",
  "bg-[#a9d0e5] text-[#12344d] shadow-[0_12px_24px_rgba(116,168,211,0.16)]",
];

export function ProcessFlow({ carbon, minCount, onSelect, process, selected }: ProcessFlowProps) {
  const layout = useMemo(() => buildFlowLayout(process, carbon, minCount), [process, carbon, minCount]);
  const nodesByName = useMemo(() => new Map(layout.nodes.map((node) => [node.name, node])), [layout.nodes]);
  const edges = useMemo(
    () =>
      layout.edges
        .filter((edge) => nodesByName.has(edge.source) && nodesByName.has(edge.target))
        .sort((left, right) => (left.emphasis === right.emphasis ? right.count - left.count : left.emphasis === "secondary" ? -1 : 1)),
    [layout.edges, nodesByName],
  );

  if (!layout.nodes.length) {
    return <div className="rounded-xl border border-[#dfe5ec] bg-white/80 p-8 text-center text-sm text-[#6e6e73]">当前阈值下没有可展示的流程活动。</div>;
  }

  return (
    <div className="overflow-auto rounded-xl border border-[#dfe5ec] bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7f9fb_56%,#eef3f7_100%)] p-6">
      <div className="min-w-[1040px]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1d1d1f]">流程控制图</h2>
            <p className="mt-1 text-sm text-[#6e6e73]">主链路居中展示，旁路与回流围绕主干展开，并用动态箭头指向下一步骤。</p>
          </div>
          <div className="text-right text-xs text-[#6e6e73]">
            <p>活动 {layout.nodes.length}</p>
            <p>关系 {layout.edges.length}</p>
          </div>
        </div>
        <div className="relative" style={{ height: layout.height, width: layout.width }}>
          <svg className="absolute inset-0" height={layout.height} width={layout.width}>
            <defs>
              <marker id="flow-arrow-primary" markerHeight="8" markerWidth="8" orient="auto" refX="6.5" refY="3.5">
                <path d="M0,0 L7,3.5 L0,7 z" fill="#5e5bcc" />
              </marker>
              <marker id="flow-arrow-secondary" markerHeight="8" markerWidth="8" orient="auto" refX="6.5" refY="3.5">
                <path d="M0,0 L7,3.5 L0,7 z" fill="#6aa6d6" />
              </marker>
            </defs>
            {edges.map((edge) => {
              const source = nodesByName.get(edge.source) as FlowNode;
              const target = nodesByName.get(edge.target) as FlowNode;
              const line = edgeGeometry(source, target, layout.width);
              const labelWidth = `${edge.count}`.length * 7 + 16;
              return (
                <g key={`${edge.source}-${edge.target}`}>
                  <path d={line.d} fill="none" stroke={edge.emphasis === "primary" ? "#7c7f8a" : "#9aa7b8"} strokeOpacity="0.55" strokeWidth={edge.emphasis === "primary" ? 2.8 : 1.9} />
                  <path
                    d={line.d}
                    fill="none"
                    markerEnd={`url(#flow-arrow-${edge.emphasis === "primary" ? "primary" : "secondary"})`}
                    stroke={edge.emphasis === "primary" ? "#5e5bcc" : "#6aa6d6"}
                    strokeDasharray={edge.emphasis === "primary" ? "18 10" : "12 14"}
                    strokeLinecap="round"
                    strokeWidth={edge.emphasis === "primary" ? 2.2 : 1.7}
                  >
                    <animate attributeName="stroke-dashoffset" dur={edge.emphasis === "primary" ? "2.2s" : "3s"} from="64" repeatCount="indefinite" to="0" />
                  </path>
                  <g className="pointer-events-none" transform={`translate(${line.labelX} ${line.labelY})`}>
                    <rect fill="white" fillOpacity="0.94" height="20" rx="10" stroke="#dbe3ec" width={labelWidth} x={-labelWidth / 2} y="-10" />
                    <text dy="0.35em" fill="#375fbe" fontSize="11" textAnchor="middle">{edge.count}</text>
                  </g>
                </g>
              );
            })}
          </svg>
          {layout.nodes.map((node) => (
            <button
              className={`absolute rounded-[22px] border border-white/85 px-5 py-4 text-center transition hover:-translate-y-0.5 ${
                selected === node.name ? "ring-2 ring-[#2563eb] ring-offset-2" : ""
              } ${node.role === "anchor" ? anchorTones[Math.min(node.depth, anchorTones.length - 1)] : branchTones[Math.min(node.depth, branchTones.length - 1)]}`}
              key={node.name}
              onClick={() => onSelect(node.name)}
              style={{ height: FLOW_NODE_H, left: node.x, top: node.y, width: FLOW_NODE_W }}
              type="button"
            >
              <div className="text-[15px] font-semibold">{node.name}</div>
              <div className="mt-1 text-sm opacity-90">{node.count}</div>
              <div className="mt-2 text-xs opacity-80">{node.carbonKg.toFixed(1)} kg CO2e</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function edgeGeometry(source: FlowNode, target: FlowNode, width: number) {
  const downward = target.y >= source.y;
  const startX = source.x + FLOW_NODE_W / 2;
  const endX = target.x + FLOW_NODE_W / 2;
  const startY = downward ? source.y + FLOW_NODE_H : source.y;
  const endY = downward ? target.y : target.y + FLOW_NODE_H;

  if (!downward) {
    const side = startX >= width / 2 ? 1 : -1;
    const bend = Math.max(120, Math.abs(endX - startX) * 0.45 + 70);
    return {
      d: `M ${startX} ${startY} C ${startX + side * bend} ${startY - 34} ${endX + side * bend} ${endY + 34} ${endX} ${endY}`,
      labelX: (startX + endX) / 2 + side * bend * 0.58,
      labelY: (startY + endY) / 2 + 4,
    };
  }

  const pull = Math.max(46, Math.abs(endY - startY) * 0.38);
  const shift = Math.sign(endX - startX) * Math.min(78, Math.abs(endX - startX) * 0.24);
  return {
    d: `M ${startX} ${startY} C ${startX + shift} ${startY + pull} ${endX - shift} ${endY - pull} ${endX} ${endY}`,
    labelX: (startX + endX) / 2 + (endX === startX ? 18 : 0),
    labelY: (startY + endY) / 2 - 10,
  };
}
