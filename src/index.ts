import express from "express";
import { runAgent } from "./agent.js";

const app = express();
app.use(express.json());

app.post("/review", async (req, res) => {
  // handle github webhook payload
  const action = req.body.action;
  const prUrl = req.body.pull_request?.html_url ?? req.body.prUrl;

  if (!prUrl || !prUrl.includes("github.com")) {
    res.status(400).json({ error: "Valid GitHub PR URL is required" });
    return;
  }

  if (action && !["opened", "synchronize"].includes(action)) {
    res.status(200).json({ message: "Event ignored" });
    return;
  }

  res.status(200).json({ message: "Review started" });
  runAgent(prUrl).catch(console.error);
});

app.listen(3000, () => console.log("Server running on port 3000"));
