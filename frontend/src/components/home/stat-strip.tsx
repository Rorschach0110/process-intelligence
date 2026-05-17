export type HomeStat = {
  label: string;
  value: string;
  detail: string;
};

export function StatStrip({ stats }: { stats: HomeStat[] }) {
  return (
    <section className="grid overflow-hidden rounded-xl border border-white/80 bg-white/70 shadow-[0_22px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div className="border-b border-[#e8e8ed] p-5 sm:border-r xl:border-b-0" key={stat.label}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#86868b]">{stat.label}</p>
          <strong className="mt-3 block text-3xl font-semibold tracking-tight text-[#1d1d1f]">{stat.value}</strong>
          <p className="mt-2 text-sm text-[#6e6e73]">{stat.detail}</p>
        </div>
      ))}
    </section>
  );
}
