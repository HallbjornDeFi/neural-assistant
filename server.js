// === Neural Assistant (Node + Express) ===
// Run: node server.js  → open http://localhost:3001

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Optional OpenAI client (only used if you add an API key to .env)
let openaiClient = null;
if (process.env.OPENAI_API_KEY) {
  const OpenAI = require("openai");
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Health check route
app.get("/health", (_req, res) => res.json({ ok: true }));

// Chat route
app.post("/chat", async (req, res) => {
  const userMsg = String(req.body.message || "").trim();

  // Offline mode if no OpenAI key
  if (!openaiClient) {
    const reply = userMsg
      ? `You said: "${userMsg}". (Offline demo mode).`
      : "Hello from Neural Assistant (offline mode).";
    return res.json({ reply, mode: "offline" });
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Neural Assistant, a coding helper for NeuralNet Coin." },
        { role: "user", content: userMsg }
      ],
      temperature: 0.6,
      max_tokens: 300
    });
    const reply = completion.choices?.[0]?.message?.content ?? "No reply.";
    res.json({ reply, mode: "openai" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "OpenAI error", detail: String(e) });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Neural Assistant running on http://localhost:${port}`));
