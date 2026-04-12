type Phase = "input" | "reviewing" | "complete";

const STEPS = [
  { id: "analyze", label: "Analyze draft" },
  { id: "risks", label: "Surface risks" },
  { id: "questions", label: "Generate questions" },
  { id: "email", label: "Draft email to counsel" },
] as const;

type Props = {
  phase: Phase;
};

function stepVisual(phase: Phase, index: number) {
  if (phase === "complete") {
    return { done: true, current: false };
  }
  if (phase === "reviewing") {
    if (index === 0) return { done: true, current: false };
    if (index === 1) return { done: false, current: true };
    return { done: false, current: false };
  }
  if (index === 0) return { done: false, current: true };
  return { done: false, current: false };
}

export default function WorkflowStepper({ phase }: Props) {
  return (
    <div
      className="rounded-xl border border-white/[0.06] bg-zinc-900/25 px-4 py-4 sm:px-5"
      aria-label="Patent review workflow"
    >
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
        Workflow
      </p>
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:gap-2">
        {STEPS.map((step, i) => {
          const { done, current } = stepVisual(phase, i);
          return (
            <li
              key={step.id}
              className={`rounded-lg border px-3 py-2.5 sm:min-h-[4.75rem] ${
                current
                  ? "border-teal-600/30 bg-teal-950/25"
                  : done
                    ? "border-white/[0.06] bg-white/[0.02]"
                    : "border-white/[0.05] bg-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 sm:flex-col sm:items-start sm:gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold tabular-nums ${
                    done
                      ? "border-teal-600/35 bg-teal-950/40 text-teal-200/90"
                      : current
                        ? "border-teal-500/40 bg-teal-950/30 text-teal-100"
                        : "border-white/[0.08] bg-white/[0.02] text-zinc-500"
                  }`}
                  aria-current={current ? "step" : undefined}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={`text-[11px] font-medium leading-snug ${
                    done || current ? "text-zinc-200" : "text-zinc-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      {phase === "reviewing" ? (
        <p className="mt-4 border-t border-white/[0.05] pt-3 text-[11px] leading-relaxed text-zinc-500">
          Review pipeline running — output will appear in the work product
          column.
        </p>
      ) : null}
    </div>
  );
}
