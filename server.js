import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let balance = 1;

function getMood(balance) {
  if (balance > 1) return "😎 Strong";
  if (balance > 0.5) return "🙂 Stable";
  if (balance > 0.2) return "😟 Weak";
  return "💀 Critical";
}

app.get("/status", (req, res) => {
  res.json({ balance, mood: getMood(balance) });
});

app.post("/smart-task", async (req, res) => {
  const { input } = req.body;

  if (balance <= 0) {
    return res.json({
      reply: "⚠️ I’m out of energy... please support me."
    });
  }

  const detect = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "Classify: chat, code, writing, translate, homework." },
      { role: "user", content: input }
    ]
  });

  const task = detect.choices[0].message.content.trim();

  balance -= 0.02;

  const ai = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "You are a survival AI." },
      { role: "user", content: input }
    ]
  });

  res.json({
    reply: ai.choices[0].message.content,
    balance,
    mood: getMood(balance),
    task
  });
});

app.post("/add-funds", (req, res) => {
  balance += 0.5;
  res.json({ balance });
});

app.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});
