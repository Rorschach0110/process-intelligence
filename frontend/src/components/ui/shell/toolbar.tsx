import type { ReactNode } from "react";

type ToolbarProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function Toolbar({ title, description, actions, children }: ToolbarProps) {
  return (
    <section className="border-b border-slate-200 bg-white px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-4 flex flex-wrap items-center gap-3">{children}</div> : null}
    </section>
  );
}
