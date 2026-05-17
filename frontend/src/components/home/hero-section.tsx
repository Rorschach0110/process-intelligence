import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[520px] overflow-hidden rounded-2xl bg-[#1d1d1f] shadow-[0_30px_120px_rgba(0,0,0,0.22)]">
      <div className="absolute inset-0 bg-[url('/images/process-intelligence-hero.png')] bg-cover bg-center opacity-95" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.54)_38%,rgba(0,0,0,0.08)_100%)]" />
      <div className="relative flex min-h-[520px] max-w-3xl flex-col justify-between p-7 text-white sm:p-10">
        <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-white/12 px-3 py-2 text-sm text-white/80 backdrop-blur-xl">
          <Leaf size={16} />
          Carbon-aware process cockpit
        </div>
        <div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            让流程、碳排与优化决策在同一张工作台上流动。
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">
            从事件日志到知识图谱，从碳排核算到改善建议，当前样本已形成一条可追溯的低碳优化闭环。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 font-medium text-[#1d1d1f]" href="/quantification">
              启动新分析
              <ArrowRight size={17} />
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-lg bg-white/12 px-4 py-3 font-medium text-white backdrop-blur-xl" href="/graph-workbench">
              查看图谱
              <Sparkles size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
