import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the six Mission Control modules", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Design Gallery Lesson 4" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Product Canvas Lesson 4" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "UI Sketch Lab Lesson 5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Codex Build Desk Lesson 5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Test & Iterate Lesson 6" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Evidence Pack Lesson 6" })).toBeInTheDocument();
  });

  it("switches modules through the left rail", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Product Canvas Lesson 4" }));

    expect(screen.getByRole("heading", { name: "Make the idea buildable." })).toBeInTheDocument();
  });

  it("records a borrowed design principle", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Borrow this rule" })[0]);

    expect(screen.getByRole("button", { name: "Borrowed" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("1 design rule borrowed");
    expect(screen.getByRole("status")).toHaveTextContent("Next step");
    expect(screen.getByRole("button", { name: "Go to Product Canvas" })).toBeInTheDocument();
    expect(screen.getAllByText("One product, one main message, one clear action.")).toHaveLength(3);
  });

  it("continues from borrowed rules into the Product Canvas", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Borrow this rule" })[0]);
    await user.click(screen.getByRole("button", { name: "Go to Product Canvas" }));

    expect(screen.getByRole("heading", { name: "Make the idea buildable." })).toBeInTheDocument();
  });

  it("carries borrowed design rules into the Product Canvas", async () => {
    const user = userEvent.setup();
    render(<App />);

    const borrowButtons = screen.getAllByRole("button", { name: "Borrow this rule" });
    for (const button of borrowButtons) {
      await user.click(button);
    }
    await user.click(screen.getByRole("button", { name: "Go to Product Canvas" }));

    expect(screen.getByRole("heading", { name: "Borrowed design rules" })).toBeInTheDocument();
    expect(screen.getByText("Use these as decision checks while filling the canvas.")).toBeInTheDocument();
    const canvasRules = screen.getByRole("list", { name: "Canvas borrowed design rules" });
    expect(within(canvasRules).getByText("One product, one main message, one clear action.")).toBeInTheDocument();
    expect(
      within(canvasRules).getByText("Use one strong visual and a few powerful words to make people feel something."),
    ).toBeInTheDocument();
    expect(
      within(canvasRules).getByText("Make the user feel the product understands their taste, identity, or mood."),
    ).toBeInTheDocument();
    expect(
      within(canvasRules).getByText("Give fast feedback through color, sound, progress, and rewards."),
    ).toBeInTheDocument();
    expect(within(canvasRules).getAllByText("Where this should show up:")).toHaveLength(4);
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

    await user.click(screen.getByRole("button", { name: "Codex Build Desk Lesson 5" }));

    expect(screen.getByText("Codex is locked")).toBeInTheDocument();
  });

  it("opens the Evidence Pack module", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Evidence Pack Lesson 6" }));

    expect(screen.getByRole("heading", { name: "Turn process into story." })).toBeInTheDocument();
  });
});
