"use client";

import { Check, FileText, FlaskConical, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/forms/button";
import { pct } from "@/lib/formatters/number";
import type { Recommendation } from "@/types/api";

type RecommendationCardProps = {
  item: Recommendation;
  active: boolean;
  localStatus?: string;
  onSelect: () => void;
  onStatus: (status: string) => void;
};

export function RecommendationCard({ active, item, localStatus, onSelect, onStatus }: RecommendationCardProps) {
  const status = localStatus || item.status;
  return (
    <article className={`rounded-lg border bg-white p-4 ${active ? "border-blue-400" : "border-slate-200"}`}>
      <button className="w-full text-left" onClick={onSelect} type="button">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{status}</span>
        </div>
        <p className="mt-3 text-sm text-slate-600">综合评分 {pct(item.confidence)} · 风险 {Object.values(item.risk).join("/")}</p>
      </button>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => onStatus("accepted")}><Check size={15} />采纳</Button>
        <Button onClick={() => onStatus("rejected")}><X size={15} />拒绝</Button>
        <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700" href="/simulation"><FlaskConical size={15} />转仿真</Link>
        <Link className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-medium text-white" href="/reports"><FileText size={15} />报告</Link>
      </div>
    </article>
  );
}
