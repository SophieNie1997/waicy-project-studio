import { describe, expect, it, vi } from "vitest";
import { handleIdeaChoicesRequest } from "./ideaChoicesCore.mjs";

const env = {
  KKSJ_API_KEY: "test-secret",
  KKSJ_BASE_URL: "https://api.kksj.org/v1",
  KKSJ_MODEL: "gpt-4o-mini",
  ALLOWED_ORIGIN: "https://sophienie1997.github.io",
};

function makeRequest(body) {
  return new Request("https://worker.example.com/idea-choices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://sophienie1997.github.io",
    },
    body: JSON.stringify(body),
  });
}

describe("idea choices worker", () => {
  it("responds to CORS preflight for the GitHub Pages origin", async () => {
    const response = await handleIdeaChoicesRequest(
      new Request("https://worker.example.com/idea-choices", {
        method: "OPTIONS",
        headers: { Origin: "https://sophienie1997.github.io" },
      }),
      env,
      vi.fn(),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://sophienie1997.github.io");
  });

  it("calls the KKSJ OpenAI-compatible chat endpoint and returns normalized choices", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  choices: {
                    problem: [
                      {
                        label: "Weather outfit panic",
                        value: "Students are unsure which pet clothing is safe for the weather.",
                      },
                    ],
                    user: [
                      {
                        label: "First-time pet carers",
                        value: "Grade 6 students caring for a class pet during a busy school day.",
                      },
                    ],
                  },
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const response = await handleIdeaChoicesRequest(
      makeRequest({
        title: "Pet Clothes Helper",
        seedIdea: "Help students pick safe pet clothes for weather and comfort",
        decisions: [
          { key: "problem", label: "Problem", question: "What annoying moment is worth fixing?", choicesNeeded: 3 },
          { key: "user", label: "Specific user", question: "Who needs help first?", choicesNeeded: 3 },
        ],
      }),
      env,
      fetchMock,
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.kksj.org/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer test-secret",
          "Content-Type": "application/json",
        },
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      model: "gpt-4o-mini",
      messages: expect.any(Array),
    });
    expect(body.choices.problem).toEqual([
      {
        label: "Weather outfit panic",
        value: "Students are unsure which pet clothing is safe for the weather.",
      },
    ]);
    expect(body.choices.user).toEqual([
      {
        label: "First-time pet carers",
        value: "Grade 6 students caring for a class pet during a busy school day.",
      },
    ]);
  });

  it("returns a sanitized error when the backend secret is missing", async () => {
    const response = await handleIdeaChoicesRequest(
      makeRequest({
        title: "Pet Clothes Helper",
        seedIdea: "Help students pick safe pet clothes",
        decisions: [],
      }),
      { KKSJ_API_KEY: "" },
      vi.fn(),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Model backend is not configured." });
  });
});
