import { describe, expect, it, vi } from "vitest";
import handler from "./idea-choices.mjs";

function createMockResponse() {
  const response = {
    statusCode: 200,
    headers: {},
    body: "",
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(body = "") {
      this.body = body;
      return this;
    },
  };

  return response;
}

describe("Vercel idea choices API", () => {
  it("adapts a Vercel request to the shared model proxy handler", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  choices: {
                    problem: [{ label: "Pet coat weather check", value: "Students need to know when a pet coat is safe." }],
                  },
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const req = {
      method: "POST",
      headers: {
        origin: "https://sophienie1997.github.io",
        "content-type": "application/json",
      },
      body: {
        title: "Pet Clothes Helper",
        seedIdea: "Help students choose safe pet outfits",
        decisions: [{ key: "problem", label: "Problem", question: "What is hard?", choicesNeeded: 3 }],
      },
    };
    const res = createMockResponse();

    process.env.KKSJ_API_KEY = "test-secret";
    process.env.KKSJ_BASE_URL = "https://api.kksj.org/v1";
    process.env.KKSJ_MODEL = "gpt-4o-mini";
    process.env.ALLOWED_ORIGIN = "https://sophienie1997.github.io";

    try {
      await handler(req, res);
    } finally {
      fetchMock.mockRestore();
      delete process.env.KKSJ_API_KEY;
      delete process.env.KKSJ_BASE_URL;
      delete process.env.KKSJ_MODEL;
      delete process.env.ALLOWED_ORIGIN;
    }

    expect(res.statusCode).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe("https://sophienie1997.github.io");
    expect(JSON.parse(res.body)).toEqual({
      choices: {
        problem: [{ label: "Pet coat weather check", value: "Students need to know when a pet coat is safe." }],
      },
    });
  });
});
