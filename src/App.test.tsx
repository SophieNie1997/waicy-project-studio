import { render, screen } from "@testing-library/react";
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
  });

  it("shows website previews that open the original design references", () => {
    render(<App />);

    const expectedReferences = [
      ["Apple", "https://www.apple.com/"],
      ["Stripe", "https://stripe.com/"],
      ["Linear", "https://linear.app/"],
      ["Duolingo", "https://www.duolingo.com/"],
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
