import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ai } from "@/lib/gemini";
import { buildPrompt } from "@/lib/prompt";
import {
  computeReviewPersistMetrics,
} from "@/lib/review-persistence";
import { ReviewSchema } from "@/lib/schema";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = await req.json();

    const prompt = buildPrompt({
      jurisdiction: body.jurisdiction,
      draftText: body.draftText,
      contextText: body.contextText,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    const text = response.text ?? "";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const validated = ReviewSchema.parse(parsed);

    const metrics = computeReviewPersistMetrics(validated);

    let persist: {
      saved: boolean;
      reviewId: string | null;
      high_risk_count: number;
      missing_support_count: number;
      draft_email_ready: boolean;
    } = {
      saved: false,
      reviewId: null,
      ...metrics,
    };

    const supabase = createServiceRoleClient();
    if (supabase) {
      const { data: inserted, error: insertError } = await supabase
        .from("reviews")
        .insert({
          jurisdiction: String(body.jurisdiction ?? "US"),
          patent_draft: String(body.draftText ?? ""),
          supporting_context: String(body.contextText ?? ""),
          executive_summary: validated.executive_summary,
          issues: validated.issues,
          questions_to_resolve: validated.questions_to_resolve,
          suggested_revision_instructions:
            validated.suggested_revision_instructions,
          recommended_email_to_counsel: validated.recommended_email_to_counsel,
          high_risk_count: metrics.high_risk_count,
          missing_support_count: metrics.missing_support_count,
          draft_email_ready: metrics.draft_email_ready,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("[review] supabase insert", insertError);
      } else if (inserted?.id) {
        persist = {
          saved: true,
          reviewId: inserted.id as string,
          ...metrics,
        };

        const { error: itemsError } = await supabase
          .from("action_items")
          .insert([
            {
              review_id: inserted.id,
              owner: "Internal counsel",
              title: "Confirm claim-support and formality flags; approve outbound email",
              status: "ready",
            },
            {
              review_id: inserted.id,
              owner: "Outside counsel",
              title: "Revise claims and specification per instructions",
              status: "ready",
            },
            {
              review_id: inserted.id,
              owner: "Inventor",
              title: "Resolve technical fact questions raised in review",
              status: "ready",
            },
          ]);

        if (itemsError) {
          console.error("[review] action_items insert", itemsError);
        }
      }
    }

    return NextResponse.json({ review: validated, persist });
  } catch (error) {
    console.error(error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Could not parse model output as JSON." },
        { status: 422 }
      );
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Model response did not match the expected review schema." },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate review." },
      { status: 500 }
    );
  }
}
