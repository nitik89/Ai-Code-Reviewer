import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

export const postReviewComment = {
  name: "postReviewComment",
  description: "Posts a review comment on a GitHub PR",
  parameters: {
    type: "object",
    properties: {
      prUrl: { type: "string", description: "The full GitHub PR URL" },
      comment: { type: "string", description: "The review comment to post" },
    },
    required: ["prUrl", "comment"],
  },
  async run(args: { prUrl: string; comment: string }): Promise<string> {
    const parts = args.prUrl.split("/");
    const owner = parts[3];
    const repo = parts[4];
    const prNumber = parts[6];

    try {
      await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
        { body: args.comment, event: "COMMENT" },
        { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
      );
      return "Review posted successfully";
    } catch (e: any) {
      return `Failed to post review: ${e.message}`;
    }
  },
};
