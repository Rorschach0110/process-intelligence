type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <strong className="mt-3 block text-2xl font-semibold text-slate-950">{value}</strong>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </section>
  );
}
