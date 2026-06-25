import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the six student-facing project quest modules", () => {
    render(<App />);

    expect(screen.getByText("Project Quest")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Find Design Moves Lesson 4" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Make Idea Real Lesson 4" })).toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: "Make Idea Real Lesson 4" }));

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
    expect(screen.getByRole("button", { name: "Make Idea Real" })).toBeInTheDocument();
    expect(screen.getAllByText("One product, one main message, one clear action.")).toHaveLength(2);
  });

  it("continues from borrowed rules into the Product Canvas", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Borrow this rule" })[0]);
    await user.click(screen.getByRole("button", { name: "Make Idea Real" }));

    expect(screen.getByRole("heading", { name: "Make the idea buildable." })).toBeInTheDocument();
  });

  it("carries borrowed design rules into the Product Canvas", async () => {
    const user = userEvent.setup();
    render(<App />);

    const borrowButtons = screen.getAllByRole("button", { name: "Borrow this rule" });
    for (const button of borrowButtons) {
      await user.click(button);
    }
    await user.click(screen.getByRole("button", { name: "Make Idea Real" }));

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

    const specificityCheck = screen.getByRole("complementary", { name: "Specificity check" });
    expect(within(specificityCheck).queryByText("Focus")).not.toBeInTheDocument();
  });

  it("turns the Product Canvas form into a step-by-step idea builder", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Make Idea Real Lesson 4" }));

    expect(screen.getByRole("heading", { name: "Idea Builder" })).toBeInTheDocument();
    expect(screen.getByText("Decision 1 of 8")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lunch sorting table" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Specific user")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Lunch sorting table" }));

    expect(screen.getByLabelText("Problem")).toHaveValue("Lunch waste gets sorted wrong when the bins are crowded.");
    expect(screen.getByText(/This project helps .*lunch waste gets sorted wrong/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next decision" }));

    expect(screen.getByText("Decision 2 of 8")).toBeInTheDocument();
    expect(screen.getByLabelText("Specific user")).toBeInTheDocument();
    expect(screen.queryByLabelText("Problem")).not.toBeInTheDocument();
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

  it("keeps teacher tools folded until the teacher opens them", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText("Teacher mode")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show teacher tools" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export JSON" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show teacher tools" }));

    expect(screen.getByRole("button", { name: "Hide teacher tools" })).toBeInTheDocument();
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
