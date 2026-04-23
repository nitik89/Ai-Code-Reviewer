import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import * as dotenv from "dotenv";
import { tools } from "./tools/index.js";
dotenv.config();

if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");
if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is required");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function trimMessages(
  msgs: ChatCompletionMessageParam[],
): ChatCompletionMessageParam[] {
  const MAX = 15;
  const system = msgs[0];
  return system ? [system, ...msgs.slice(1).slice(-MAX)] : msgs.slice(-MAX);
}

export async function runAgent(prUrl: string): Promise<string> {
  let messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a code review agent. First fetch the PR diff using fetchPRDiff, then check for security issues using checkSecurityIssues and complexity issues using analyzeComplexity, then post a detailed review comment summarizing all findings using postReviewComment.",
    },
    { role: "user", content: prUrl },
  ];
  try {
    let iterations = 0;
    const MAX_ITERATIONS = 10;
    while (iterations < MAX_ITERATIONS) {
      iterations++;
      const response = await client.chat.completions.create({
        model: "gpt-4.1",
        messages,
        tools: tools.map((t) => ({
          type: "function" as const,
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters as Record<string, unknown>,
          },
        })),
        tool_choice: "auto",
      });

      const message = response.choices[0]?.message;
      if (!message) throw new Error("Empty response from model");

      if (message.tool_calls) {
        messages.push(message as ChatCompletionMessageParam);

        for (const toolCall of message.tool_calls as any[]) {
          const tool = tools.find((t) => t.name === toolCall.function.name);
          let args;
          try {
            args = JSON.parse(toolCall.function.arguments);
            if (typeof args !== "object" || args === null) {
              args = {};
            }
          } catch {
            args = {};
          }

          if (!tool) {
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: `Error: unknown tool "${toolCall.function.name}"`,
            });
            continue;
          }

          let result: string;
          try {
            result = await tool.run(args);
          } catch (e: any) {
            result = `Tool error: ${e.message}`;
          }
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result.slice(0, 5000),
          });
        }
        messages = trimMessages(messages);
      } else {
        return message?.content ?? "No response";
      }
    }
    //hii everyone, this is a test message to check if the code is working fine. Please ignore this message and continue with the review process. Thank you!
    throw new Error("Max iterations reached");
  } catch (e: any) {
    return `Agent error: ${e.message}`;
  }
}
