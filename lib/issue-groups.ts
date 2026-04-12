import type { ReviewResult } from "@/lib/schema";

type Issue = ReviewResult["issues"][number];

const SUPPORT_LIKE = new Set<Issue["category"]>(["support", "consistency"]);
const FORMALITY_LIKE = new Set<Issue["category"]>([
  "clarity",
  "formality",
  "jurisdiction",
]);

export function claimSupportRisks(issues: Issue[]): Issue[] {
  return issues.filter((i) => SUPPORT_LIKE.has(i.category));
}

export function formalityDraftingIssues(issues: Issue[]): Issue[] {
  return issues.filter((i) => FORMALITY_LIKE.has(i.category));
}
