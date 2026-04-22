export const analyzeComplexity = {
  name: "analyzeComplexity",
  description:
    "Analyzes a code diff for complexity issues including deep nesting, long functions, large files, TODO comments, and console.log usage",
  parameters: {
    type: "object",
    properties: {
      diff: { type: "string", description: "The code diff to analyze" },
    },
    required: ["diff"],
  },
  run(args: { diff: string }): string {
    const issues: string[] = [];
    const lines = args.diff.split("\n");

    // 1. check TODO/FIXME
    if (/TODO|FIXME/i.test(args.diff)) issues.push("TODO/FIXME comments found");

    // 2. check deep nesting
    for (const line of lines) {
      const depth = (line.match(/{/g) ?? []).length;
      if (depth > 4) {
        issues.push("Deep nesting detected");
        break;
      }
    }

    // 3. check long functions
    const regularFunctions = (args.diff.match(/function\s+\w+/g) ?? []).length;
    const arrowFunctions = (args.diff.match(/const\s+\w+\s*=\s*.*=>/g) ?? [])
      .length;
    const funcCount = regularFunctions + arrowFunctions;
    if (funcCount > 0 && lines.length / funcCount > 30) {
      issues.push("Possible long function detected");
    }

    // 4. check large file
    if (lines.length > 300) issues.push("Large file — consider splitting");

    // 5. console.log left in code
    if (/console\.log/i.test(args.diff))
      issues.push("console.log found — remove before merging");

    return issues.length > 0 ? issues.join("\n") : "No complexity issues found";
  },
};
