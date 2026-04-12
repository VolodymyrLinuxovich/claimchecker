type Props = {
  high_risk_count: number;
  missing_support_count: number;
  draft_email_ready: boolean;
};

export default function StickyReviewSummary({
  high_risk_count,
  missing_support_count,
  draft_email_ready,
}: Props) {
  return (
    <div
      className="z-20 mb-6 rounded-lg border border-white/[0.07] bg-zinc-950/85 px-4 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.2)] backdrop-blur-md max-lg:static lg:sticky lg:top-0"
      aria-label="Review snapshot metrics"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        Review snapshot
      </p>
      <div className="mt-2 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-1">
        <div className="flex items-baseline gap-2">
          <span className="tabular-nums text-lg font-semibold leading-none text-zinc-100 sm:text-base">
            {high_risk_count}
          </span>
          <span className="text-[11px] leading-snug text-zinc-500">
            High-risk issues found
          </span>
        </div>
        <span
          className="hidden h-3 w-px shrink-0 bg-white/[0.08] sm:block"
          aria-hidden
        />
        <div className="flex items-baseline gap-2">
          <span className="tabular-nums text-lg font-semibold leading-none text-zinc-100 sm:text-base">
            {missing_support_count}
          </span>
          <span className="text-[11px] leading-snug text-zinc-500">
            Missing support points
          </span>
        </div>
        <span
          className="hidden h-3 w-px shrink-0 bg-white/[0.08] sm:block"
          aria-hidden
        />
        <span
          className={`text-[11px] font-medium ${
            draft_email_ready ? "text-zinc-300" : "text-zinc-500"
          }`}
        >
          {draft_email_ready ? "Draft email ready" : "Draft email pending"}
        </span>
      </div>
    </div>
  );
}
