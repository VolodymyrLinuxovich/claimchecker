"use client";

import { useState } from "react";
import HandoffPanel from "@/components/HandoffPanel";
import { claimSupportRisks, formalityDraftingIssues } from "@/lib/issue-groups";
import { ui } from "@/lib/ui-styles";
import type { ReviewResult as ReviewPayload } from "@/lib/schema";

type Issue = ReviewPayload["issues"][number];

type Props = {
  data: ReviewPayload | null;
  error: string | null;
  jurisdiction: "US" | "EU";
};

const card = `${ui.card} ${ui.cardPadding}`;

function severityPill(severity: "low" | "medium" | "high") {
  switch (severity) {
    case "high":
      return "border-rose-500/20 bg-rose-950/30 text-rose-200/90";
    case "medium":
      return "border-amber-500/15 bg-amber-950/20 text-amber-100/90";
    default:
      return "border-white/[0.08] bg-white/[0.03] text-zinc-400";
  }
}

function confidenceLabel(c: "low" | "medium" | "high") {
  switch (c) {
    case "high":
      return "High (model estimate)";
    case "medium":
      return "Medium (model estimate)";
    default:
      return "Low (model estimate)";
  }
}

function resolveExplainability(issue: Issue, jurisdiction: "US" | "EU") {
  const confidence: Issue["confidence"] =
    issue.confidence ??
    (issue.severity === "high"
      ? "medium"
      : issue.severity === "medium"
        ? "medium"
        : "low");

  return {
    why_flagged:
      issue.why_flagged?.trim() ||
      issue.description ||
      "Flagged based on draft-to-context alignment and prosecution heuristics.",
    source_text:
      issue.source_text?.trim() ||
      "No isolated excerpt returned for this finding; tie-back to the uploaded draft and disclosure text.",
    jurisdiction_note:
      issue.jurisdiction_note?.trim() ||
      `${jurisdiction}: treat as directional — confirm against current office practice and your portfolio standards.`,
    confidence: confidence!,
  };
}

function IssueCard({
  issue,
  jurisdiction,
}: {
  issue: Issue;
  jurisdiction: "US" | "EU";
}) {
  const ex = resolveExplainability(issue, jurisdiction);

  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/20 p-4">
      <div className="space-y-2">
        <h4 className="text-sm font-semibold leading-snug text-zinc-100">
          {issue.title}
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${severityPill(issue.severity)}`}
          >
            {issue.severity}
          </span>
          <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            {issue.category}
          </span>
        </div>
      </div>
      <p className={`${ui.bodyMuted} mt-3 max-w-prose`}>{issue.description}</p>

      <div className="mt-4 border-t border-white/[0.06] pt-4">
        <p className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
          Transparency
        </p>
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ExplainCell label="Why flagged" value={ex.why_flagged} />
          <ExplainCell label="Source text" value={ex.source_text} />
          <ExplainCell label="Jurisdiction note" value={ex.jurisdiction_note} />
          <ExplainCell
            label="Confidence"
            value={confidenceLabel(ex.confidence)}
          />
        </dl>
      </div>
    </div>
  );
}

function ExplainCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.05] bg-zinc-950/40 px-2.5 py-2">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 text-xs leading-relaxed text-zinc-300">{value}</dd>
    </div>
  );
}

function EmailBody({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/).filter(Boolean);
  if (blocks.length <= 1) {
    return (
      <div className={`${ui.body} max-w-prose whitespace-pre-wrap`}>{text}</div>
    );
  }
  return (
    <div className="space-y-3 max-w-prose">
      {blocks.map((para, i) => (
        <p key={i} className={`${ui.body} whitespace-pre-wrap`}>
          {para.trim()}
        </p>
      ))}
    </div>
  );
}

export default function ReviewResult({ data, error, jurisdiction }: Props) {
  const [copied, setCopied] = useState(false);

  if (error) {
    return (
      <div
        className={`${card} border-rose-500/20 bg-rose-950/15 text-sm text-rose-100/95`}
      >
        <p className="font-semibold text-rose-200/95">
          Review could not be completed
        </p>
        <p className={`${ui.bodyMuted} mt-2 text-rose-100/85`}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${card} py-12 text-center`}>
        <p className="text-sm font-medium text-zinc-400">Awaiting review run</p>
        <p className={`${ui.meta} mx-auto mt-2 max-w-xs leading-relaxed`}>
          Run a review from Intake to populate the master snapshot, risks, and
          handoff materials.
        </p>
      </div>
    );
  }

  const supportIssues = claimSupportRisks(data.issues);
  const formalityIssues = formalityDraftingIssues(data.issues);

  async function copyEmail() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.recommended_email_to_counsel);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className={card}>
        <h2 className={ui.sectionTitle}>Master snapshot</h2>
        <p className={ui.sectionHint}>Objectives, alignment, and top concerns</p>
        <div className="mt-5 space-y-4 max-w-prose">
          <p className={ui.body}>
            <span className="font-medium text-zinc-200">Draft objective. </span>
            {data.executive_summary.draft_goal}
          </p>
          <p className={ui.body}>
            <span className="font-medium text-zinc-200">
              Disclosure alignment.{" "}
            </span>
            {data.executive_summary.alignment_assessment}
          </p>
          <ul className="list-disc space-y-2 pl-4 text-sm leading-[1.65] text-zinc-400 marker:text-zinc-600">
            {data.executive_summary.top_concerns.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={card}>
        <h2 className={ui.sectionTitle}>Claim Support Risks</h2>
        <p className={ui.sectionHint}>
          Enablement, written description, consistency, and support gaps vs.
          disclosure.
        </p>
        <div className="mt-5 space-y-3">
          {supportIssues.length === 0 ? (
            <p className={ui.bodyMuted}>No support-class flags for this pass.</p>
          ) : (
            supportIssues.map((issue, i) => (
              <IssueCard
                key={`s-${i}`}
                issue={issue}
                jurisdiction={jurisdiction}
              />
            ))
          )}
        </div>
      </section>

      <section className={card}>
        <h2 className={ui.sectionTitle}>Formality / Drafting Issues</h2>
        <p className={ui.sectionHint}>
          Clarity, claim formality, and jurisdiction-specific drafting
          pressure points.
        </p>
        <div className="mt-5 space-y-3">
          {formalityIssues.length === 0 ? (
            <p className={ui.bodyMuted}>
              No formality-class flags for this pass.
            </p>
          ) : (
            formalityIssues.map((issue, i) => (
              <IssueCard
                key={`f-${i}`}
                issue={issue}
                jurisdiction={jurisdiction}
              />
            ))
          )}
        </div>
      </section>

      <section className={card}>
        <h2 className={ui.sectionTitle}>Questions for Inventor</h2>
        <p className={ui.sectionHint}>Technical facts to confirm or clarify</p>
        <ul className="mt-5 list-disc space-y-2 pl-4 text-sm leading-[1.65] text-zinc-400 marker:text-zinc-600 max-w-prose">
          {data.questions_to_resolve.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>

      <section className={card}>
        <h2 className={ui.sectionTitle}>Instructions to Outside Counsel</h2>
        <p className={ui.sectionHint}>Directed revision guidance</p>
        <ul className="mt-5 list-disc space-y-2 pl-4 text-sm leading-[1.65] text-zinc-400 marker:text-zinc-600 max-w-prose">
          {data.suggested_revision_instructions.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section
        className={`${ui.card} border-white/[0.05] bg-zinc-950/25 ${ui.cardPadding}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.05] pb-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
              Counsel transmission
            </h2>
            <p className={`${ui.meta} mt-1`}>Draft for external send — review before transmission</p>
          </div>
          <button
            type="button"
            onClick={copyEmail}
            className="shrink-0 rounded-md border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-white/[0.14] hover:bg-white/[0.06]"
          >
            {copied ? "Copied" : "Copy email"}
          </button>
        </div>
        <div className="mt-4 rounded-lg border border-white/[0.05] bg-black/20 p-4">
          <EmailBody text={data.recommended_email_to_counsel} />
        </div>
      </section>

      <HandoffPanel data={data} jurisdiction={jurisdiction} />
    </div>
  );
}
