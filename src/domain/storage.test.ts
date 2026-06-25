import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialProject } from "./initialProject";
import { exportProjectJson, importProjectJson, loadProject, saveProject } from "./storage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("saves and loads a project", () => {
    const project = createInitialProject();
    project.title = "Lunch Lens";

    saveProject(project);

    expect(loadProject().title).toBe("Lunch Lens");
  });

  it("reports save failure when localStorage cannot write", () => {
    const project = createInitialProject();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    expect(saveProject(project)).toBe(false);
  });

  it("exports and imports JSON", () => {
    const project = createInitialProject();
    project.title = "Lunch Lens";

    const json = exportProjectJson(project);
    const imported = importProjectJson(json);

    expect(imported.title).toBe("Lunch Lens");
    expect(imported.screens).toHaveLength(5);
  });

  it("falls back to a fresh project when saved data is corrupted", () => {
    localStorage.setItem("waicy-project-studio:v1", "{not valid json");

    expect(loadProject()).toEqual(createInitialProject());
    expect(localStorage.getItem("waicy-project-studio:v1")).toBeNull();
  });

  it("fills missing screen fields when importing older JSON", () => {
    const project = createInitialProject();
    project.screens = project.screens.map(({ id, name, job }) => ({
      id,
      name,
      job,
    })) as typeof project.screens;

    const imported = importProjectJson(JSON.stringify(project));

    expect(imported.screens[0].inputNeeded).toBe("");
    expect(imported.screens[0].outputShown).toBe("");
    expect(imported.screens[0].paperSketchReference).toBe("");
  });

  it("normalizes malformed but valid imported JSON", () => {
    const imported = importProjectJson(
      JSON.stringify({
        title: 42,
        problem: 42,
        borrowedPrinciples: ["Apple focus", 3],
        screens: [
          { id: "custom", name: 7, job: 9 },
          {},
          {},
          {},
          {},
        ],
        evidencePack: {
          screenshotList: ["Start", 12],
          pdfOutline: 99,
        },
      }),
    );

    expect(imported.title).toBe("");
    expect(imported.problem).toBe("");
    expect(imported.borrowedPrinciples).toEqual(["Apple focus", ""]);
    expect(imported.screens[0].id).toBe("start");
    expect(imported.screens[0].name).toBe("Start");
    expect(imported.screens[0].job).toBe("");
    expect(imported.evidencePack.screenshotList).toEqual(["Start", ""]);
    expect(imported.evidencePack.pdfOutline).toBe("");
  });
});
