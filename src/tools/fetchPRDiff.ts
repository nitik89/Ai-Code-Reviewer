import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

export const fetchPRDiff = {
  name: "fetchPRDiff",
  description: "Fetches the code diff of a GitHub PR",
  parameters: {
    type: "object",
    properties: {
      prUrl: { type: "string", description: "The full GitHub PR URL" },
    },
    required: ["prUrl"],
  },
  async run(args: { prUrl: string }): Promise<string> {
    const parts = args.prUrl.split("/");
    const owner = parts[3];
    const repo = parts[4];
    const prNumber = parts[6];

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`,
      { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } },
    );
    return response.data
      .map((f: any) => `File: ${f.filename}\n${f.patch ?? "no diff"}`)
      .join("\n\n");
  },
};
