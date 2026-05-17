import type { ReactNode } from "react";

type DrawerShellProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function DrawerShell({ title, children, footer }: DrawerShellProps) {
  return (
    <aside className="flex h-full min-h-96 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
      {footer ? <div className="border-t border-slate-200 p-4">{footer}</div> : null}
    </aside>
  );
}
