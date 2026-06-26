const DEFAULT_BASE_URL = "https://api.kksj.org/v1";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_ALLOWED_ORIGIN = "https://sophienie1997.github.io";

const DECISION_KEYS = new Set([
  "problem",
  "user",
  "userMoment",
  "input",
  "aiAction",
  "output",
  "impact",
  "responsibleAiNote",
]);

function corsHeaders(request, env = {}) {
  const allowedOrigin = env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN;
  const requestOrigin = request.headers.get("Origin");
  const origin = requestOrigin === allowedOrigin ? allowedOrigin : allowedOrigin;

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function jsonResponse(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request, env),
      "Content-Type": "application/json",
    },
  });
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function stripCodeFence(value) {
  return value
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function normalizePromptList(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") {
        const text = cleanText(item, 220);
        return text ? { label: cleanText(text, 42), value: text } : null;
      }

      if (!item || typeof item !== "object") return null;

      const label = cleanText(item.label, 42);
      const promptValue = cleanText(item.value, 240);
      if (!label || !promptValue) return null;

      return { label, value: promptValue };
    })
    .filter(Boolean)
    .slice(0, 3);
}

function normalizeChoices(payload) {
  const source = payload && typeof payload === "object" && payload.choices ? payload.choices : payload;
  const normalized = {};

  if (!source || typeof source !== "object") return normalized;

  for (const [key, value] of Object.entries(source)) {
    if (!DECISION_KEYS.has(key)) continue;

    const prompts = normalizePromptList(value);
    if (prompts.length > 0) {
      normalized[key] = prompts;
    }
  }

  return normalized;
}

function parseModelJson(content) {
  const text = stripCodeFence(cleanText(content, 20000));
  return JSON.parse(text);
}

function buildMessages(body) {
  const decisions = Array.isArray(body.decisions)
    ? body.decisions
        .filter((decision) => decision && DECISION_KEYS.has(decision.key))
        .map((decision) => ({
          key: decision.key,
          label: cleanText(decision.label, 60),
          question: cleanText(decision.question, 180),
          choicesNeeded: Number.isFinite(decision.choicesNeeded) ? decision.choicesNeeded : 3,
        }))
    : [];

  return [
    {
      role: "system",
      content:
        "You generate classroom-friendly AI project starter choices for Grade 6 students. Return only valid JSON. Keep labels short, concrete, and related to the student's project. Each value should be a complete sentence students can paste into a product canvas.",
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "Generate 3 choices for each requested Product Canvas decision.",
        outputShape: {
          choices: {
            problem: [{ label: "short button text", value: "specific sentence" }],
          },
        },
        constraints: [
          "Use English for all labels and values.",
          "Avoid generic phrases like confusion, slow moment, repeated questions unless they fit the idea.",
          "Make choices specific enough for a paper-first prototype.",
          "Do not mention implementation code or APIs.",
        ],
        project: {
          title: cleanText(body.title, 120),
          seedIdea: cleanText(body.seedIdea, 220),
          audience: cleanText(body.audience, 160) || "Grade 6 students building a paper-first AI app prototype",
        },
        decisions,
      }),
    },
  ];
}

export async function handleIdeaChoicesRequest(request, env = {}, fetchImpl = fetch) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(request, env),
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(request, env, { error: "Use POST for idea choices." }, 405);
  }

  if (!env.KKSJ_API_KEY) {
    return jsonResponse(request, env, { error: "Model backend is not configured." }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, env, { error: "Request body must be JSON." }, 400);
  }

  const title = cleanText(body.title, 120);
  const seedIdea = cleanText(body.seedIdea, 220);
  if (!title && !seedIdea) {
    return jsonResponse(request, env, { error: "Add a project title or seed idea first." }, 400);
  }

  const baseUrl = (env.KKSJ_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const model = env.KKSJ_MODEL || DEFAULT_MODEL;

  const modelResponse = await fetchImpl(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.KKSJ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: buildMessages(body),
      temperature: 0.72,
      max_tokens: 1600,
    }),
  });

  if (!modelResponse.ok) {
    return jsonResponse(request, env, { error: "Model request failed." }, 502);
  }

  try {
    const completion = await modelResponse.json();
    const content = completion?.choices?.[0]?.message?.content;
    const choices = normalizeChoices(parseModelJson(content));

    if (Object.keys(choices).length === 0) {
      return jsonResponse(request, env, { error: "Model returned no usable choices." }, 502);
    }

    return jsonResponse(request, env, { choices });
  } catch {
    return jsonResponse(request, env, { error: "Model returned invalid JSON." }, 502);
  }
}
