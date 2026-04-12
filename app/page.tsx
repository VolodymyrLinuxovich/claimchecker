"use client";

import { useEffect, useMemo, useState } from "react";
import UploadPanel from "@/components/UploadPanel";
import ReviewResult from "@/components/ReviewResult";
import JurisdictionSelector from "@/components/JurisdictionSelector";
import StickyReviewSummary from "@/components/StickyReviewSummary";
import WorkflowStepper from "@/components/WorkflowStepper";
import { computeReviewPersistMetrics } from "@/lib/review-persistence";
import { ui } from "@/lib/ui-styles";
import type { ReviewResult as ReviewResultType } from "@/lib/schema";

const SAMPLE_DRAFT = `INDEPENDENT CLAIM 1. A system for monitoring industrial fluid pressure comprising:
  a sensor array configured to measure pressure at a plurality of ports;
  a gateway device that receives measurement frames from the sensor array and applies a lossless compression algorithm before transmission; and
  a remote analytics server that reconstructs the measurement frames and raises an alert when a rolling average exceeds a configurable threshold.

DEPENDENT CLAIM 2. The system of claim 1, wherein the lossless compression algorithm is selected based on measured noise variance at each port.

DEPENDENT CLAIM 3. The system of claim 1, wherein the alert is suppressed for a dwell time after a manual acknowledgment is received from an operator console.`;

const SAMPLE_CONTEXT = `Invention notes — Q3 disclosure (draft for discussion only)

Problem: Plant operators get too many false pressure alarms when transient spikes occur during valve cycling. We want reliable alerts without missing real leaks.

Core idea: Edge gateway compresses raw time-series per port using adaptive lossless compression (picks algorithm based on local variance). Server maintains rolling averages per port; threshold is configurable per asset group. Operators can acknowledge an alarm to pause repeats for a configurable dwell (default ~90s).

Prior art callout: Known systems stream uncompressed samples or use fixed thresholds; we believe the adaptive compression + dwell-aware alerting combo is the differentiator.

Open points for counsel: best term for "measurement frames" vs "samples"; whether dependent claim 2 needs a specific algorithm name or can stay functional.`;

const shell = "mx-auto w-full max-w-[1400px] px-5 sm:px-6";
const intakeCard = `${ui.card} ${ui.cardPadding}`;

type SnapshotMetrics = {
  high_risk_count: number;
  missing_support_count: number;
  draft_email_ready: boolean;
};

type WorkspaceCue = null | "saved" | "restored";

function GovernanceRow() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-zinc-400">
        Confidential review workspace
      </span>
      <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-zinc-400">
        Validated with patent/IP legal feedback today
      </span>
    </div>
  );
}

function normalizeJurisdiction(v: unknown): "US" | "EU" {
  return v === "EU" ? "EU" : "US";
}

export default function HomePage() {
  const [jurisdiction, setJurisdiction] = useState<"US" | "EU">("US");
  const [draftText, setDraftText] = useState(SAMPLE_DRAFT);
  const [contextText, setContextText] = useState(SAMPLE_CONTEXT);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snapshotMetrics, setSnapshotMetrics] = useState<SnapshotMetrics | null>(
    null
  );
  const [workspaceCue, setWorkspaceCue] = useState<WorkspaceCue>(null);

  const workflowPhase = useMemo(() => {
    if (loading) return "reviewing" as const;
    if (result) return "complete" as const;
    return "input" as const;
  }, [loading, result]);

  const effectiveSnapshot = useMemo((): SnapshotMetrics | null => {
    if (snapshotMetrics) return snapshotMetrics;
    if (result) return computeReviewPersistMetrics(result);
    return null;
  }, [snapshotMetrics, result]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/reviews/latest");
        const data = await res.json();
        if (cancelled || !data?.review) return;
        setResult(data.review as ReviewResultType);
        setJurisdiction(normalizeJurisdiction(data.jurisdiction));
        if (typeof data.patent_draft === "string") {
          setDraftText(data.patent_draft);
        }
        if (typeof data.supporting_context === "string") {
          setContextText(data.supporting_context);
        }
        if (data.persist) {
          setSnapshotMetrics({
            high_risk_count: data.persist.high_risk_count,
            missing_support_count: data.persist.missing_support_count,
            draft_email_ready: data.persist.draft_email_ready,
          });
          if (data.persist.loadedFromDb) {
            setWorkspaceCue("restored");
          }
        }
      } catch {
        /* ignore hydrate errors */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit() {
    try {
      setLoading(true);
      setResult(null);
      setError(null);
      setSnapshotMetrics(null);
      setWorkspaceCue(null);

      const res = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jurisdiction,
          draftText,
          contextText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Failed to run review."
        );
        return;
      }

      if (data.review && data.persist) {
        setResult(data.review as ReviewResultType);
        setSnapshotMetrics({
          high_risk_count: data.persist.high_risk_count,
          missing_support_count: data.persist.missing_support_count,
          draft_email_ready: data.persist.draft_email_ready,
        });
        setWorkspaceCue(data.persist.saved ? "saved" : null);
      } else {
        setError("Unexpected response from review service.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to run review.");
    } finally {
      setLoading(false);
    }
  }

  function loadSample() {
    setDraftText(SAMPLE_DRAFT);
    setContextText(SAMPLE_CONTEXT);
    setResult(null);
    setError(null);
    setSnapshotMetrics(null);
    setWorkspaceCue(null);
  }

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 claim-grid-bg opacity-[0.35]"
        aria-hidden
      />
      <header className="relative z-10 border-b border-white/[0.06] bg-[#080c11]/90 backdrop-blur-sm">
        <div className={`${shell} flex items-center justify-between gap-4 py-3`}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] text-xs font-bold tracking-tight text-zinc-200">
              CC
            </span>
            <p className="text-sm font-semibold tracking-tight text-zinc-100">
              ClaimCheck
            </p>
          </div>
          <p className="hidden text-[11px] text-zinc-500 sm:block">
            Prosecution workflow · {jurisdiction}
          </p>
        </div>
      </header>

      <main className={`relative z-10 ${shell} pb-20 pt-8 lg:pt-10`}>
        <div className="max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            ClaimCheck
          </h1>
          <GovernanceRow />
          <p className="mt-5 text-lg font-semibold leading-snug tracking-tight text-zinc-100 sm:text-xl">
            Review outside-counsel patent drafts in minutes, not hours
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-500">
            For in-house patent counsel
          </p>
          <p className={`${ui.meta} mt-4 max-w-xl leading-relaxed`}>
            Structured claim-support and formality review, inventor questions,
            and counsel-ready output in one workspace.
          </p>
        </div>

        <div className="mt-8">
          <WorkflowStepper phase={workflowPhase} />
        </div>

        <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-x-12 xl:gap-x-20">
          <div className={intakeCard}>
            <div className="mb-6 flex flex-col gap-3 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className={ui.sectionTitle}>Intake</h2>
                <p className={ui.sectionHint}>
                  Jurisdiction, draft text, and supporting disclosure context
                </p>
              </div>
              <button
                type="button"
                onClick={loadSample}
                className={`${ui.meta} w-fit shrink-0 font-medium text-zinc-400 underline decoration-white/15 underline-offset-4 hover:text-zinc-300`}
              >
                Load sample
              </button>
            </div>
            <div className="space-y-6">
              <JurisdictionSelector
                value={jurisdiction}
                onChange={setJurisdiction}
              />
              <UploadPanel
                draftText={draftText}
                setDraftText={setDraftText}
                contextText={contextText}
                setContextText={setContextText}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-col lg:max-h-[calc(100vh-5.75rem)] lg:overflow-y-auto lg:overscroll-y-contain lg:pr-0.5">
            <div className="mb-4 flex shrink-0 flex-col gap-1 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div>
                <h2 className={ui.sectionTitle}>Work product</h2>
                <p className={ui.sectionHint}>
                  Snapshot through analysis, then transmission and handoff
                </p>
              </div>
              {workspaceCue === "saved" ? (
                <span className="text-[11px] font-medium text-teal-500/85">
                  Saved to workspace
                </span>
              ) : workspaceCue === "restored" ? (
                <span className="text-[11px] font-medium text-zinc-500">
                  Restored from workspace
                </span>
              ) : null}
            </div>

            {result && !error && effectiveSnapshot ? (
              <StickyReviewSummary
                high_risk_count={effectiveSnapshot.high_risk_count}
                missing_support_count={effectiveSnapshot.missing_support_count}
                draft_email_ready={effectiveSnapshot.draft_email_ready}
              />
            ) : null}

            <div className="min-h-0 flex-1">
              <ReviewResult
                data={result}
                error={error}
                jurisdiction={jurisdiction}
              />
            </div>
          </div>
        </div>

        <p className={`${ui.meta} mt-16 text-center`}>
          For in-house use only. Output is not legal advice. Verify all
          conclusions before reliance or external transmission.
        </p>
      </main>
    </div>
  );
}
