export const checkSecurityIssues = {
  name: "checkSecurityIssues",
  description:
    "Scans a code diff for security issues like hardcoded secrets, eval usage, and sensitive data in logs",
  parameters: {
    type: "object",
    properties: {
      diff: { type: "string", description: "The code diff to scan" },
    },
    required: ["diff"],
  },
  run(args: { diff: string }): string {
    const patterns = [
      {
        regex: /api_key\s*=\s*['"].+['"]/i,
        message: "Hardcoded API key detected",
      },
      {
        regex: /secret\s*=\s*['"].+['"]/i,
        message: "Hardcoded secret detected",
      },
      {
        regex: /password\s*=\s*['"].+['"]/i,
        message: "Hardcoded password detected",
      },
      { regex: /eval\s*\(/, message: "Dangerous eval() usage" },
      { regex: /exec\s*\(/, message: "Dangerous exec() usage" },
      {
        regex: /console\.log\(.*(token|secret|password|key)/i,
        message: "Sensitive data in console.log",
      },
      { regex: /SELECT.+FROM.+WHERE.+\+/i, message: "Possible SQL injection" },
      { regex: /innerHTML\s*=/, message: "Possible XSS via innerHTML" },
    ];
    const issues: string[] = [];
    for (const pattern of patterns) {
      if (pattern.regex.test(args.diff)) {
        issues.push(pattern.message);
      }
    }
    return issues.length > 0 ? issues.join("\n") : "No security issues found";
  },
};
