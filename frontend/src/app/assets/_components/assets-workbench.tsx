"use client";

import { useMemo, useState } from "react";
import { SearchBox } from "@/components/ui/forms/search-box";
import { Toolbar } from "@/components/ui/shell/toolbar";
import type { CarbonSummary, GraphPayload, Recommendation } from "@/types/api";
import { AssetCard } from "./asset-card";
import { AssetDetail } from "./asset-detail";

export function AssetsWorkbench({ carbon, graph, recommendations }: { carbon: CarbonSummary; graph: GraphPayload; recommendations: Recommendation[] }) {
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const assets = useMemo(() => graph.nodes.filter((node) => ["device", "resource", "process"].includes(node.kind)), [graph.nodes]);
  const visible = assets.filter((asset) => (kind === "all" || asset.kind === kind) && JSON.stringify(asset).toLowerCase().includes(query.toLowerCase()));
  const [selectedId, setSelectedId] = useState(visible[0]?.id);
  const selected = visible.find((asset) => asset.id === selectedId) || visible[0];
  return (
    <div className="grid gap-5">
      <Toolbar description="从图谱中抽取工厂、资源和设备台账，预留 3D 资产模型接入。" title="资产中心">
        <SearchBox onChange={setQuery} placeholder="搜索资产、设备、资源" value={query} />
        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" onChange={(event) => setKind(event.target.value)} value={kind}>
          <option value="all">全部</option>
          <option value="process">工厂</option>
          <option value="process">车间/产线</option>
          <option value="resource">资源</option>
          <option value="device">设备</option>
        </select>
      </Toolbar>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((asset) => <AssetCard active={asset.id === selected?.id} asset={asset} key={asset.id} onSelect={() => setSelectedId(asset.id)} />)}
        </section>
        <AssetDetail asset={selected} carbon={carbon} graph={graph} recommendations={recommendations} />
      </div>
    </div>
  );
}
