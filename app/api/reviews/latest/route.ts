import { NextResponse } from "next/server";
import { reviewRowToResult } from "@/lib/review-persistence";
import { ReviewSchema } from "@/lib/schema";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ review: null, reason: "supabase_not_configured" });
  }

  const { data: row, error } = await supabase
    .from("reviews")
    .select(
      "id, jurisdiction, patent_draft, supporting_context, executive_summary, issues, questions_to_resolve, suggested_revision_instructions, recommended_email_to_counsel, high_risk_count, missing_support_count, draft_email_ready"
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[reviews/latest]", error);
    return NextResponse.json({ review: null, reason: "read_error" }, { status: 500 });
  }

  if (!row) {
    return NextResponse.json({ review: null });
  }

  try {
    const review = reviewRowToResult(row);
    const parsed = ReviewSchema.safeParse(review);
    if (!parsed.success) {
      console.error("[reviews/latest] schema", parsed.error.flatten());
      return NextResponse.json({ review: null, reason: "invalid_stored_review" });
    }
    return NextResponse.json({
      review: parsed.data,
      jurisdiction: row.jurisdiction as "US" | "EU",
      patent_draft: row.patent_draft as string,
      supporting_context: (row.supporting_context as string) ?? "",
      persist: {
        loadedFromDb: true,
        reviewId: row.id,
        high_risk_count: row.high_risk_count as number,
        missing_support_count: row.missing_support_count as number,
        draft_email_ready: row.draft_email_ready as boolean,
      },
    });
  } catch (e) {
    console.error("[reviews/latest] map", e);
    return NextResponse.json({ review: null, reason: "invalid_row" }, { status: 500 });
  }
}
