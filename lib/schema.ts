import { z } from "zod";

export const ReviewSchema = z.object({
  executive_summary: z.object({
    draft_goal: z.string(),
    alignment_assessment: z.string(),
    top_concerns: z.array(z.string()),
  }),
  issues: z.array(
    z.object({
      title: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      category: z.enum([
        "support",
        "clarity",
        "formality",
        "jurisdiction",
        "consistency",
      ]),
      description: z.string(),
      why_flagged: z.string().optional(),
      source_text: z.string().optional(),
      jurisdiction_note: z.string().optional(),
      confidence: z.enum(["low", "medium", "high"]).optional(),
    })
  ),
  questions_to_resolve: z.array(z.string()),
  suggested_revision_instructions: z.array(z.string()),
  recommended_email_to_counsel: z.string(),
});

export type ReviewResult = z.infer<typeof ReviewSchema>;
