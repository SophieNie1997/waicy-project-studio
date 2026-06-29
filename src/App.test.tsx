import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the six student-facing project quest modules", () => {
    render(<App />);

    expect(screen.getByText("Project Quest")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Find Design Moves Lesson 4" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Product Canvas Lesson 4" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Make Idea Real Lesson 4" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Draw App Screens Lesson 5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Build with Codex Lesson 5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Test and Improve Lesson 6" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tell the Story Lesson 6" })).toBeInTheDocument();
    expect(screen.getByText("Today's mission")).toBeInTheDocument();
    expect(screen.getByText("Collect one design move your own app should use.")).toBeInTheDocument();
  });

  it("switches modules through the left rail", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Product Canvas Lesson 4" }));

    expect(screen.getByRole("heading", { name: "Make the idea buildable." })).toBeInTheDocument();
    expect(screen.getByText("Make one idea specific enough that another person can picture it.")).toBeInTheDocument();
  });

  it("records a borrowed design principle", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Borrow this rule" })[0]);

    expect(screen.getByRole("button", { name: "Borrowed" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Design move collected");
    expect(screen.getByRole("status")).toHaveTextContent("1 move in your toolkit");
    expect(screen.getByRole("status")).toHaveTextContent("Next step");
    expect(screen.getByRole("button", { name: "Product Canvas" })).toBeInTheDocument();
    expect(screen.getAllByText("One product, one main message, one clear action.")).toHaveLength(2);
  });

  it("continues from borrowed rules into the Product Canvas", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Borrow this rule" })[0]);
    await user.click(screen.getByRole("button", { name: "Product Canvas" }));

    expect(screen.getByRole("heading", { name: "Make the idea buildable." })).toBeInTheDocument();
  });

  it("carries borrowed design rules into the Product Canvas", async () => {
    const user = userEvent.setup();
    render(<App />);

    const borrowButtons = screen.getAllByRole("button", { name: "Borrow this rule" });
    for (const button of borrowButtons) {
      await user.click(button);
    }
    await user.click(screen.getByRole("button", { name: "Product Canvas" }));

    expect(screen.getByRole("heading", { name: "Design moves you collected" })).toBeInTheDocument();
    expect(screen.getByText("Use these moves while you make product decisions.")).toBeInTheDocument();
    const canvasRules = screen.getByRole("list", { name: "Canvas collected design moves" });
    expect(canvasRules).toHaveClass("canvas-rule-strip-list");
    expect(within(canvasRules).getByText("Focus")).toBeInTheDocument();
    expect(within(canvasRules).getByText("Emotion")).toBeInTheDocument();
    expect(within(canvasRules).getByText("Belonging")).toBeInTheDocument();
    expect(within(canvasRules).getByText("Feedback")).toBeInTheDocument();
    expect(within(canvasRules).getByText("Check: title, seed idea, output.")).toBeInTheDocument();
    expect(within(canvasRules).getByText("Check: output and screen feedback.")).toBeInTheDocument();

    expect(screen.queryByRole("complementary", { name: "Live project check" })).not.toBeInTheDocument();
  });

  it("starts Product Canvas with a focused mission picker", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Product Canvas Lesson 4" }));

    expect(screen.getByRole("heading", { name: "Pick your mission" })).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Tennis Match Coach")).toBeInTheDocument();
    expect(screen.getByText("Fair Fan Debate Coach")).toBeInTheDocument();
    expect(screen.queryByLabelText("Project title")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Specific user")).not.toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "Live project check" })).not.toBeInTheDocument();
  });

  it("turns the Product Canvas form into a step-by-step idea builder after a mission is selected", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Product Canvas Lesson 4" }));
    await user.click(screen.getAllByRole("button", { name: "Use this seed" })[2]);

    expect(screen.getByRole("heading", { name: "Make it specific" })).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
    expect(screen.getByText("Selected mission")).toBeInTheDocument();
    expect(screen.getByLabelText("Project title")).toHaveValue("Soccer Card Scout");
    expect(screen.getByLabelText("Seed idea")).toHaveValue(
      "Help soccer card collectors decide which card fits their collection or trade goal.",
    );
    expect(screen.getByText("Decision 1 of 8")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lunch sorting table" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Lunch sorting table" }));

    expect(screen.getByLabelText("Problem")).toHaveValue("Lunch waste gets sorted wrong when the bins are crowded.");
    expect(screen.queryByRole("complementary", { name: "Live product brief" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next decision" }));

    expect(screen.getByText("Decision 2 of 8")).toBeInTheDocument();
    expect(screen.getByLabelText("Specific user")).toBeInTheDocument();
    expect(screen.queryByLabelText("Problem")).not.toBeInTheDocument();
  });

  it("offers interest-based project seeds for the new students", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Product Canvas Lesson 4" }));

    expect(screen.getByRole("heading", { name: "Start from something they already care about." })).toBeInTheDocument();
    expect(screen.getByText("Tennis Match Coach")).toBeInTheDocument();
    expect(screen.getByText("Lego Build Rescue")).toBeInTheDocument();
    expect(screen.getByText("Soccer Card Scout")).toBeInTheDocument();
    expect(screen.getByText("Fair Fan Debate Coach")).toBeInTheDocument();
  });

  it("turns an interest seed into an editable project draft", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Product Canvas Lesson 4" }));
    await user.click(screen.getAllByRole("button", { name: "Use this seed" })[2]);

    expect(screen.getByLabelText("Project title")).toHaveValue("Soccer Card Scout");
    expect(screen.getByLabelText("Seed idea")).toHaveValue(
      "Help soccer card collectors decide which card fits their collection or trade goal.",
    );
    expect(screen.getByLabelText("Problem")).toHaveValue(
      "Soccer card collectors can argue about cards without a clear way to compare role, stats, rarity, and personal goal.",
    );
    expect(screen.getByText("6/7 ready")).toBeInTheDocument();
  });

  it("keeps teacher checks and paper sketches in separate focused steps", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Product Canvas Lesson 4" }));
    await user.click(screen.getAllByRole("button", { name: "Use this seed" })[3]);

    expect(screen.queryByRole("complementary", { name: "Live project check" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Name the paper sketches" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Check idea" }));

    expect(screen.getByRole("heading", { name: "Check your idea" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Live project check" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Name the paper sketches" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Draw screens" }));

    expect(screen.getByRole("heading", { name: "Draw four screens" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Name the paper sketches" })).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "Live project check" })).not.toBeInTheDocument();
  });

  it("generates idea starter buttons only after students confirm the title and seed idea", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: {
          problem: [
            {
              label: "Weather outfit panic",
              value: "Students are unsure which pet clothing is safe for the weather and the pet.",
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
    });

    vi.stubEnv("VITE_IDEA_CHOICES_ENDPOINT", "/api/idea-choices");
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Product Canvas Lesson 4" }));
    await user.click(screen.getByRole("button", { name: "Start custom idea" }));
    await user.type(screen.getByLabelText("Project title"), "Pet Clothes Helper");
    await user.type(screen.getByLabelText("Seed idea"), "Help students pick safe pet clothes for weather and comfort");

    expect(screen.queryByRole("button", { name: "Weather outfit panic" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm idea" }));

    expect(await screen.findByRole("button", { name: "Weather outfit panic" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("AI choices ready");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/idea-choices",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("Pet Clothes Helper"),
      }),
    );

    await user.click(screen.getByRole("button", { name: "Next decision" }));

    expect(screen.getByRole("button", { name: "First-time pet carers" })).toBeInTheDocument();
  });

  it("uses classroom backup choices when the model endpoint is not configured", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Product Canvas Lesson 4" }));
    await user.click(screen.getByRole("button", { name: "Start custom idea" }));
    await user.type(screen.getByLabelText("Project title"), "Pet Clothes");
    await user.type(screen.getByLabelText("Seed idea"), "Help students choose pet outfits");
    await user.click(screen.getByRole("button", { name: "Confirm idea" }));

    expect(screen.getByRole("status")).toHaveTextContent("Backup choices ready");
    expect(screen.getByRole("button", { name: "Pet Clothes tricky choice" })).toBeInTheDocument();
  });

  it("uses a multiline seed idea field so longer ideas wrap in place", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Product Canvas Lesson 4" }));
    await user.click(screen.getByRole("button", { name: "Start custom idea" }));

    const seedIdeaField = screen.getByLabelText("Seed idea");
    expect(seedIdeaField.tagName).toBe("TEXTAREA");
    expect(seedIdeaField).toHaveClass("seed-idea-textarea");
    expect(seedIdeaField).toHaveAttribute("rows", "2");

    await user.type(seedIdeaField, "Help Grade 6 class pet helpers choose safe and comfortable clothes for rainy days, hot days, and school events.");

    expect(seedIdeaField).toHaveValue(
      "Help Grade 6 class pet helpers choose safe and comfortable clothes for rainy days, hot days, and school events.",
    );
  });

  it("updates the live project check as builder answers become ready", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Product Canvas Lesson 4" }));
    await user.click(screen.getAllByRole("button", { name: "Use this seed" })[2]);
    await user.click(screen.getByRole("button", { name: "Check idea" }));

    const liveCheck = screen.getByRole("complementary", { name: "Live project check" });
    expect(within(liveCheck).getByText("6/7 ready")).toBeInTheDocument();
    expect(within(liveCheck).getByLabelText("Real problem: Ready")).toBeInTheDocument();
    expect(within(liveCheck).getByLabelText("Paper-first screen list: Needs work")).toBeInTheDocument();
  });

  it("lets students complete the paper-first screen list from the Product Canvas", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Product Canvas Lesson 4" }));
    await user.click(screen.getAllByRole("button", { name: "Use this seed" })[0]);
    await user.click(screen.getByRole("button", { name: "Draw screens" }));

    expect(screen.getByRole("heading", { name: "Draw four screens" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Start sketch ref"), "Paper 1");
    await user.type(screen.getByLabelText("Input sketch ref"), "Paper 2");
    await user.type(screen.getByLabelText("AI Result sketch ref"), "Paper 3");
    await user.type(screen.getByLabelText("Human Review sketch ref"), "Paper 4");

    await user.click(screen.getByRole("button", { name: "Check idea" }));
    const liveCheck = screen.getByRole("complementary", { name: "Live project check" });
    expect(within(liveCheck).getByLabelText("Paper-first screen list: Ready")).toBeInTheDocument();
  });

  it("shows website previews that open the original design references", () => {
    render(<App />);

    const expectedReferences = [
      ["Apple", "https://www.apple.com/"],
      ["Nike", "https://www.nike.com/"],
      ["Spotify", "https://www.spotify.com/us/premium/"],
      ["Duolingo App", "https://usabilitygeek.com/ux-case-study-duolingo/"],
    ];

    expectedReferences.forEach(([name, url]) => {
      const previewLink = screen.getByRole("link", { name: `Open ${name} website` });
      const titleLink = screen.getByRole("link", { name: new RegExp(`^${name}:`) });

      expect(previewLink).toHaveAttribute("href", url);
      expect(previewLink).toHaveAttribute("target", "_blank");
      expect(titleLink).toHaveAttribute("href", url);
      expect(screen.getByRole("img", { name: `${name} website preview` })).toBeInTheDocument();
    });
  });

  it("shows Codex as locked before required student decisions are complete", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Build with Codex Lesson 5" }));

    expect(screen.getByText("Codex is locked")).toBeInTheDocument();
  });

  it("keeps teacher tools in a small floating tab until the teacher opens them", async () => {
    const user = userEvent.setup();
    render(<App />);

    const teacherPanel = screen.getByRole("complementary", { name: "Teacher mode" });
    expect(teacherPanel).toHaveClass("teacher-panel-floating");
    expect(teacherPanel).toHaveClass("teacher-panel-collapsed");
    expect(screen.getByText("Teacher mode")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show teacher tools" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("heading", { name: "Codex status" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export JSON" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show teacher tools" }));

    expect(teacherPanel).toHaveClass("teacher-panel-open");
    expect(screen.getByRole("button", { name: "Hide teacher tools" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("heading", { name: "Codex status" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export JSON" })).toBeInTheDocument();
  });

  it("guides UI sketching one screen at a time", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Draw App Screens Lesson 5" }));

    expect(screen.getAllByText("Screen 1 of 5")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Start" })).toBeInTheDocument();
    expect(screen.getByLabelText("Start paper sketch ref")).toBeInTheDocument();
    expect(screen.queryByLabelText("Input paper sketch ref")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next screen" }));

    expect(screen.getAllByText("Screen 2 of 5")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Input" })).toBeInTheDocument();
    expect(screen.getByLabelText("Input paper sketch ref")).toBeInTheDocument();
    expect(screen.queryByLabelText("Start paper sketch ref")).not.toBeInTheDocument();
  });

  it("opens the Evidence Pack module", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Tell the Story Lesson 6" }));

    expect(screen.getByRole("heading", { name: "Turn process into story." })).toBeInTheDocument();
  });
});
