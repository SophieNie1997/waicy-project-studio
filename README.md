# WAICY Project Studio

Interactive classroom workspace for WAICY students to turn AI project ideas into paper-first UI plans, Codex-ready prompts, tested prototypes, and evidence packs.

## What It Supports

- Design Gallery for borrowing principles from strong product websites
- Product Canvas for making an AI project idea specific and buildable
- UI Sketch Lab for paper-first screen planning
- Codex Build Desk for teacher-reviewed manual prompt handoff
- Test & Iterate notes for peer feedback and v1-to-v2 improvement
- Evidence Pack outputs for final PDF and video storytelling

## Run Locally

```bash
npm install
npm run dev
```

## Optional AI Idea Choices

The Product Canvas can call a teacher-owned backend after students click `Confirm idea`.
The production frontend defaults to:

```bash
https://waicy-project-studio-api.vercel.app/api/idea-choices
```

Create the Vercel backend with that project name so GitHub Pages can call it without extra frontend config.

### Deploy on Vercel

1. Create a new Vercel project from `SophieNie1997/waicy-project-studio`.
2. Name the project `waicy-project-studio-api`.
3. Open the project settings and add these environment variables for Production:

```bash
KKSJ_API_KEY=<your KKSJ key>
KKSJ_BASE_URL=https://api.kksj.org/v1
KKSJ_MODEL=gpt-4o-mini
ALLOWED_ORIGIN=https://sophienie1997.github.io
```

4. Deploy. The API should be available at `/api/idea-choices`.

The frontend can also call a custom backend if you set this at build time:

```bash
VITE_IDEA_CHOICES_ENDPOINT=https://your-backend.example.com/api/idea-choices
```

### Alternative: Deploy on Cloudflare Worker

This repo also includes a Cloudflare Worker template in `worker/`.

Copy the example config, then set the model key as a Worker secret:


```bash
cp wrangler.example.toml wrangler.toml
npx wrangler secret put KKSJ_API_KEY --config wrangler.toml
npx wrangler deploy --config wrangler.toml
```

Do not paste the key into `wrangler.toml`; keep it as a secret.

The example config uses the OpenAI-compatible KKSJ endpoint:

```toml
KKSJ_BASE_URL = "https://api.kksj.org/v1"
KKSJ_MODEL = "gpt-4o-mini"
ALLOWED_ORIGIN = "https://sophienie1997.github.io"
```

The frontend sends:

```json
{
  "title": "Pet Clothes Helper",
  "seedIdea": "Help students pick safe pet clothes",
  "audience": "Grade 6 students building a paper-first AI app prototype",
  "decisions": [{ "key": "problem", "label": "Problem", "choicesNeeded": 3 }]
}
```

The backend should return:

```json
{
  "choices": {
    "problem": [{ "label": "Weather outfit panic", "value": "Students are unsure which pet clothing is safe for the weather." }],
    "user": [{ "label": "First-time pet carers", "value": "Grade 6 students caring for a class pet during a busy school day." }]
  }
}
```

Never put a model API key in the Vite frontend environment. Keep it in the backend.

## Verify

```bash
npm run test:run
npm run build
```
