"use client";

import {
  Activity,
  Archive,
  BarChart3,
  ChevronLeft,
  Database,
  FileText,
  GitBranch,
  Home,
  LineChart,
  Network,
  Settings,
  Sparkles,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type NavGroup = {
  items: { href: string; icon: LucideIcon; label: string }[];
  title: string;
};

const groups: NavGroup[] = [
  {
    items: [
      { href: "/", icon: Home, label: "驾驶舱" },
      { href: "/data", icon: Database, label: "数据资产" },
      { href: "/quantification", icon: UploadCloud, label: "快速量化" },
    ],
    title: "总览",
  },
  {
    items: [
      { href: "/process-map", icon: GitBranch, label: "流程地图" },
      { href: "/carbon", icon: BarChart3, label: "碳因子" },
      { href: "/graph-workbench", icon: Network, label: "知识图谱" },
    ],
    title: "洞察",
  },
  {
    items: [
      { href: "/optimization", icon: Sparkles, label: "优化建议" },
      { href: "/simulation", icon: LineChart, label: "方案仿真" },
      { href: "/reports", icon: FileText, label: "报告中心" },
    ],
    title: "决策",
  },
  {
    items: [
      { href: "/assets", icon: Archive, label: "资产中心" },
      { href: "/ops", icon: Settings, label: "系统运维" },
    ],
    title: "运营",
  },
];

export function Navigation() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav className={`hidden shrink-0 flex-col border-r border-white/70 bg-white/60 py-4 backdrop-blur-2xl transition-[width] duration-300 lg:flex ${collapsed ? "w-[84px] px-2" : "w-[280px] px-3"}`}>
      <div className={`pb-5 ${collapsed ? "px-1" : "px-3"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <span className="grid size-10 place-items-center rounded-xl bg-[#1d1d1f] text-white shadow-sm">
            <Activity size={18} />
          </span>
          {!collapsed ? (
            <div>
              <p className="text-sm font-semibold tracking-tight text-[#1d1d1f]">Process Intelligence</p>
              <p className="text-xs text-[#6e6e73]">Low-carbon operations</p>
            </div>
          ) : null}
        </div>
        <button
          aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
          className={`mt-4 inline-flex h-9 items-center rounded-xl border border-[#d2d2d7] bg-white/80 text-[#424245] transition hover:bg-white ${collapsed ? "w-full justify-center" : "gap-2 px-3"}`}
          onClick={() => setCollapsed((value) => !value)}
          type="button"
        >
          <ChevronLeft className={`transition ${collapsed ? "rotate-180" : ""}`} size={16} />
          {!collapsed ? <span className="text-sm font-medium">收起侧栏</span> : null}
        </button>
      </div>
      <div className="grid gap-5">
        {groups.map((group) => (
          <section key={group.title}>
            {!collapsed ? <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86868b]">{group.title}</p> : null}
            <div className="grid gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    aria-label={item.label}
                    className={`group flex rounded-xl text-sm font-medium text-[#424245] transition hover:bg-white hover:text-[#1d1d1f] hover:shadow-sm ${collapsed ? "justify-center px-2 py-3" : "items-center gap-3 px-3 py-2.5"}`}
                    href={item.href}
                    key={item.href}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="shrink-0 text-[#86868b] transition group-hover:text-[#1d1d1f]" size={18} />
                    {!collapsed ? <span>{item.label}</span> : null}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <div className={`mt-auto pt-5 ${collapsed ? "px-1" : "px-3"}`}>
        <div className={`border-t border-[#d2d2d7] pt-4 text-xs leading-5 text-[#6e6e73] ${collapsed ? "text-center" : ""}`}>
          <p className="font-medium text-[#1d1d1f]">{collapsed ? "PI" : "Demo workspace"}</p>
          {!collapsed ? <p>FastAPI + Next.js live cockpit</p> : null}
        </div>
      </div>
    </nav>
  );
}
