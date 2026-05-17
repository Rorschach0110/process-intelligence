import { DrawerShell } from "@/components/ui/shell/drawer-shell";
import { kg } from "@/lib/formatters/number";
import type { CarbonSummary, GraphPayload, Recommendation } from "@/types/api";

type Asset = GraphPayload["nodes"][number];

export function AssetDetail({ asset, carbon, graph, recommendations }: { asset?: Asset; carbon: CarbonSummary; graph: GraphPayload; recommendations: Recommendation[] }) {
  if (!asset) return <DrawerShell title="资产详情"><p className="text-sm text-slate-500">请选择资产。</p></DrawerShell>;
  const relatedEdges = graph.edges.filter((edge) => edge.source === asset.id || edge.target === asset.id);
  const carbonRows = carbon.by_resource.filter((row) => asset.label.includes(row.resource) || row.resource.includes(asset.label));
  return (
    <DrawerShell title={asset.label}>
      <div className="grid gap-4 text-sm">
        <section className="grid grid-cols-2 gap-2">
          <Stat label="类型" value={asset.kind} />
          <Stat label="关联关系" value={relatedEdges.length} />
          <Stat label="碳排" value={kg(carbonRows[0]?.carbon_kg)} />
          <Stat label="建议" value={recommendations.length} />
        </section>
        <section>
          <h3 className="mb-2 font-semibold">图谱关系</h3>
          {relatedEdges.map((edge, index) => <p className="mb-2 rounded bg-slate-50 p-2" key={`${edge.source}-${edge.target}-${index}`}>{edge.source} · {edge.relation} · {edge.target}</p>)}
        </section>
        <section className="rounded-md border border-dashed border-slate-300 p-4">
          <h3 className="font-semibold">3D 模型预留</h3>
          <p className="mt-2 text-slate-500">后续可接入 GLB/GLTF 上传、节点聚焦、隔离显示和模型属性映射。</p>
        </section>
      </div>
    </DrawerShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><strong>{value}</strong></div>;
}
