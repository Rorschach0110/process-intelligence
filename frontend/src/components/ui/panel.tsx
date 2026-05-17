import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function Panel({ title, action, children }: PanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
