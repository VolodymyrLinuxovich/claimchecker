import type { ReviewResult } from "@/lib/schema";

export type ReviewPersistMetrics = {
  high_risk_count: number;
  missing_support_count: number;
  draft_email_ready: boolean;
};

export function computeReviewPersistMetrics(
  review: ReviewResult
): ReviewPersistMetrics {
  return {
    high_risk_count: review.issues.filter((i) => i.severity === "high").length,
    missing_support_count: review.issues.filter((i) => i.category === "support")
      .length,
    draft_email_ready: Boolean(review.recommended_email_to_counsel?.trim()),
  };
}

export function reviewRowToResult(row: {
  executive_summary: unknown;
  issues: unknown;
  questions_to_resolve: unknown;
  suggested_revision_instructions: unknown;
  recommended_email_to_counsel: string;
}): ReviewResult {
  return {
    executive_summary: row.executive_summary as ReviewResult["executive_summary"],
    issues: row.issues as ReviewResult["issues"],
    questions_to_resolve: row.questions_to_resolve as string[],
    suggested_revision_instructions:
      row.suggested_revision_instructions as string[],
    recommended_email_to_counsel: row.recommended_email_to_counsel,
  };
}
