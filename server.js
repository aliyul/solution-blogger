// server.js
// Minimal Express server to proxy semantic requests to OpenAI (or other LLM).
// npm i express body-parser node-fetch
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch"; // or global fetch in Node 18+

const app = express();
app.use(bodyParser.json({ limit: "1mb" }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY not set in environment!");
}

app.post("/api/semantic-detect", async (req, res) => {
  try {
    const { h1 = "", snippet = "", url = "" } = req.body;
    // Build prompt that instructs model to output JSON only
    const system = `You are a concise SEO assistant. Given a title (H1), a short content snippet, and the page URL, 
determine the content status among EXACT values: "EVERGREEN", "SEMI-EVERGREEN", "NON-EVERGREEN".
Also return a reliable recommended H1 (if H1 is ok, return same), a suggested meta description (<=160 chars),
and an array 'structure' of H2/H3 sections for an ultra-competitive SEO structure. Output strictly JSON.`;
    const user = `H1: "${h1}"
URL: "${url}"
Snippet: """${snippet}""" 

Respond with JSON:
{
  "type":"EVERGREEN" | "SEMI-EVERGREEN" | "NON-EVERGREEN",
  "confidence": 0.0-1.0,
  "recommendedH1":"...",
  "metaDescription":"...",
  "structure":[ { "h2":"...","h3":["...","..."] }, ... ],
  "suggestion":"short practical suggestions - one or two lines"
}`;

    // call OpenAI Chat Completion (or other LLM). Adjust model name if needed.
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // change to model available in your account
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        max_tokens: 600,
        temperature: 0.0
      })
    });

    if (!apiRes.ok) {
      const t = await apiRes.text();
      return res.status(502).json({ error: "LLM error", detail: t });
    }
    const data = await apiRes.json();
    // Expect model reply in data.choices[0].message.content
    const text = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "";
    // Try parse JSON robustly
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // If model included extraneous text, try to extract JSON substring
      const m = text.match(/\{[\s\S]*\}$/);
      if (m) parsed = JSON.parse(m[0]);
      else throw new Error("Unable to parse JSON from model response: " + text.slice(0,400));
    }

    // Normalize and return
    return res.json({
      ok: true,
      result: parsed
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Semantic proxy running on :${port}`));
