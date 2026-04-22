import express from "express";
import { runAgent } from "./agent.js";

const app = express();
app.use(express.json());

app.post("/review", async (req, res) => {
  const prUrl = req.body.prUrl;
  if (!prUrl) {
    res.status(400).json({ error: "prUrl is required" });
    return;
  }

  if (!prUrl.includes("github.com")) {
    res.status(400).json({ error: "prUrl must be a valid GitHub PR URL" });
    return;
  }

  const result = await runAgent(prUrl);
  res.json({ result });
});

app.listen(3000, () => console.log("Server running on port 3000"));
