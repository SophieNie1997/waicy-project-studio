import { handleIdeaChoicesRequest } from "../worker/ideaChoicesCore.mjs";

function getHeader(headers, name) {
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value.join(", ") : value || "";
}

function toRequest(req) {
  const url = `https://waicy-project-studio-api.vercel.app${req.url || "/api/idea-choices"}`;
  const headers = new Headers();
  const origin = getHeader(req.headers, "origin");
  const contentType = getHeader(req.headers, "content-type") || "application/json";
  const method = req.method || "POST";
  const canHaveBody = !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());

  if (origin) headers.set("Origin", origin);
  headers.set("Content-Type", contentType);

  return new Request(url, {
    method,
    headers,
    body: canHaveBody ? JSON.stringify(req.body ?? {}) : undefined,
  });
}

async function sendResponse(res, response) {
  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.end(await response.text());
}

export default async function handler(req, res) {
  const response = await handleIdeaChoicesRequest(toRequest(req), {
    KKSJ_API_KEY: process.env.KKSJ_API_KEY,
    KKSJ_BASE_URL: process.env.KKSJ_BASE_URL,
    KKSJ_MODEL: process.env.KKSJ_MODEL,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
  });

  await sendResponse(res, response);
}
