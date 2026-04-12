"use client";

import { useState } from "react";
import { ui } from "@/lib/ui-styles";
import type { ReviewResult } from "@/lib/schema";

type Props = {
  data: ReviewResult;
  jurisdiction: "US" | "EU";
};

const card = `${ui.card} ${ui.cardPadding}`;

export default function HandoffPanel({ data, jurisdiction }: Props) {
  const [sent, setSent] = useState(false);
  const [exported, setExported] = useState(false);

  function exportReview() {
    const payload = {
      exportedAt: new Date().toISOString(),
      jurisdiction,
      review: data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claimcheck-review-${jurisdiction}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }

  function sendToCounsel() {
    const subject = encodeURIComponent(
      "Patent draft review — ClaimCheck summary"
    );
    const body = encodeURIComponent(data.recommended_email_to_counsel);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  }

  return (
    <section className={card}>
      <h2 className={ui.sectionTitle}>Handoff</h2>
      <p className={ui.sectionHint}>
        Forward this review without retyping conclusions
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={sendToCounsel}
          className="flex-1 rounded-lg border border-teal-600/30 bg-teal-950/35 px-3 py-2.5 text-xs font-semibold text-teal-100/95 transition-colors hover:border-teal-500/35 hover:bg-teal-950/45"
        >
          {sent ? "Composer opened" : "Send to Outside Counsel"}
        </button>
        <button
          type="button"
          onClick={exportReview}
          className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]"
        >
          {exported ? "Exported" : "Export Review"}
        </button>
      </div>

      <div className="mt-5 rounded-lg border border-white/[0.06] bg-black/20 p-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
          Next action owner
        </p>
        <ul className="mt-3 space-y-2.5 text-sm">
          <li className="flex flex-col gap-0.5 border-b border-white/[0.05] pb-2.5 sm:flex-row sm:justify-between sm:gap-4">
            <span className="text-zinc-500">Internal counsel</span>
            <span className="font-medium text-zinc-300 sm:text-right">
              Confirm issues and approve outbound email
            </span>
          </li>
          <li className="flex flex-col gap-0.5 border-b border-white/[0.05] pb-2.5 sm:flex-row sm:justify-between sm:gap-4">
            <span className="text-zinc-500">Outside counsel</span>
            <span className="font-medium text-zinc-300 sm:text-right">
              Revise claims and respond to questions
            </span>
          </li>
          <li className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
            <span className="text-zinc-500">Inventor</span>
            <span className="font-medium text-zinc-300 sm:text-right">
              Answer technical fact questions
            </span>
          </li>
        </ul>
      </div>
      <p className={`${ui.meta} mt-3`}>
        Demo: mailto and JSON export. Integrate with DMS or secure share in
        production.
      </p>
    </section>
  );
}
