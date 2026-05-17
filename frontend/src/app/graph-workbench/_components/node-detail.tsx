import { DrawerShell } from "@/components/ui/shell/drawer-shell";
import type { GraphPayload } from "@/types/api";

type NodeDetailProps = {
  edges: GraphPayload["edges"];
  node?: GraphPayload["nodes"][number];
};

export function NodeDetail({ edges, node }: NodeDetailProps) {
  if (!node) {
    return (
      <DrawerShell title="节点详情">
        <p className="text-sm text-slate-500">请选择一个图谱节点，右侧会显示它的属性和上下游关系。</p>
      </DrawerShell>
    );
  }

  const related = edges.filter((edge) => edge.source === node.id || edge.target === node.id);
  return (
    <DrawerShell title={node.label}>
      <div className="grid gap-4 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">类型</p>
          <strong>{node.kind}</strong>
        </div>
        <section>
          <h3 className="mb-2 font-semibold">属性</h3>
          {Object.entries(node.properties || {}).map(([key, value]) => (
            <p className="flex justify-between gap-4 border-b border-slate-100 py-1" key={key}>
              <span className="text-slate-500">{key}</span>
              <strong className="text-right">{String(value)}</strong>
            </p>
          ))}
          {!Object.keys(node.properties || {}).length ? <p className="text-slate-500">暂无附加属性。</p> : null}
        </section>
        <section>
          <h3 className="mb-2 font-semibold">关联关系</h3>
          {related.map((edge, index) => (
            <p className="rounded-lg bg-slate-50 p-2" key={`${edge.source}-${edge.target}-${index}`}>
              {edge.source} {"->"} {edge.relation} {"->"} {edge.target}
            </p>
          ))}
          {!related.length ? <p className="text-slate-500">当前节点没有可展示的关联关系。</p> : null}
        </section>
      </div>
    </DrawerShell>
  );
}
