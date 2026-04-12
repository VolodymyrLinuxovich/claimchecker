export function buildPrompt(params: {
  jurisdiction: "US" | "EU";
  draftText: string;
  contextText?: string;
}) {
  return `
You are a patent prosecution review assistant helping an in-house attorney review a patent draft prepared by outside counsel.

Jurisdiction: ${params.jurisdiction}

Tasks:
1. Explain what the draft appears to protect.
2. Assess whether the draft aligns with the supporting context.
3. Identify support, clarity, formality, consistency, and jurisdiction-specific issues.
4. For EVERY issue, add explainability: why it was flagged, the shortest relevant excerpt or paraphrase from the draft/context (source_text), a one-line jurisdiction note for the selected jurisdiction, and your confidence (low/medium/high) in the finding.
5. List questions aimed at the inventor where technical facts are unclear; counsel-facing items may be included when needed.
6. Produce instructions directed to outside counsel for revisions.
7. Draft a short attorney-ready email to outside counsel.

Return ONLY valid JSON with this exact shape:
{
  "executive_summary": {
    "draft_goal": "string",
    "alignment_assessment": "string",
    "top_concerns": ["string"]
  },
  "issues": [
    {
      "title": "string",
      "severity": "low | medium | high",
      "category": "support | clarity | formality | jurisdiction | consistency",
      "description": "string",
      "why_flagged": "string — concise rule or reasoning",
      "source_text": "string — short excerpt or paraphrase from draft or context",
      "jurisdiction_note": "string — US or EU practice hook for this issue",
      "confidence": "low | medium | high"
    }
  ],
  "questions_to_resolve": ["string"],
  "suggested_revision_instructions": ["string"],
  "recommended_email_to_counsel": "string"
}

Patent Draft:
${params.draftText}

Supporting Context:
${params.contextText || "No additional supporting context provided."}
`;
}
