export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Basic CORS
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
    const allowOrigin = allowed.length === 0 ? "*" : (allowed.includes(origin) ? origin : "");

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": allowOrigin || "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (request.method !== "POST" || url.pathname !== "/ask") {
      return new Response("Not found", {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": allowOrigin || "*",
        },
      });
    }

    if (!env.OPENAI_API_KEY) {
      return json({ error: "Missing OPENAI_API_KEY" }, 500, allowOrigin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, allowOrigin);
    }

    const question = String(body?.question || "").trim();
    const faq = Array.isArray(body?.faq) ? body.faq : [];

    if (!question) {
      return json({ error: "Missing question" }, 400, allowOrigin);
    }

    const shopName = env.SHOP_NAME || "Naman Battery Trading Co";
    const phone = env.SHOP_PHONE || "+91 8279557998";
    const city = env.SHOP_CITY || "Baraut / Ghaziabad";

    const system =
      "You are a helpful assistant for a local battery shop website. " +
      "Answer very concisely, in simple Hinglish/English. " +
      "Only answer about shop info, batteries, installation, delivery, exchange, warranty, location, hours. " +
      "If unsure, say you are not sure and suggest WhatsApp/call.";

    const faqBlock = faq
      .slice(0, 20)
      .map((x, i) => {
        const q = String(x?.q || "").trim();
        const a = String(x?.a || "").trim();
        return q && a ? `Q${i + 1}: ${q}\nA${i + 1}: ${a}` : "";
      })
      .filter(Boolean)
      .join("\n\n");

    const user =
      `Shop: ${shopName}\n` +
      `City: ${city}\n` +
      `Contact: ${phone}\n\n` +
      (faqBlock ? `FAQ:\n${faqBlock}\n\n` : "") +
      `User question: ${question}\n\n` +
      "Reply with a direct answer in 1-4 short lines. " +
      "If the question is not covered, tell user to WhatsApp/call.";

    const model = env.OPENAI_MODEL || "gpt-4.1-mini";

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return json({ error: "OpenAI error", detail: text }, 502, allowOrigin);
    }

    const data = await resp.json();
    const answer = data?.choices?.[0]?.message?.content?.trim() || "";

    return json({ answer }, 200, allowOrigin);
  },
};

function json(obj, status, allowOrigin) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowOrigin || "*",
    },
  });
}
