import { describe, expect, it } from "vitest";
import { createInitialProject } from "./initialProject";
import { generateEvidencePack } from "./evidence";

describe("generateEvidencePack", () => {
  it("creates what why how impact outlines from project data", () => {
    const project = createInitialProject();
    project.title = "Lunch Lens";
    project.problem = "Students forget how to sort lunch leftovers.";
    project.user = "Grade 6 international school students";
    project.input = "A leftover item description";
    project.aiAction = "Classify the leftover";
    project.output = "A bin recommendation";
    project.impact = "Cleaner sorting and less lunch waste";
    project.responsibleAiNote = "Students should check the school sorting poster.";
    project.testNotes = [
      {
        id: "test-1",
        tester: "Peer tester",
        task: "Try the sorting flow",
        pausePoint: "AI Result",
        confusion: "The recommendation needed a reason",
        whatWorked: "The start screen was clear",
        chosenImprovement: "Add a short explanation under the result",
      },
    ];

    const pack = generateEvidencePack(project);

    expect(pack.pdfOutline).toContain("What");
    expect(pack.pdfOutline).toContain("Why");
    expect(pack.pdfOutline).toContain("How");
    expect(pack.pdfOutline).toContain("Impact");
    expect(pack.videoScriptOutline).toContain("Lunch Lens");
    expect(pack.impactNotes).toContain("Add a short explanation");
    expect(pack.screenshotList).toHaveLength(5);
    expect(pack.prototypeFlow).toContain("Start -> Input -> AI Result");
    expect(pack.pdfOutline).toContain("Responsible AI statement");
    expect(pack.pdfOutline).toContain("Before and after comparison");
  });
});
