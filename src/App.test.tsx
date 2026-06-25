import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
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

    expect(screen.getByRole("heading", { name: "Product Canvas" })).toBeInTheDocument();
  });
});
