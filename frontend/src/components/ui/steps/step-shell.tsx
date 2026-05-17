type Step = { title: string; description: string };

type StepShellProps = {
  steps: Step[];
  current: number;
};

export function StepShell({ steps, current }: StepShellProps) {
  return (
    <ol className="grid gap-2 md:grid-cols-4">
      {steps.map((step, index) => (
        <li className={`rounded-md border p-3 ${index === current ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`} key={step.title}>
          <span className="text-xs font-semibold text-slate-500">Step {index + 1}</span>
          <strong className="mt-1 block text-sm text-slate-950">{step.title}</strong>
          <p className="mt-1 text-xs text-slate-500">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
