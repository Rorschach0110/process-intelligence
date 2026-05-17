"use client";

import { Archive, BarChart3, Database, Factory, FileText, Gauge } from "lucide-react";

const categories = [
  { key: "all", label: "全部", icon: Database },
  { key: "event-log", label: "事件日志", icon: FileText },
  { key: "quantification", label: "量化结果", icon: BarChart3 },
  { key: "report", label: "报告", icon: Archive },
  { key: "factor", label: "因子来源", icon: Gauge },
  { key: "asset", label: "设备资料", icon: Factory },
];

type CategorySidebarProps = {
  selected: string;
  onSelect: (key: string) => void;
};

export function CategorySidebar({ selected, onSelect }: CategorySidebarProps) {
  return (
    <aside className="w-full border-r border-slate-200 bg-white p-3 lg:w-56">
      <p className="mb-3 px-2 text-xs font-semibold uppercase text-slate-500">知识分类</p>
      <div className="grid gap-1">
        {categories.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${selected === item.key ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
              key={item.key}
              onClick={() => onSelect(item.key)}
              type="button"
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
