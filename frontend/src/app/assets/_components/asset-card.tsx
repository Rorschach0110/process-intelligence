import { Cpu, Factory, Wrench } from "lucide-react";
import type { GraphPayload } from "@/types/api";

type AssetCardProps = {
  asset: GraphPayload["nodes"][number];
  active: boolean;
  onSelect: () => void;
};

export function AssetCard({ active, asset, onSelect }: AssetCardProps) {
  const Icon = asset.kind === "device" ? Cpu : asset.kind === "resource" ? Wrench : Factory;
  return (
    <button className={`rounded-lg border bg-white p-4 text-left ${active ? "border-blue-400" : "border-slate-200"}`} onClick={onSelect} type="button">
      <div className="flex items-center gap-3">
        <span className="rounded-md bg-teal-50 p-2 text-teal-700"><Icon size={18} /></span>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{asset.label}</h3>
          <p className="mt-1 text-xs text-slate-500">{asset.kind} · {asset.id}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{JSON.stringify(asset.properties || {}).slice(0, 120)}</p>
    </button>
  );
}
