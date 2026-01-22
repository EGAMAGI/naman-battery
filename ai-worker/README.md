# Real AI FAQ (Cloudflare Worker)

This folder adds a secure backend so your website can use a real AI model.

## Why you need this
Do **not** put API keys in `app.js` or `index.html`. A Worker keeps your key secret.

## Setup (Cloudflare Workers)
1) Install Wrangler (once):
   - `npm install -g wrangler`

2) Login:
   - `wrangler login`

3) Create `wrangler.toml` from the example:
   - Copy `wrangler.toml.example` → `wrangler.toml`
   - Edit `name` if needed

4) Set your OpenAI key as a secret:
   - `wrangler secret put OPENAI_API_KEY`

5) (Optional) Restrict allowed origins:
   - Add `ALLOWED_ORIGINS` in `wrangler.toml` like:
     - `ALLOWED_ORIGINS = "https://egamagi.github.io"`

6) Deploy:
   - `wrangler deploy`

Wrangler will print a URL like:
- `https://naman-battery-ai.<your-subdomain>.workers.dev/ask`

## Connect it to the website
In `index.html`, set:
- `window.NAMAN_AI_ENDPOINT = "https://.../ask"`

Then the FAQ helper will use real AI.

## Notes
- The Worker endpoint is `POST /ask` with JSON body `{ question, faq }`.
- The website sends your on-page FAQ entries as context.
