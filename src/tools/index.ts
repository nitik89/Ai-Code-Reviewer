import { analyzeComplexity } from "./analyzeComplexity.js";
import { checkSecurityIssues } from "./checkSecurityIssues.js";
import { fetchPRDiff } from "./fetchPRDiff.js";
import { postReviewComment } from "./postReviewComment.js";

export const tools: Array<{
  name: string;
  description: string;
  parameters: object;
  run(args: any): string | Promise<string>;
}> = [analyzeComplexity, checkSecurityIssues, fetchPRDiff, postReviewComment];
